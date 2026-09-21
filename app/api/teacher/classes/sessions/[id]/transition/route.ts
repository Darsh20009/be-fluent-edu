import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canSession, isNextResponse, requireTeacher } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { canTransitionSession, phase6DatabaseGuard, sessionTransitionSchema } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageAssignedSessions')) return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  const parsed = sessionTransitionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const existing = await prisma.session.findUnique({ where: { id } })
  if (!existing || existing.teacherId !== access.teacherProfileId) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Assigned session not found' } }, { status: 404 })
  if (!canTransitionSession(existing.status, parsed.data.status)) return NextResponse.json({ ok: false, error: { code: 'INVALID_TRANSITION', message: 'Invalid session transition' } }, { status: 409 })
  const item = await prisma.session.update({ where: { id }, data: { status: parsed.data.status } })
  await recordAuditEvent({ action: 'SESSION_CHANGE', userId: access.userId, details: { sessionId: id, from: existing.status, to: item.status } }).catch(() => undefined)
  return NextResponse.json(item)
}