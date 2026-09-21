import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { groupUpdateSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const { id } = await params
  const group = await prisma.learningGroup.findUnique({
    where: { id },
    include: { level: true, stage: true, teacher: { include: { User: true } }, schedules: true, members: { include: { user: true } }, enrollments: true },
  })
  if (!group) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Group not found' } }, { status: 404 })
  return NextResponse.json(group)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = groupUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const group = await prisma.learningGroup.update({ where: { id }, data: parsed.data })
  await recordAuditEvent({ action: 'GROUP_CHANGE', userId: access.userId, details: { groupId: id, action: 'UPDATED', fields: Object.keys(parsed.data) } }).catch(() => undefined)
  return NextResponse.json(group)
}