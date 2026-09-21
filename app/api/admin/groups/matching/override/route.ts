import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard, validationError } from '@/lib/phase5'

const overrideSchema = z.object({
  enrollmentId: z.string().trim().min(1),
  groupId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(1000),
})

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = overrideSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)

  const [enrollment, group] = await Promise.all([
    prisma.enrollment.findUnique({ where: { id: parsed.data.enrollmentId } }),
    prisma.learningGroup.findUnique({ where: { id: parsed.data.groupId }, include: { members: { where: { status: 'ACTIVE' } } } }),
  ])
  if (!enrollment || !group) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Enrollment or group not found' } }, { status: 404 })
  if (group.capacity != null && group.members.length >= group.capacity) {
    return NextResponse.json({ ok: false, error: { code: 'GROUP_FULL', message: 'Admin override cannot exceed hard capacity' } }, { status: 409 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({ where: { id: enrollment.id }, data: { groupId: group.id, status: 'ACTIVE' } })
    await tx.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: enrollment.studentId } },
      create: { groupId: group.id, userId: enrollment.studentId, enrollmentId: enrollment.id },
      update: { status: 'ACTIVE', enrollmentId: enrollment.id, joinedAt: new Date(), leftAt: null },
    })
  })
  await recordAuditEvent({
    action: 'GROUP_MATCH_OVERRIDE',
    userId: access.userId,
    details: { enrollmentId: enrollment.id, groupId: group.id, reason: parsed.data.reason },
  }).catch(() => undefined)
  return NextResponse.json({ ok: true })
}