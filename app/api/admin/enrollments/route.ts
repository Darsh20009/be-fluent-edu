import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { enrollmentCreateSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function GET(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageEnrollments')
  if (isNextResponse(access)) return access

  const status = request.nextUrl.searchParams.get('status') || undefined
  const groupId = request.nextUrl.searchParams.get('groupId') || undefined
  const studentId = request.nextUrl.searchParams.get('studentId') || undefined
  const items = await prisma.enrollment.findMany({
    where: { status, groupId, studentId },
    include: {
      student: { select: { id: true, name: true, email: true, status: true } },
      subscription: { include: { Package: true } },
      package: true,
      group: { include: { level: true, stage: true, teacher: { include: { User: true } } } },
      teacher: { include: { User: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageEnrollments')
  if (isNextResponse(access)) return access

  const parsed = enrollmentCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const body = parsed.data

  const [student, subscription, duplicate] = await Promise.all([
    prisma.user.findUnique({ where: { id: body.studentId }, include: { StudentProfile: true } }),
    prisma.subscription.findUnique({ where: { id: body.subscriptionId }, include: { Package: true } }),
    prisma.enrollment.findFirst({
      where: { studentId: body.studentId, status: { in: ['PENDING', 'ACTIVE', 'PROPOSED', 'STUDENT_ACCEPTED'] } },
    }),
  ])

  if (!student || student.role !== 'STUDENT') {
    return NextResponse.json({ ok: false, error: { code: 'STUDENT_NOT_FOUND', message: 'Student not found' } }, { status: 404 })
  }
  if (!subscription || subscription.studentId !== student.id) {
    return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_NOT_FOUND', message: 'Usable subscription not found' } }, { status: 404 })
  }
  if (subscription.status !== 'APPROVED') {
    return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_NOT_USABLE', message: 'Subscription is not approved' } }, { status: 409 })
  }
  const expectedType = subscription.subscriptionType ?? subscription.Package.subscriptionType
  if (expectedType && expectedType !== body.subscriptionType) {
    return NextResponse.json({ ok: false, error: { code: 'TYPE_MISMATCH', message: 'Subscription type is incompatible' } }, { status: 409 })
  }
  if (duplicate) {
    return NextResponse.json({ ok: false, error: { code: 'DUPLICATE_ENROLLMENT', message: 'Student already has an active or pending enrollment' } }, { status: 409 })
  }

  let group = null
  if (body.groupId) {
    group = await prisma.learningGroup.findUnique({
      where: { id: body.groupId },
      include: { members: { where: { status: 'ACTIVE' } } },
    })
    if (!group || group.status !== 'ACTIVE') {
      return NextResponse.json({ ok: false, error: { code: 'GROUP_NOT_USABLE', message: 'Group is not active' } }, { status: 409 })
    }
    if (group.subscriptionType !== body.subscriptionType) {
      return NextResponse.json({ ok: false, error: { code: 'GROUP_TYPE_MISMATCH', message: 'Group subscription type is incompatible' } }, { status: 409 })
    }
    if (group.capacity != null && group.members.length >= group.capacity) {
      return NextResponse.json({ ok: false, error: { code: 'GROUP_FULL', message: 'Group capacity has been reached' } }, { status: 409 })
    }
    const profile = student.StudentProfile
    if (group.levelId && profile?.officialLevelId !== group.levelId) {
      return NextResponse.json({ ok: false, error: { code: 'LEVEL_MISMATCH', message: 'Student level is incompatible with group' } }, { status: 409 })
    }
    if (group.stageId && profile?.officialStageId !== group.stageId) {
      return NextResponse.json({ ok: false, error: { code: 'STAGE_MISMATCH', message: 'Student stage is incompatible with group' } }, { status: 409 })
    }
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    const created = await tx.enrollment.create({
      data: {
        studentId: body.studentId,
        subscriptionId: body.subscriptionId,
        packageId: body.packageId ?? subscription.packageId,
        groupId: body.groupId,
        teacherProfileId: body.teacherProfileId,
        subscriptionType: body.subscriptionType,
        status: 'ACTIVE',
        startsAt: body.startsAt,
        endsAt: body.endsAt,
      },
    })
    if (group) {
      await tx.groupMember.create({
        data: { groupId: group.id, userId: body.studentId, enrollmentId: created.id },
      })
    }
    return created
  })

  await recordAuditEvent({
    action: 'ENROLLMENT_CHANGE',
    userId: access.userId,
    details: { enrollmentId: enrollment.id, studentId: body.studentId, action: 'CREATED', groupId: body.groupId ?? null },
  }).catch(() => undefined)
  return NextResponse.json(enrollment, { status: 201 })
}