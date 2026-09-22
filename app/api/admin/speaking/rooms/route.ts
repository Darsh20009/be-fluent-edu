import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8SpeakingDatabaseGuard, speakingRoomCreateSchema, speakingRoomAudit } from '@/lib/phase8-speaking'

export async function GET() {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const rooms = await prisma.speakingRoom.findMany({ include: { level: true, stage: true, _count: { select: { members: true } } }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ items: rooms })
}

export async function POST(request: NextRequest) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const parsed = speakingRoomCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const data = parsed.data
  if (data.stageId && !data.levelId) return NextResponse.json({ ok: false, error: { code: 'STAGE_REQUIRES_LEVEL', message: 'A stage requires a level' } }, { status: 400 })
  if (data.levelId) {
    const level = await prisma.level.findUnique({ where: { id: data.levelId }, select: { id: true, isActive: true } })
    if (!level?.isActive) return NextResponse.json({ ok: false, error: { code: 'LEVEL_NOT_FOUND', message: 'Active level is required' } }, { status: 400 })
  }
  if (data.stageId) {
    const stage = await prisma.levelStage.findUnique({ where: { id: data.stageId }, select: { levelId: true, isActive: true } })
    if (!stage?.isActive || stage.levelId !== data.levelId) return NextResponse.json({ ok: false, error: { code: 'STAGE_NOT_FOUND', message: 'Stage does not belong to the selected level' } }, { status: 400 })
  }
  if (data.teacherProfileId) {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: data.teacherProfileId }, select: { id: true } })
    if (!teacher) return NextResponse.json({ ok: false, error: { code: 'TEACHER_NOT_FOUND', message: 'Teacher profile not found' } }, { status: 400 })
  }
  const room = await prisma.speakingRoom.create({ data: {
    name: data.name, description: data.description, levelId: data.levelId, stageId: data.stageId, moderatorTeacherProfileId: data.teacherProfileId,
    topic: data.topic, prompt: data.prompt, vocabularyJson: JSON.stringify(data.vocabulary),
    maxMembers: data.maxMembers, status: data.status, createdById: access.userId,
  } })
  await speakingRoomAudit(access.userId, 'ROOM_CREATED', room.id)
  return NextResponse.json(room, { status: 201 })
}