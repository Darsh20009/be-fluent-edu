import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { normalizeWhatsAppPhone, phase8WhatsAppDatabaseGuard, whatsappContactSchema, isGroupChatPhone } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { recordAuditEvent } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const accountId = request.nextUrl.searchParams.get('accountId') || undefined
  const items = await prisma.whatsAppContact.findMany({ where: accountId ? { accountId, isGroup: false } : { isGroup: false }, select: { id: true, accountId: true, userId: true, phoneNumber: true, normalizedPhone: true, displayName: true, status: true, isGroup: true, lastInteractionAt: true, createdAt: true, updatedAt: true }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const parsed = whatsappContactSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  if (isGroupChatPhone(parsed.data.phoneNumber)) return NextResponse.json({ ok: false, error: { code: 'GROUP_CHAT_UNSUPPORTED', message: 'Group chats are not supported by CRM.' } }, { status: 422 })
  const normalizedPhone = normalizeWhatsAppPhone(parsed.data.phoneNumber)
  if (!normalizedPhone) return NextResponse.json({ ok: false, error: { code: 'INVALID_PHONE', message: 'A valid phone number is required.' } }, { status: 400 })
  const item = await prisma.whatsAppContact.upsert({
    where: { accountId_normalizedPhone: { accountId: parsed.data.accountId, normalizedPhone } },
    create: { accountId: parsed.data.accountId, phoneNumber: parsed.data.phoneNumber, normalizedPhone, displayName: parsed.data.displayName, userId: parsed.data.userId, isGroup: false },
    update: { phoneNumber: parsed.data.phoneNumber, displayName: parsed.data.displayName, userId: parsed.data.userId, status: 'ACTIVE' },
    select: { id: true, accountId: true, userId: true, phoneNumber: true, normalizedPhone: true, displayName: true, status: true, isGroup: true, lastInteractionAt: true, createdAt: true, updatedAt: true },
  })
  await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: 'CONTACT_UPSERTED', contactId: item.id, accountId: item.accountId } }).catch(() => undefined)
  return NextResponse.json(item, { status: 201 })
}