import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8WhatsAppDatabaseGuard, retentionCutoff, WHATSAPP_MESSAGE_RETENTION, whatsappMessageSchema } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { whatsappProviderStatus } from '@/lib/whatsapp/provider'
import { recordAuditEvent } from '@/lib/audit'

async function retainLatestMessages(conversationId: string) {
  const all = await prisma.whatsAppMessage.findMany({ where: { conversationId }, select: { id: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
  const keep = new Set(retentionCutoff(all, WHATSAPP_MESSAGE_RETENTION).map((message) => message.id))
  const removeIds = all.filter((message) => !keep.has(message.id)).map((message) => message.id)
  if (removeIds.length) await prisma.whatsAppMessage.deleteMany({ where: { id: { in: removeIds } } })
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const { id } = await params
  const conversation = await prisma.whatsAppConversation.findUnique({ where: { id }, select: { id: true, contact: { select: { isGroup: true } } } })
  if (!conversation || conversation.contact.isGroup) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, { status: 404 })
  const items = await prisma.whatsAppMessage.findMany({ where: { conversationId: id }, select: { id: true, direction: true, mode: true, body: true, providerMessageId: true, deliveryStatus: true, receivedAt: true, sentAt: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: WHATSAPP_MESSAGE_RETENTION })
  return NextResponse.json({ items: items.reverse() })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const provider = whatsappProviderStatus()
  if (provider.status === 'PROVIDER_UNAVAILABLE') return NextResponse.json({ ok: false, error: { code: 'PROVIDER_UNAVAILABLE', message: provider.reason } }, { status: 503 })
  const parsed = whatsappMessageSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const conversation = await prisma.whatsAppConversation.findUnique({ where: { id }, include: { contact: true } })
  if (!conversation || conversation.contact.isGroup) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, { status: 404 })
  const idempotencyKey = parsed.data.idempotencyKey || `manual:${id}:${Date.now()}:${access.userId}`
  const existing = await prisma.whatsAppMessage.findFirst({ where: { idempotencyKey } })
  if (existing) return NextResponse.json(existing)
  const item = await prisma.$transaction(async (tx) => {
    const message = await tx.whatsAppMessage.create({ data: { conversationId: id, direction: 'OUTBOUND', mode: 'MANUAL', body: parsed.data.body, deliveryStatus: 'QUEUED', idempotencyKey } })
    await tx.whatsAppQueue.create({ data: { accountId: conversation.accountId, conversationId: id, messageId: message.id, dedupeKey: idempotencyKey, status: 'PENDING', availableAt: new Date(), nextAttemptAt: new Date() } })
    await tx.whatsAppConversation.update({ where: { id }, data: { lastMessageAt: new Date(), unreadCount: 0 } })
    return message
  })
  await retainLatestMessages(id)
  await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: 'MESSAGE_SEND_QUEUED', conversationId: id, messageId: item.id } }).catch(() => undefined)
  return NextResponse.json(item, { status: 201 })
}