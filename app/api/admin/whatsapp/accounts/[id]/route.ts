import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { phase8WhatsAppDatabaseGuard } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { whatsappProviderStatus } from '@/lib/whatsapp/provider'
import { prepareReconnectAlert } from '@/lib/phase8-whatsapp'
import { recordAuditEvent } from '@/lib/audit'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const { id } = await params
  const item = await prisma.whatsAppAccount.findUnique({ where: { id }, select: { id: true, provider: true, phoneNumber: true, normalizedPhone: true, status: true, authPersistenceStatus: true, reconnectAttempts: true, lastError: true, lastConnectedAt: true, createdAt: true, updatedAt: true } })
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'WhatsApp account not found' } }, { status: 404 })
  return NextResponse.json(item)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const { id } = await params
  const action = String((await request.json().catch(() => ({}))).action || 'CONNECT')
  const account = await prisma.whatsAppAccount.findUnique({ where: { id } })
  if (!account) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'WhatsApp account not found' } }, { status: 404 })
  const provider = whatsappProviderStatus()
  if (action === 'CONNECT' || action === 'RECONNECT') {
    const nextAttempts = action === 'RECONNECT' ? account.reconnectAttempts + 1 : account.reconnectAttempts
    const updated = await prisma.whatsAppAccount.update({ where: { id }, data: { status: 'ERROR', lastError: provider.reason, authPersistenceStatus: provider.persistence, reconnectAttempts: nextAttempts } })
    await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: action, accountId: id, providerStatus: provider.status } }).catch(() => undefined)
    return NextResponse.json({ ...updated, providerStatus: provider.status, persistence: provider.persistence, reconnectAlert: prepareReconnectAlert(nextAttempts) }, { status: 503 })
  }
  if (action === 'LOGOUT') {
    const updated = await prisma.whatsAppAccount.update({ where: { id }, data: { status: 'LOGGED_OUT', lastError: null, reconnectAttempts: 0 } })
    await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: 'LOGOUT', accountId: id } }).catch(() => undefined)
    return NextResponse.json(updated)
  }
  return NextResponse.json({ ok: false, error: { code: 'INVALID_ACTION', message: 'Unsupported WhatsApp account action' } }, { status: 400 })
}