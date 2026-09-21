import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { groupMemberSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = groupMemberSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const { userId, enrollmentId, action } = parsed.data

  const [group, user, existing] = await Promise.all([
    prisma.learningGroup.findUnique({ where: { id }, include: { members: { where: { status: 'ACTIVE' } } } }),
    prisma.user.findUnique({ where: { id: userId }, include: { StudentProfile: true } }),
    prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: id, userId } } }),
  ])
  if (!group) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Group not found' } }, { status: 404 })
  if (!user || user.role !== 'STUDENT') return NextResponse.json({ ok: false, error: { code: 'STUDENT_NOT_FOUND', message: 'Student not found' } }, { status: 404 })

  if (action === 'REMOVE') {
    if (!existing || existing.status !== 'ACTIVE') {
      return NextResponse.json({ ok: false, error: { code: 'MEMBER_NOT_FOUND', message: 'Active group member not found' } }, { status: 404 })
    }
    const member = await prisma.groupMember.update({
      where: { id: existing.id },
      data: { status: 'LEFT', leftAt: new Date() },
    })
    await recordAuditEvent({ action: 'GROUP_ASSIGNMENT', userId: access.userId, details: { groupId: id, studentId: userId, action: 'REMOVED' } }).catch(() => undefined)
    return NextResponse.json(member)
  }

  if (group.status !== 'ACTIVE') {
    return NextResponse.json({ ok: false, error: { code: 'GROUP_NOT_ACTIVE', message: 'Group is not active' } }, { status: 409 })
  }
  if (group.capacity != null && group.members.length >= group.capacity && existing?.status !== 'ACTIVE') {
    return NextResponse.json({ ok: false, error: { code: 'GROUP_FULL', message: 'Group capacity has been reached' } }, { status: 409 })
  }
  if (group.levelId && user.StudentProfile?.officialLevelId !== group.levelId) {
    return NextResponse.json({ ok: false, error: { code: 'LEVEL_MISMATCH', message: 'Student level is incompatible' } }, { status: 409 })
  }
  if (group.stageId && user.StudentProfile?.officialStageId !== group.stageId) {
    return NextResponse.json({ ok: false, error: { code: 'STAGE_MISMATCH', message: 'Student stage is incompatible' } }, { status: 409 })
  }
  if (enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } })
    if (!enrollment || enrollment.studentId !== userId || enrollment.subscriptionType !== group.subscriptionType || !['ACTIVE', 'PENDING'].includes(enrollment.status)) {
      return NextResponse.json({ ok: false, error: { code: 'ENROLLMENT_MISMATCH', message: 'Enrollment is incompatible with this group' } }, { status: 409 })
    }
  }

  const member = existing
    ? await prisma.groupMember.update({ where: { id: existing.id }, data: { status: 'ACTIVE', enrollmentId, joinedAt: new Date(), leftAt: null } })
    : await prisma.groupMember.create({ data: { groupId: id, userId, enrollmentId } })
  await recordAuditEvent({ action: 'GROUP_ASSIGNMENT', userId: access.userId, details: { groupId: id, studentId: userId, action: 'ADDED' } }).catch(() => undefined)
  return NextResponse.json(member, { status: existing ? 200 : 201 })
}