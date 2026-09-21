import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canSession, isNextResponse, requireTeacher } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { QMeetClientProvider } from '@/lib/qmeet/provider'
import { phase6DatabaseGuard } from '@/lib/phase6'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageAssignedSessions')) return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  const { id } = await params
  const session = await prisma.session.findFirst({ where: { id, teacherId: access.teacherProfileId }, include: { qmeetMeeting: true } })
  if (!session) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Assigned session not found' } }, { status: 404 })
  return NextResponse.json({ status: session.qmeetMeeting?.status ?? 'UNAVAILABLE', meeting: session.qmeetMeeting })
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageAssignedSessions')) return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  const { id } = await params
  const session = await prisma.session.findFirst({ where: { id, teacherId: access.teacherProfileId }, include: { qmeetMeeting: true } })
  if (!session) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Assigned session not found' } }, { status: 404 })
  if (session.qmeetMeeting?.status === 'CREATED') return NextResponse.json({ status: 'CREATED', meeting: session.qmeetMeeting })
  const provider = new QMeetClientProvider()
  if (!provider.isConfigured()) return NextResponse.json({ ok: false, error: { code: 'PROVIDER_UNAVAILABLE', message: 'QMeet is not configured' } }, { status: 503 })
  await prisma.qMeetMeeting.upsert({ where: { sessionId: id }, create: { sessionId: id, status: 'REQUESTED' }, update: { status: 'REQUESTED' } })
  try {
    const result = await provider.createMeeting({ roomName: session.roomId ?? session.id, title: session.title, startTime: session.startTime.toISOString(), endTime: session.endTime.toISOString() })
    const meeting = await prisma.qMeetMeeting.update({
      where: { sessionId: id },
      data: { providerMeetingId: result.meetingId ?? result.id ?? result.roomName, joinUrl: result.joinUrl, hostUrl: result.hostUrl, status: 'CREATED' },
    })
    await recordAuditEvent({ action: 'QMEET_OPERATION', userId: access.userId, details: { sessionId: id, action: 'CREATED' } }).catch(() => undefined)
    return NextResponse.json({ status: 'CREATED', meeting }, { status: 201 })
  } catch {
    await prisma.qMeetMeeting.update({ where: { sessionId: id }, data: { status: 'FAILED', joinUrl: null, hostUrl: null } }).catch(() => undefined)
    await recordAuditEvent({ action: 'QMEET_OPERATION', userId: access.userId, details: { sessionId: id, action: 'PROVIDER_FAILURE' } }).catch(() => undefined)
    return NextResponse.json({ ok: false, error: { code: 'QMEET_FAILED', message: 'QMeet meeting creation failed' } }, { status: 502 })
  }
}