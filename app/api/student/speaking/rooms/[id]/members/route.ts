import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard } from '@/lib/phase8-speaking'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.accessSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const member = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: access.userId } } })
  if (!member || member.status !== 'ACTIVE') return NextResponse.json({ ok: false, error: { code: 'MEMBERSHIP_REQUIRED', message: 'Join the room before viewing members.' } }, { status: 403 })
  const members = await prisma.speakingRoomMember.findMany({ where: { roomId: id, status: 'ACTIVE' }, select: { id: true, userId: true, role: true, muted: true, joinedAt: true, user: { select: { id: true, name: true, profilePhoto: true } } }, orderBy: { joinedAt: 'asc' } })
  return NextResponse.json({ items: members })
}