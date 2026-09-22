import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8SpeakingDatabaseGuard, speakingContentSchema, speakingRoomAudit } from '@/lib/phase8-speaking'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const parsed = speakingContentSchema.partial().safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const item = await prisma.speakingRoomContent.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Speaking content not found' } }, { status: 404 })
  const updated = await prisma.speakingRoomContent.update({ where: { id }, data: parsed.data })
  await speakingRoomAudit(access.userId, 'CONTENT_UPDATED', item.roomId || 'GLOBAL', { contentId: id })
  return NextResponse.json(updated)
}