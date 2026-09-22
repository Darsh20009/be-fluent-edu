import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard } from '@/lib/phase8-speaking'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const members = await prisma.speakingRoomMember.findMany({ where: { roomId: id }, include: { user: { select: { id: true, name: true, email: true, profilePhoto: true } } }, orderBy: { joinedAt: 'asc' } })
  return NextResponse.json({ items: members })
}