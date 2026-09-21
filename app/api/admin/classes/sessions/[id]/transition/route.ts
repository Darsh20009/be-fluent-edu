import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { canTransitionSession, phase6DatabaseGuard, sessionTransitionSchema } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const parsed = sessionTransitionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const existing = await prisma.session.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 })
  if (!canTransitionSession(existing.status, parsed.data.status)) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${existing.status} to ${parsed.data.status}` } }, { status: 409 })
  }
  const item = await prisma.session.update({ where: { id }, data: { status: parsed.data.status } })
  await recordAuditEvent({ action: 'SESSION_CHANGE', userId: access.userId, details: { sessionId: id, from: existing.status, to: item.status } }).catch(() => undefined)
  return NextResponse.json(item)
}