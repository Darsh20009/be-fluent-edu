import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8WhatsAppDatabaseGuard, whatsappAccountSchema } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { recordAuditEvent } from '@/lib/audit'

export async function GET() {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const accounts = await prisma.whatsAppAccount.findMany({
    select: { id: true, provider: true, phoneNumber: true, normalizedPhone: true, status: true, authPersistenceStatus: true, reconnectAttempts: true, lastError: true, lastConnectedAt: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ items: accounts })
}

export async function POST(request: NextRequest) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const parsed = whatsappAccountSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const normalizedPhone = parsed.data.phoneNumber.replace(/[^\d+]/g, '').replace(/^\+/, '')
  const item = await prisma.whatsAppAccount.create({
    data: {
      provider: parsed.data.provider,
      phoneNumber: parsed.data.phoneNumber,
      normalizedPhone,
      userId: access.userId,
      status: 'DISCONNECTED',
      authPersistenceStatus: 'PERSISTENCE_UNAVAILABLE',
    },
    select: { id: true, provider: true, phoneNumber: true, status: true, authPersistenceStatus: true, createdAt: true },
  })
  await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: 'ACCOUNT_CREATED', accountId: item.id } }).catch(() => undefined)
  return NextResponse.json(item, { status: 201 })
}