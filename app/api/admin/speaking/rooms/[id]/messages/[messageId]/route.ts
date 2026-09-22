import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard, speakingRoomAudit } from '@/lib/phase8-speaking'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; messageId: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.moderateSpeakingRooms'); if (isNextResponse(access)) return access
  const { id, messageId } = await params
  const body = await request.json().catch(() => ({})) as { status?: string }
  if (!['VISIBLE', 'MODERATED', 'DELETED'].includes(String(body.status))) return NextResponse.json({ ok: false, error: { code: 'INVALID_STATUS', message: 'Unsupported message status' } }, { status: 400 })
  const message = await prisma.speakingRoomMessage.findFirst({ where: { id: messageId, roomId: id } })
  if (!message) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })
  const updated = await prisma.speakingRoomMessage.update({ where: { id: messageId }, data: { status: body.status } })
  await speakingRoomAudit(access.userId, 'MESSAGE_MODERATED', id, { messageId, status: body.status })
  return NextResponse.json(updated)
}