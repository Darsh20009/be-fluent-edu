import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireRole } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard, speakingModerationSchema, speakingRoomAudit, teacherCanModerateSpeakingRoom, SpeakingMembershipError, transitionSpeakingRoomMember } from '@/lib/phase8-speaking'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requireRole(['TEACHER']); if (isNextResponse(access)) return access
  const { id } = await params
  if (!(await teacherCanModerateSpeakingRoom(id, access.userId))) return NextResponse.json({ ok: false, error: { code: 'ROOM_NOT_ASSIGNED', message: 'This room is not assigned to this teacher.' } }, { status: 403 })
  const parsed = speakingModerationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'Invalid moderation request' } }, { status: 400 })
  const data = parsed.data
  if (['MUTE', 'UNMUTE', 'REMOVE', 'BLOCK', 'UNBLOCK'].includes(data.action)) {
    if (!data.memberUserId) return NextResponse.json({ ok: false, error: { code: 'MEMBER_REQUIRED', message: 'Member is required' } }, { status: 400 })
    const memberUserId = data.memberUserId
    const member = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: memberUserId } } })
    if (!member) return NextResponse.json({ ok: false, error: { code: 'MEMBER_NOT_FOUND', message: 'Room member not found' } }, { status: 404 })
    let updated
    try {
      updated = data.action === 'UNBLOCK'
        ? await transitionSpeakingRoomMember(prisma, { roomId: id, userId: memberUserId, transition: 'ACTIVATE', allowBlockedReactivation: true })
        : data.action === 'REMOVE' || data.action === 'BLOCK'
          ? await transitionSpeakingRoomMember(prisma, { roomId: id, userId: memberUserId, transition: 'DEACTIVATE', status: data.action === 'BLOCK' ? 'BLOCKED' : 'REMOVED' })
          : await prisma.speakingRoomMember.update({ where: { roomId_userId: { roomId: id, userId: memberUserId } }, data: { muted: data.action === 'MUTE' } })
    } catch (error) {
      if (error instanceof SpeakingMembershipError && error.code === 'ROOM_FULL') return NextResponse.json({ ok: false, error: { code: error.code, message: 'This room is full.' } }, { status: 409 })
      if (error instanceof SpeakingMembershipError && error.code === 'ALREADY_MEMBER') return NextResponse.json({ ok: false, error: { code: error.code, message: 'Member is already active.' } }, { status: 409 })
      if (error instanceof SpeakingMembershipError && error.code === 'COUNTER_DRIFT') return NextResponse.json({ ok: false, error: { code: error.code, message: 'Room capacity counter requires repair.' } }, { status: 409 })
      throw error
    }
    await speakingRoomAudit(access.userId, `MEMBER_${data.action}`, id, { targetUserId: memberUserId })
    return NextResponse.json(updated)
  }
  if (data.action === 'DELETE_MESSAGE') {
    if (!data.messageId) return NextResponse.json({ ok: false, error: { code: 'MESSAGE_REQUIRED', message: 'Message is required' } }, { status: 400 })
    const message = await prisma.speakingRoomMessage.findFirst({ where: { id: data.messageId, roomId: id } })
    if (!message) return NextResponse.json({ ok: false, error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' } }, { status: 404 })
    const updated = await prisma.speakingRoomMessage.update({ where: { id: data.messageId }, data: { status: 'MODERATED' } })
    await speakingRoomAudit(access.userId, 'MESSAGE_MODERATED', id, { messageId: data.messageId })
    return NextResponse.json(updated)
  }
  if (!data.reportId) return NextResponse.json({ ok: false, error: { code: 'REPORT_REQUIRED', message: 'Report is required' } }, { status: 400 })
  const report = await prisma.speakingRoomReport.findFirst({ where: { id: data.reportId, roomId: id } })
  if (!report) return NextResponse.json({ ok: false, error: { code: 'REPORT_NOT_FOUND', message: 'Report does not belong to this room.' } }, { status: 404 })
  const updated = await prisma.speakingRoomReport.update({ where: { id: report.id }, data: { status: data.action === 'RESOLVE_REPORT' ? 'RESOLVED' : 'DISMISSED', resolutionNote: data.note, resolvedById: access.userId, resolvedAt: new Date() } })
  await speakingRoomAudit(access.userId, 'REPORT_RESOLVED', id, { reportId: data.reportId, status: updated.status })
  return NextResponse.json(updated)
}