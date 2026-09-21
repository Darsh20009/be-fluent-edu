import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { QMeetClientProvider } from '@/lib/qmeet/provider'
import { phase6DatabaseGuard, qmeetCreateSchema } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const meeting = await prisma.qMeetMeeting.findUnique({ where: { sessionId: id } })
  if (!meeting) return NextResponse.json({ status: 'UNAVAILABLE', meeting: null })
  return NextResponse.json({ status: meeting.status, meeting })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const parsed = qmeetCreateSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const session = await prisma.session.findUnique({ where: { id }, include: { qmeetMeeting: true } })
  if (!session) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 })
  if (session.qmeetMeeting?.status === 'CREATED' && !parsed.data.forceRetry) {
    return NextResponse.json({ status: 'CREATED', meeting: session.qmeetMeeting })
  }
  const provider = new QMeetClientProvider()
  if (!provider.isConfigured()) {
    return NextResponse.json({ ok: false, error: { code: 'PROVIDER_UNAVAILABLE', message: 'QMeet is not configured' } }, { status: 503 })
  }

  await prisma.qMeetMeeting.upsert({
    where: { sessionId: id },
    create: { sessionId: id, status: 'REQUESTED' },
    update: { status: 'REQUESTED' },
  })
  try {
    const result = await provider.createMeeting({
      roomName: session.roomId ?? session.id,
      title: session.title,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
    })
    const meeting = await prisma.qMeetMeeting.update({
      where: { sessionId: id },
      data: {
        providerMeetingId: result.meetingId ?? result.id ?? result.roomName,
        joinUrl: result.joinUrl,
        hostUrl: result.hostUrl,
        status: 'CREATED',
      },
    })
    await recordAuditEvent({ action: 'QMEET_OPERATION', userId: access.userId, details: { sessionId: id, action: 'CREATED', providerMeetingId: meeting.providerMeetingId } }).catch(() => undefined)
    return NextResponse.json({ status: 'CREATED', meeting }, { status: 201 })
  } catch {
    await prisma.qMeetMeeting.update({ where: { sessionId: id }, data: { status: 'FAILED', joinUrl: null, hostUrl: null } }).catch(() => undefined)
    await recordAuditEvent({ action: 'QMEET_OPERATION', userId: access.userId, details: { sessionId: id, action: 'PROVIDER_FAILURE' } }).catch(() => undefined)
    return NextResponse.json({ ok: false, error: { code: 'QMEET_FAILED', message: 'QMeet meeting creation failed' } }, { status: 502 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const meeting = await prisma.qMeetMeeting.findUnique({ where: { sessionId: id } })
  if (!meeting) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'QMeet meeting not found' } }, { status: 404 })
  const provider = new QMeetClientProvider()
  if (!provider.isConfigured()) return NextResponse.json({ ok: false, error: { code: 'PROVIDER_UNAVAILABLE', message: 'QMeet is not configured' } }, { status: 503 })
  try {
    if (meeting.providerMeetingId) await provider.deleteMeeting(meeting.providerMeetingId)
  } catch {
    await prisma.qMeetMeeting.update({ where: { sessionId: id }, data: { status: 'FAILED' } }).catch(() => undefined)
    await recordAuditEvent({ action: 'QMEET_OPERATION', userId: access.userId, details: { sessionId: id, action: 'DELETE_PROVIDER_FAILURE' } }).catch(() => undefined)
    return NextResponse.json({ ok: false, error: { code: 'QMEET_DELETE_FAILED', message: 'QMeet meeting cancellation could not be confirmed' } }, { status: 502 })
  }
  const updated = await prisma.qMeetMeeting.update({ where: { sessionId: id }, data: { status: 'CANCELLED', joinUrl: null, hostUrl: null } })
  await recordAuditEvent({ action: 'QMEET_OPERATION', userId: access.userId, details: { sessionId: id, action: 'CANCELLED' } }).catch(() => undefined)
  return NextResponse.json(updated)
}