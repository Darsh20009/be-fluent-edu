import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8WhatsAppDatabaseGuard, whatsappConversationUpdateSchema } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { recordAuditEvent } from '@/lib/audit'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const parsed = whatsappConversationUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const item = await prisma.whatsAppConversation.update({ where: { id }, data: parsed.data, select: { id: true, status: true, assignedStaffId: true, updatedAt: true } }).catch(() => null)
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, { status: 404 })
  await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: 'CONVERSATION_UPDATED', conversationId: id } }).catch(() => undefined)
  return NextResponse.json(item)
}