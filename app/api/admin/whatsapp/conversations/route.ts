import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { phase8WhatsAppDatabaseGuard, whatsappConversationStatuses } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'

export async function GET(request: NextRequest) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const status = request.nextUrl.searchParams.get('status')
  const items = await prisma.whatsAppConversation.findMany({
    where: { ...(status && whatsappConversationStatuses.includes(status as (typeof whatsappConversationStatuses)[number]) ? { status } : {}), contact: { isGroup: false } },
    select: { id: true, accountId: true, contactId: true, studentId: true, assignedStaffId: true, status: true, unreadCount: true, lastMessageAt: true, createdAt: true, updatedAt: true, contact: { select: { displayName: true, normalizedPhone: true, status: true } }, messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { id: true, direction: true, body: true, deliveryStatus: true, createdAt: true } } },
    orderBy: { lastMessageAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const body = await request.json().catch(() => ({}))
  const accountId = typeof body.accountId === 'string' ? body.accountId : ''
  const contactId = typeof body.contactId === 'string' ? body.contactId : ''
  if (!accountId || !contactId) return NextResponse.json({ ok: false, error: { code: 'INVALID_INPUT', message: 'accountId and contactId are required' } }, { status: 400 })
  const contact = await prisma.whatsAppContact.findFirst({ where: { id: contactId, accountId, isGroup: false } })
  if (!contact) return NextResponse.json({ ok: false, error: { code: 'CONTACT_NOT_FOUND', message: 'Contact not found' } }, { status: 404 })
  const existing = await prisma.whatsAppConversation.findFirst({ where: { accountId, contactId, status: { not: 'ARCHIVED' } } })
  const item = existing || await prisma.whatsAppConversation.create({ data: { accountId, contactId, studentId: contact.userId }, select: { id: true, accountId: true, contactId: true, studentId: true, status: true, unreadCount: true, lastMessageAt: true, createdAt: true, updatedAt: true } })
  return NextResponse.json(item, { status: existing ? 200 : 201 })
}