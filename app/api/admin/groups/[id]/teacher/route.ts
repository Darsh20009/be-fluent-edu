import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard, teacherAssignmentSchema, validationError } from '@/lib/phase5'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = teacherAssignmentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params

  if (parsed.data.teacherProfileId) {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: parsed.data.teacherProfileId }, include: { User: true } })
    if (!teacher || !teacher.User.isActive || teacher.User.status === 'SUSPENDED') {
      return NextResponse.json({ ok: false, error: { code: 'TEACHER_NOT_AVAILABLE', message: 'Teacher is not available' } }, { status: 409 })
    }
  }
  const group = await prisma.learningGroup.update({
    where: { id },
    data: { teacherProfileId: parsed.data.teacherProfileId },
  })
  await recordAuditEvent({
    action: 'TEACHER_ASSIGNMENT',
    userId: access.userId,
    details: { groupId: id, assigned: Boolean(parsed.data.teacherProfileId) },
  }).catch(() => undefined)
  return NextResponse.json(group)
}