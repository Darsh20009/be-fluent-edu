import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { canStudentJoinSession, phase6DatabaseGuard } from '@/lib/phase6'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('student.joinSession')
  if (isNextResponse(access)) return access
  const { id } = await params
  const participant = await prisma.sessionParticipant.findUnique({
    where: { sessionId_userId: { sessionId: id, userId: access.userId } },
    include: { session: { include: { qmeetMeeting: true } } },
  })
  if (!participant) return NextResponse.json({ ok: false, error: { code: 'NOT_ENROLLED', message: 'Student is not assigned to this session' } }, { status: 403 })
  const enrollment = participant.session.groupId
    ? await prisma.enrollment.findFirst({ where: { studentId: access.userId, groupId: participant.session.groupId, status: 'ACTIVE' } })
    : null
  const decision = canStudentJoinSession({
    authenticated: true,
    active: access.isActive,
    accountStatus: access.status,
    enrolled: Boolean(enrollment),
    participantStatus: participant.status,
    sessionStatus: participant.session.status,
    startTime: participant.session.startTime,
    endTime: participant.session.endTime,
  })
  if (!decision.allowed) {
    return NextResponse.json({ ok: false, error: { code: decision.code, message: 'Student is not allowed to join this session' } }, { status: 403 })
  }
  const meeting = participant.session.qmeetMeeting
  if (!meeting || meeting.status !== 'CREATED' || !meeting.joinUrl) {
    return NextResponse.json({ ok: false, error: { code: 'QMEET_UNAVAILABLE', message: 'The class meeting is not available' } }, { status: 409 })
  }
  await prisma.sessionParticipant.update({
    where: { id: participant.id },
    data: { status: 'JOINED', joinedAt: participant.joinedAt ?? new Date() },
  })
  return NextResponse.json({ allowed: true, joinUrl: meeting.joinUrl })
}