import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { canJoinSpeakingRoom, phase8SpeakingDatabaseGuard, speakingRoomAccess, speakingRoomAudit, speakingRoomStudentDto, SpeakingMembershipError, transitionSpeakingRoomMember } from '@/lib/phase8-speaking'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.accessSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const result = await speakingRoomAccess(id, access.userId)
  if (!result.room || !result.allowed) return NextResponse.json({ ok: false, error: { code: 'ROOM_NOT_AVAILABLE', message: 'This room is not available for your official level.' } }, { status: 403 })
  const content = await prisma.speakingRoomContent.findMany({ where: { OR: [{ roomId: id }, { roomId: null }], status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(speakingRoomStudentDto(result.room, result.member, content))
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.joinSpeakingRoom'); if (isNextResponse(access)) return access
  const { id } = await params
  const room = await prisma.speakingRoom.findUnique({ where: { id } })
  if (!room) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Speaking room not found' } }, { status: 404 })
  const existing = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: access.userId } } })
  if (existing?.status === 'BLOCKED') return NextResponse.json({ ok: false, error: { code: 'MEMBER_BLOCKED', message: 'You cannot join this room.' } }, { status: 403 })
  if (existing?.status === 'ACTIVE') return NextResponse.json({ ok: false, error: { code: 'ALREADY_MEMBER', message: 'You are already a member.' } }, { status: 409 })
  const profile = await (await import('@/lib/phase8-speaking')).officialStudentLevel(access.userId)
  if (!profile || !canJoinSpeakingRoom({ roomStatus: room.status, roomLevelId: room.levelId, roomStageId: room.stageId, officialLevelId: profile.officialLevelId, officialStageId: profile.officialStageId, activeAccount: true, currentMember: false, maxMembers: room.maxMembers, activeMemberCount: 0 })) {
    return NextResponse.json({ ok: false, error: { code: 'ROOM_NOT_AVAILABLE', message: 'This room is not available for your official level or stage.' } }, { status: 403 })
  }
  try {
    const member = await transitionSpeakingRoomMember(prisma, { roomId: id, userId: access.userId, transition: 'ACTIVATE' })
    await speakingRoomAudit(access.userId, 'MEMBERSHIP_JOINED', id)
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    const code = error instanceof SpeakingMembershipError ? error.code : error instanceof Error ? error.message : ''
    if (code === 'ALREADY_MEMBER') return NextResponse.json({ ok: false, error: { code, message: 'You are already a member.' } }, { status: 409 })
    if (code === 'MEMBER_BLOCKED') return NextResponse.json({ ok: false, error: { code, message: 'You cannot join this room.' } }, { status: 403 })
    if (code === 'ROOM_FULL') return NextResponse.json({ ok: false, error: { code, message: 'This room is full.' } }, { status: 409 })
    if (code === 'COUNTER_DRIFT') return NextResponse.json({ ok: false, error: { code, message: 'Room membership capacity requires administrative repair.' } }, { status: 409 })
    throw error
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.joinSpeakingRoom'); if (isNextResponse(access)) return access
  const { id } = await params
  const member = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: access.userId } } })
  if (!member || member.status !== 'ACTIVE') return NextResponse.json({ ok: false, error: { code: 'NOT_MEMBER', message: 'You are not an active member.' } }, { status: 404 })
  const updated = await transitionSpeakingRoomMember(prisma, { roomId: id, userId: access.userId, transition: 'DEACTIVATE', status: 'LEFT' })
  await speakingRoomAudit(access.userId, 'MEMBERSHIP_LEFT', id)
  return NextResponse.json(updated)
}