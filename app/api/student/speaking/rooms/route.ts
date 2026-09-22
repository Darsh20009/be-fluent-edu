import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard, officialStudentLevel } from '@/lib/phase8-speaking'

export async function GET() {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.accessSpeakingRooms'); if (isNextResponse(access)) return access
  const profile = await officialStudentLevel(access.userId)
  if (!profile?.officialLevelId) return NextResponse.json({ items: [] })
  const stageFilter = profile.officialStageId ? [{ stageId: null }, { stageId: profile.officialStageId }] : [{ stageId: null }]
  const rooms = await prisma.speakingRoom.findMany({
    where: { status: { in: ['OPEN', 'ACTIVE'] }, levelId: profile.officialLevelId, OR: stageFilter },
    include: { level: true, stage: true, _count: { select: { members: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ items: rooms })
}