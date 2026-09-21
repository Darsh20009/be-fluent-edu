import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard, subscriptionStatusSchema, validationError } from '@/lib/phase5'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSubscriptions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const item = await prisma.subscription.findUnique({
    where: { id },
    include: { User: true, Package: true, AssignedTeacher: { include: { User: true } }, group: true, Enrollment: true },
  })
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSubscriptions')
  if (isNextResponse(access)) return access
  const parsed = subscriptionStatusSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const existing = await prisma.subscription.findUnique({ where: { id }, include: { Package: true } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } }, { status: 404 })
  const allowed: Record<string, string[]> = {
    PENDING: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: [],
    REJECTED: [],
  }
  if (!allowed[existing.status].includes(parsed.data.status)) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_LIFECYCLE', message: 'Subscription status transition is not allowed' } }, { status: 409 })
  }
  const now = new Date()
  const item = await prisma.subscription.update({
    where: { id },
    data: {
      status: parsed.data.status,
      assignedTeacherId: parsed.data.assignedTeacherId,
      groupId: parsed.data.groupId,
      adminNotes: parsed.data.adminNotes,
      ...(parsed.data.status === 'APPROVED' ? {
        approvedAt: now,
        paid: true,
        startDate: existing.startDate ?? now,
        endDate: existing.endDate ?? new Date(now.getTime() + existing.Package.durationDays * 86_400_000),
      } : {}),
      ...(parsed.data.status === 'REJECTED' ? { rejectedAt: now } : {}),
    },
  })
  await recordAuditEvent({ action: 'SUBSCRIPTION_CHANGE', userId: access.userId, details: { subscriptionId: id, from: existing.status, to: item.status } }).catch(() => undefined)
  return NextResponse.json(item)
}