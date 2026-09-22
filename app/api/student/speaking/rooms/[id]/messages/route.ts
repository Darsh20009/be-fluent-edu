import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8SpeakingDatabaseGuard, speakingMessageSchema, speakingRoomAudit } from '@/lib/phase8-speaking'
import { storageProviderStatus } from '@/lib/storage'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.accessSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const membership = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: access.userId } } })
  if (!membership || membership.status !== 'ACTIVE') return NextResponse.json({ ok: false, error: { code: 'MEMBERSHIP_REQUIRED', message: 'Join the room before viewing messages.' } }, { status: 403 })
  const messages = await prisma.speakingRoomMessage.findMany({ where: { roomId: id, status: 'VISIBLE' }, include: { sender: { select: { id: true, name: true, profilePhoto: true } } }, orderBy: { createdAt: 'asc' }, take: 150 })
  return NextResponse.json({ items: messages })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.accessSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const membership = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: access.userId } } })
  if (!membership || membership.status !== 'ACTIVE') return NextResponse.json({ ok: false, error: { code: 'MEMBERSHIP_REQUIRED', message: 'Join the room before sending messages.' } }, { status: 403 })
  if (membership.muted) return NextResponse.json({ ok: false, error: { code: 'MEMBER_MUTED', message: 'You are muted in this room.' } }, { status: 403 })
  const parsed = speakingMessageSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  if (parsed.data.messageType === 'VOICE' && !storageProviderStatus().configured) return NextResponse.json({ ok: false, error: { code: 'PROVIDER_UNAVAILABLE', message: 'Voice storage is unavailable.' } }, { status: 503 })
  const message = await prisma.speakingRoomMessage.create({ data: { roomId: id, senderId: access.userId, messageType: parsed.data.messageType, text: parsed.data.text, voiceRef: parsed.data.voiceRef } })
  await speakingRoomAudit(access.userId, 'MESSAGE_CREATED', id, { messageId: message.id, messageType: message.messageType })
  return NextResponse.json(message, { status: 201 })
}