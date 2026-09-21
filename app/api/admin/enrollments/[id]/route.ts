import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { enrollmentStatusSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageEnrollments')
  if (isNextResponse(access)) return access
  const { id } = await params
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: { student: true, subscription: { include: { Package: true } }, package: true, group: true, teacher: { include: { User: true } } },
  })
  if (!enrollment) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Enrollment not found' } }, { status: 404 })
  return NextResponse.json(enrollment)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageEnrollments')
  if (isNextResponse(access)) return access
  const parsed = enrollmentStatusSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const existing = await prisma.enrollment.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Enrollment not found' } }, { status: 404 })
  if (!['ACTIVE', 'PENDING'].includes(existing.status)) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_STATE', message: 'Enrollment is already closed' } }, { status: 409 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.update({
      where: { id },
      data: { status: parsed.data.status, endsAt: existing.endsAt ?? new Date() },
    })
    if (existing.groupId) {
      await tx.groupMember.updateMany({
        where: { groupId: existing.groupId, userId: existing.studentId, status: 'ACTIVE' },
        data: { status: 'LEFT', leftAt: new Date() },
      })
    }
    return enrollment
  })
  await recordAuditEvent({ action: 'ENROLLMENT_CHANGE', userId: access.userId, details: { enrollmentId: id, action: parsed.data.status } }).catch(() => undefined)
  return NextResponse.json(updated)
}