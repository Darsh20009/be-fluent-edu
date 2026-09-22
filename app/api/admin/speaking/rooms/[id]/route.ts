import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8SpeakingDatabaseGuard, speakingRoomUpdateSchema, speakingRoomAudit } from '@/lib/phase8-speaking'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const room = await prisma.speakingRoom.findUnique({ where: { id }, include: { level: true, stage: true, content: true, _count: { select: { members: true, messages: true } } } })
  if (!room) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Speaking room not found' } }, { status: 404 })
  return NextResponse.json(room)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const parsed = speakingRoomUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const data = parsed.data
  const room = await prisma.speakingRoom.findUnique({ where: { id } })
  if (!room) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Speaking room not found' } }, { status: 404 })
  const effectiveLevelId = data.levelId === undefined ? room.levelId : data.levelId
  const effectiveStageId = data.stageId === undefined ? room.stageId : data.stageId
  if (effectiveStageId && !effectiveLevelId) return NextResponse.json({ ok: false, error: { code: 'STAGE_REQUIRES_LEVEL', message: 'A stage requires a level' } }, { status: 400 })
  if (effectiveLevelId) {
    const level = await prisma.level.findUnique({ where: { id: effectiveLevelId }, select: { id: true, isActive: true } })
    if (!level?.isActive) return NextResponse.json({ ok: false, error: { code: 'LEVEL_NOT_FOUND', message: 'Active level is required' } }, { status: 400 })
  }
  if (effectiveStageId) {
    const stage = await prisma.levelStage.findUnique({ where: { id: effectiveStageId }, select: { levelId: true, isActive: true } })
    if (!stage?.isActive || stage.levelId !== effectiveLevelId) return NextResponse.json({ ok: false, error: { code: 'STAGE_NOT_FOUND', message: 'Stage does not belong to the selected level' } }, { status: 400 })
  }
  if (data.teacherProfileId) {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: data.teacherProfileId }, select: { id: true } })
    if (!teacher) return NextResponse.json({ ok: false, error: { code: 'TEACHER_NOT_FOUND', message: 'Teacher profile not found' } }, { status: 400 })
  }
  const updated = await prisma.speakingRoom.update({ where: { id }, data: {
    name: data.name, description: data.description, levelId: data.levelId, stageId: data.stageId, moderatorTeacherProfileId: data.teacherProfileId,
    topic: data.topic, prompt: data.prompt, vocabularyJson: data.vocabulary ? JSON.stringify(data.vocabulary) : undefined,
    maxMembers: data.maxMembers, status: data.status,
  } })
  await speakingRoomAudit(access.userId, 'ROOM_UPDATED', id)
  return NextResponse.json(updated)
}