import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { participantMutationSchema, phase6DatabaseGuard } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'
import { findIneligibleSessionStudents } from '@/lib/session-eligibility'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const items = await prisma.sessionParticipant.findMany({ where: { sessionId: id }, include: { user: true }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const parsed = participantMutationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const session = await prisma.session.findUnique({ where: { id }, include: { group: true } })
  if (!session) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 })
  const existing = await prisma.sessionParticipant.findUnique({ where: { sessionId_userId: { sessionId: id, userId: parsed.data.userId } } })
  if (parsed.data.action === 'ADD') {
    if (!session.groupId) return NextResponse.json({ ok: false, error: { code: 'GROUP_REQUIRED', message: 'Session must belong to a group' } }, { status: 409 })
    const ineligible = await findIneligibleSessionStudents(session.groupId, [parsed.data.userId])
    if (ineligible.length > 0) {
      return NextResponse.json({ ok: false, error: { code: 'PARTICIPANT_NOT_ELIGIBLE', message: 'Student is not an active group member' } }, { status: 409 })
    }
    const item = existing
      ? await prisma.sessionParticipant.update({ where: { id: existing.id }, data: { status: 'SCHEDULED', leftAt: null } })
      : await prisma.sessionParticipant.create({ data: { sessionId: id, userId: parsed.data.userId } })
    await recordAuditEvent({ action: 'SESSION_PARTICIPANT_CHANGE', userId: access.userId, details: { sessionId: id, participantId: parsed.data.userId, action: 'ADDED' } }).catch(() => undefined)
    return NextResponse.json(item, { status: existing ? 200 : 201 })
  }
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Participant not found' } }, { status: 404 })
  const status = parsed.data.action === 'CANCEL' ? 'CANCELLED' : 'LEFT'
  const item = await prisma.sessionParticipant.update({ where: { id: existing.id }, data: { status, leftAt: new Date() } })
  await recordAuditEvent({ action: 'SESSION_PARTICIPANT_CHANGE', userId: access.userId, details: { sessionId: id, participantId: parsed.data.userId, action: status } }).catch(() => undefined)
  return NextResponse.json(item)
}