import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8SpeakingDatabaseGuard, speakingContentSchema, speakingRoomAudit } from '@/lib/phase8-speaking'

export async function GET(request: NextRequest) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const roomId = request.nextUrl.searchParams.get('roomId') || undefined
  const contentType = request.nextUrl.searchParams.get('contentType') || undefined
  const items = await prisma.speakingRoomContent.findMany({ where: { ...(roomId ? { roomId } : {}), ...(contentType ? { contentType } : {}) }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const parsed = speakingContentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const item = await prisma.speakingRoomContent.create({ data: { roomId: parsed.data.roomId, contentType: parsed.data.contentType, text: parsed.data.text, status: parsed.data.status, createdById: access.userId } })
  await speakingRoomAudit(access.userId, 'CONTENT_CREATED', parsed.data.roomId || 'GLOBAL', { contentId: item.id, contentType: item.contentType })
  return NextResponse.json(item, { status: 201 })
}