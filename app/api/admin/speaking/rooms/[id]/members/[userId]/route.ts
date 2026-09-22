import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard, speakingRoomAudit, SpeakingMembershipError, transitionSpeakingRoomMember } from '@/lib/phase8-speaking'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.moderateSpeakingRooms'); if (isNextResponse(access)) return access
  const { id, userId } = await params
  const body = await request.json().catch(() => ({})) as { action?: string }
  const action = body.action
  if (!['MUTE', 'UNMUTE', 'REMOVE', 'BLOCK', 'UNBLOCK'].includes(String(action))) return NextResponse.json({ ok: false, error: { code: 'INVALID_ACTION', message: 'Unsupported moderation action' } }, { status: 400 })
  const member = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId } } })
  if (!member) return NextResponse.json({ ok: false, error: { code: 'MEMBER_NOT_FOUND', message: 'Room member not found' } }, { status: 404 })
  let updated
  try {
    updated = action === 'UNBLOCK'
      ? await transitionSpeakingRoomMember(prisma, { roomId: id, userId, transition: 'ACTIVATE', allowBlockedReactivation: true })
      : action === 'REMOVE' || action === 'BLOCK'
        ? await transitionSpeakingRoomMember(prisma, { roomId: id, userId, transition: 'DEACTIVATE', status: action === 'BLOCK' ? 'BLOCKED' : 'REMOVED' })
        : await prisma.speakingRoomMember.update({ where: { roomId_userId: { roomId: id, userId } }, data: { muted: action === 'MUTE' } })
  } catch (error) {
    if (error instanceof SpeakingMembershipError && error.code === 'ROOM_FULL') return NextResponse.json({ ok: false, error: { code: error.code, message: 'This room is full.' } }, { status: 409 })
    if (error instanceof SpeakingMembershipError && error.code === 'ALREADY_MEMBER') return NextResponse.json({ ok: false, error: { code: error.code, message: 'Member is already active.' } }, { status: 409 })
    if (error instanceof SpeakingMembershipError && error.code === 'COUNTER_DRIFT') return NextResponse.json({ ok: false, error: { code: error.code, message: 'Room capacity counter requires repair.' } }, { status: 409 })
    throw error
  }
  await speakingRoomAudit(access.userId, `MEMBER_${action}`, id, { targetUserId: userId })
  return NextResponse.json(updated)
}