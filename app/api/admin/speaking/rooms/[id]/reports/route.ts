import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard } from '@/lib/phase8-speaking'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.moderateSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const reports = await prisma.speakingRoomReport.findMany({ where: { roomId: id }, include: { reporter: { select: { id: true, name: true } }, targetUser: { select: { id: true, name: true } }, message: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ items: reports })
}