import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { matchingSchema, phase5DatabaseGuard, rankMatchingGroups, sharedAvailabilitySlots, validationError } from '@/lib/phase5'
import { studentAvailabilitySlotSchema } from '@/lib/phase4'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'
import { recordAuditEvent } from '@/lib/audit'

function readCurrentAvailability(value: string | null, month: string | null) {
  if (!value || !month) return null
  const now = new Date()
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  if (month < currentMonth) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const data = parsed as { timezone?: unknown; slots?: unknown }
    if (typeof data.timezone !== 'string' || !Array.isArray(data.slots)) return null
    const slots = data.slots.map((slot) => studentAvailabilitySlotSchema.safeParse(slot))
      .filter((result) => result.success)
      .map((result) => result.data)
    return slots.length ? { timezone: data.timezone, slots, month } : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = matchingSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const body = parsed.data
  const student = await prisma.user.findUnique({
    where: { id: body.studentId },
    select: {
      id: true,
      role: true,
      StudentProfile: { select: { officialLevelId: true, officialStageId: true, availabilityMonth: true, availabilityJson: true } },
    },
  })
  if (!student || student.role !== 'STUDENT') {
    return NextResponse.json({ ok: false, error: { code: 'STUDENT_NOT_FOUND' } }, { status: 404 })
  }
  const storedAvailability = readCurrentAvailability(
    student.StudentProfile?.availabilityJson || null,
    student.StudentProfile?.availabilityMonth || null,
  )
  const matchingRequest = {
    ...body,
    levelId: student.StudentProfile?.officialLevelId ?? body.levelId,
    stageId: student.StudentProfile?.officialStageId ?? body.stageId,
    availabilityTimezone: storedAvailability?.timezone,
    availabilitySlots: storedAvailability?.slots || [],
  }
  if (!matchingRequest.levelId) {
    return NextResponse.json({ ok: false, error: { code: 'OFFICIAL_LEVEL_REQUIRED' } }, { status: 409 })
  }
  const groups = await prisma.learningGroup.findMany({
    where: {
      status: 'ACTIVE',
      subscriptionType: body.subscriptionType,
      ...(matchingRequest.levelId ? { levelId: matchingRequest.levelId } : {}),
      ...(matchingRequest.stageId ? { stageId: matchingRequest.stageId } : {}),
    },
    include: {
      members: { where: { status: 'ACTIVE' } },
      schedules: true,
      teacher: { include: { User: { select: { name: true } } } },
    },
  })
  const candidates = rankMatchingGroups(
    groups.map((group) => ({
      id: group.id,
      levelId: group.levelId,
      stageId: group.stageId,
      subscriptionType: group.subscriptionType,
      teacherProfileId: group.teacherProfileId,
      capacity: group.capacity,
      activeMemberCount: group.members.length,
      status: group.status,
      schedules: group.schedules,
    })),
    matchingRequest,
  )
  const candidateDetails = candidates.map((candidate) => {
    const group = groups.find((item) => item.id === candidate.groupId)
    return {
      ...candidate,
      name: group?.name || candidate.groupId,
      nameAr: group?.nameAr || null,
      timezone: group?.timezone || group?.schedules[0]?.timezone || null,
      teacherName: group?.teacher?.User.name || null,
      schedules: group?.schedules.filter((schedule) => schedule.status === 'ACTIVE') || [],
    }
  })
  let duoPartnerCandidates: Array<{
    subscriptionId: string
    studentId: string
    studentName: string
    availabilityMonth: string
    sharedMinutes: number
    sharedSlots: ReturnType<typeof sharedAvailabilitySlots>
  }> = []
  if (body.subscriptionType === 'DUO' && matchingRequest.levelId && storedAvailability) {
    const partnerRows = await prisma.subscription.findMany({
      where: {
        studentId: { not: student.id },
        status: 'APPROVED',
        groupId: null,
        OR: [{ subscriptionType: 'DUO' }, { subscriptionType: null, Package: { subscriptionType: 'DUO' } }],
      },
      include: {
        Package: { select: { subscriptionType: true } },
        User: {
          select: {
            id: true,
            name: true,
            role: true,
            isActive: true,
            StudentProfile: { select: { officialLevelId: true, officialStageId: true, availabilityMonth: true, availabilityJson: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })
    const potential = partnerRows.filter((row) =>
      (row.subscriptionType ?? row.Package.subscriptionType) === 'DUO'
      && row.User.role === 'STUDENT'
      && row.User.isActive
      && row.User.StudentProfile?.officialLevelId === matchingRequest.levelId
      && (row.User.StudentProfile?.officialStageId || null) === (matchingRequest.stageId || null),
    )
    const enrollmentRows = potential.length
      ? await prisma.enrollment.findMany({
          where: {
            subscriptionId: { in: potential.map((row) => row.id) },
            status: { in: ['PENDING', 'ACTIVE', 'PROPOSED', 'STUDENT_ACCEPTED'] },
          },
          select: { subscriptionId: true },
        })
      : []
    const busySubscriptions = new Set(enrollmentRows.map((row) => row.subscriptionId).filter(Boolean))
    const seenStudents = new Set<string>()
    duoPartnerCandidates = potential.flatMap((row) => {
      if (busySubscriptions.has(row.id) || seenStudents.has(row.studentId)) return []
      const profile = row.User.StudentProfile
      if (!profile || profile.availabilityMonth !== storedAvailability.month) return []
      const availability = readCurrentAvailability(profile.availabilityJson, profile.availabilityMonth)
      if (!availability) return []
      const sharedSlots = sharedAvailabilitySlots(storedAvailability, availability)
      if (!sharedSlots.length) return []
      seenStudents.add(row.studentId)
      return [{
        subscriptionId: row.id,
        studentId: row.studentId,
        studentName: row.User.name,
        availabilityMonth: availability.month,
        sharedMinutes: sharedSlots.reduce((sum, slot) => sum + slot.durationMinutes, 0),
        sharedSlots,
      }]
    }).sort((left, right) => right.sharedMinutes - left.sharedMinutes).slice(0, 20)
  }
  let proposedEnrollment: { id: string; status: string; groupId: string | null } | null = null
  if (body.proposeGroupId) {
    const candidate = candidates.find((item) => item.groupId === body.proposeGroupId)
    if (!candidate) {
      return NextResponse.json({ ok: false, error: { code: 'GROUP_NOT_MATCHED' } }, { status: 409 })
    }
    const [subscription, existing] = await Promise.all([
      prisma.subscription.findUnique({ where: { id: body.subscriptionId! }, include: { Package: true } }),
      prisma.enrollment.findFirst({
        where: { subscriptionId: body.subscriptionId, status: { in: ['PROPOSED', 'STUDENT_ACCEPTED', 'PENDING', 'ACTIVE'] } },
      }),
    ])
    if (!subscription || subscription.studentId !== student.id) {
      return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_NOT_FOUND' } }, { status: 404 })
    }
    const subscriptionType = subscription.subscriptionType ?? subscription.Package.subscriptionType
    if (subscription.status !== 'APPROVED' || subscription.groupId || subscriptionType !== body.subscriptionType) {
      return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_NOT_PROPOSABLE' } }, { status: 409 })
    }
    if (existing) {
      if (existing.status === 'PROPOSED' && existing.groupId === candidate.groupId) {
        proposedEnrollment = { id: existing.id, status: existing.status, groupId: existing.groupId }
      } else {
        return NextResponse.json({ ok: false, error: { code: 'ENROLLMENT_ALREADY_EXISTS' } }, { status: 409 })
      }
    } else {
      const group = groups.find((item) => item.id === candidate.groupId)
      if (!group) return NextResponse.json({ ok: false, error: { code: 'GROUP_NOT_FOUND' } }, { status: 404 })
      const created = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          subscriptionId: subscription.id,
          packageId: subscription.packageId,
          groupId: group.id,
          teacherProfileId: group.teacherProfileId,
          subscriptionType: body.subscriptionType,
          startsAt: subscription.startDate,
          endsAt: subscription.endDate,
          status: 'PROPOSED',
        },
        select: { id: true, status: true, groupId: true },
      })
      proposedEnrollment = created
    }
    await queuePhase7Notifications({
      event: 'group.proposal',
      entityId: proposedEnrollment.id,
      recipientUserId: student.id,
      title: 'A group suggestion is ready',
      body: 'Review the suggested class time before your group assignment is confirmed.',
      payload: {
        href: '/dashboard/student/group-proposal',
        titleAr: 'لديك اقتراح مجموعة للمراجعة',
        bodyAr: 'راجع موعد المجموعة المقترحة قبل تأكيد تعيينك.',
      },
    })
    await recordAuditEvent({
      action: 'GROUP_CHANGE',
      userId: access.userId,
      details: { enrollmentId: proposedEnrollment.id, studentId: student.id, action: 'PROPOSED', groupId: proposedEnrollment.groupId },
    }).catch(() => undefined)
  }
  return NextResponse.json({
    candidates: candidateDetails,
    availability: {
      month: storedAvailability?.month || null,
      timezone: storedAvailability?.timezone || null,
      slotCount: storedAvailability?.slots.length || 0,
    },
    duoPartnerCandidates,
    proposedEnrollment,
  })
}