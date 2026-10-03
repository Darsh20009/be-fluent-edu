import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { groupProposalTransition, phase5DatabaseGuard } from '@/lib/phase5'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageEnrollments')
  if (isNextResponse(access)) return access
  const { id } = await context.params

  const existing = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: { include: { StudentProfile: true } },
      subscription: true,
      group: { include: { members: { where: { status: 'ACTIVE' } } } },
    },
  })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 })
  if (!groupProposalTransition(existing.status, 'APPROVE')) {
    return NextResponse.json({ ok: false, error: { code: 'STUDENT_ACCEPTANCE_REQUIRED' } }, { status: 409 })
  }
  const group = existing.group
  if (!group || group.status !== 'ACTIVE' || !group.teacherProfileId) {
    return NextResponse.json({ ok: false, error: { code: 'GROUP_NOT_USABLE' } }, { status: 409 })
  }
  if (!existing.subscription || existing.subscription.status !== 'APPROVED'
    || (existing.subscription.groupId && existing.subscription.groupId !== group.id)) {
    return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_NOT_USABLE' } }, { status: 409 })
  }
  if (!existing.student.isActive) {
    return NextResponse.json({ ok: false, error: { code: 'STUDENT_NOT_ACTIVE' } }, { status: 409 })
  }
  if (group.subscriptionType !== existing.subscriptionType
    || (group.levelId && group.levelId !== existing.student.StudentProfile?.officialLevelId)
    || (group.stageId && group.stageId !== existing.student.StudentProfile?.officialStageId)) {
    return NextResponse.json({ ok: false, error: { code: 'GROUP_NO_LONGER_MATCHES' } }, { status: 409 })
  }
  if (group.capacity != null && group.members.length >= group.capacity) {
    return NextResponse.json({ ok: false, error: { code: 'GROUP_FULL' } }, { status: 409 })
  }

  let updated
  try {
    updated = await prisma.$transaction(async (tx) => {
    const current = await tx.enrollment.findUnique({ where: { id }, select: { status: true, studentId: true, groupId: true } })
    if (!current || current.status !== 'STUDENT_ACCEPTED' || current.studentId !== existing.studentId || current.groupId !== group.id) {
      throw new Error('GROUP_PROPOSAL_CONFLICT')
    }
    const memberCount = await tx.groupMember.count({ where: { groupId: group.id, status: 'ACTIVE' } })
    if (group.capacity != null && memberCount >= group.capacity) throw new Error('GROUP_FULL')
    const activeMembership = await tx.groupMember.findFirst({
      where: { userId: existing.studentId, status: 'ACTIVE' },
      select: { id: true, groupId: true, enrollmentId: true },
    })
    if (activeMembership && (activeMembership.groupId !== group.id || activeMembership.enrollmentId !== id)) {
      throw new Error('STUDENT_ALREADY_ASSIGNED')
    }
    const member = await tx.groupMember.findFirst({ where: { groupId: group.id, userId: existing.studentId } })
    if (member?.status === 'ACTIVE' && member.enrollmentId !== id) throw new Error('STUDENT_ALREADY_ASSIGNED')
    if (member) {
      await tx.groupMember.update({
        where: { id: member.id },
        data: { status: 'ACTIVE', enrollmentId: id, joinedAt: new Date(), leftAt: null },
      })
    } else {
      await tx.groupMember.create({ data: { groupId: group.id, userId: existing.studentId, enrollmentId: id } })
    }
    const changed = await tx.enrollment.updateMany({
      where: { id, status: 'STUDENT_ACCEPTED' },
      data: { status: 'ACTIVE', teacherProfileId: group.teacherProfileId },
    })
    if (changed.count !== 1) throw new Error('GROUP_PROPOSAL_CONFLICT')
    await tx.subscription.update({
      where: { id: existing.subscription!.id },
      data: { groupId: group.id, assignedTeacherId: group.teacherProfileId },
    })
    await queuePhase7Notifications({
      event: 'group.assigned',
      entityId: id,
      recipientUserId: existing.studentId,
      title: 'Your group assignment is confirmed',
      body: group.name,
      payload: {
        href: '/dashboard/student/classes',
        titleAr: 'تم تأكيد تعيين مجموعتك',
        bodyAr: group.nameAr || group.name,
      },
    }, tx)
    const result = await tx.enrollment.findUnique({ where: { id } })
    if (!result) throw new Error('GROUP_PROPOSAL_CONFLICT')
    return result
    })
  } catch (error) {
    if (error instanceof Error && ['GROUP_PROPOSAL_CONFLICT', 'GROUP_FULL', 'STUDENT_ALREADY_ASSIGNED'].includes(error.message)) {
      const code = error.message === 'GROUP_FULL' ? 'GROUP_FULL' : error.message === 'STUDENT_ALREADY_ASSIGNED' ? 'STUDENT_ALREADY_ASSIGNED' : 'CONFLICT'
      return NextResponse.json({ ok: false, error: { code } }, { status: 409 })
    }
    throw error
  }
  if (!updated) return NextResponse.json({ ok: false, error: { code: 'CONFLICT' } }, { status: 409 })

  await recordAuditEvent({
    action: 'GROUP_CHANGE',
    userId: access.userId,
    details: { enrollmentId: id, studentId: existing.studentId, action: 'PROPOSAL_APPROVED', groupId: group.id },
  }).catch(() => undefined)
  return NextResponse.json({ ok: true, enrollment: updated })
}