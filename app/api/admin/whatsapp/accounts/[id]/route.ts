import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { nextReconnectState, phase8WhatsAppDatabaseGuard } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { createWhatsAppProvider, whatsappProviderStatus } from '@/lib/whatsapp/provider'
import { whatsappAuthPersistence } from '@/lib/whatsapp/persistence'
import { prepareReconnectAlert } from '@/lib/phase8-whatsapp'
import { recordAuditEvent } from '@/lib/audit'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const { id } = await params
  const item = await prisma.whatsAppAccount.findUnique({ where: { id }, select: { id: true, provider: true, phoneNumber: true, normalizedPhone: true, status: true, authPersistenceStatus: true, isOtpSender: true, reconnectAttempts: true, lastError: true, lastConnectedAt: true, createdAt: true, updatedAt: true } })
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

  if (action === 'SET_OTP_SENDER') {
    if (account.status !== 'CONNECTED') {
      return NextResponse.json({ ok: false, error: { code: 'ACCOUNT_NOT_CONNECTED', message: 'Connect this WhatsApp account before selecting it for OTP delivery.' } }, { status: 409 })
    }
    await prisma.$transaction(async (tx) => {
      await tx.whatsAppAccount.updateMany({ where: { isOtpSender: true }, data: { isOtpSender: false } })
      await tx.whatsAppAccount.update({ where: { id }, data: { isOtpSender: true } })
    })
    await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: 'OTP_SENDER_SELECTED', accountId: id } }).catch(() => undefined)
    return NextResponse.json({ ok: true, accountId: id, isOtpSender: true })
  }

  if (action === 'CONNECT' || action === 'RECONNECT') {
    const providerState = await whatsappProviderStatus()
    if (providerState.status === 'PROVIDER_UNAVAILABLE') {
      return NextResponse.json({
        ok: false,
        error: { code: 'PROVIDER_UNAVAILABLE', message: providerState.reason },
        provider: providerState,
      }, { status: 503 })
    }

    const reconnectState = action === 'RECONNECT' || account.status === 'ERROR'
      ? nextReconnectState(account.reconnectAttempts, false)
      : null
    if (reconnectState?.status === 'ERROR') {
      await prisma.whatsAppAccount.update({
        where: { id },
        data: { status: 'ERROR', reconnectAttempts: reconnectState.attempts },
      })
      return NextResponse.json({
        ok: false,
        error: { code: 'RECONNECT_LIMIT', message: 'Reconnect limit reached. Log out and link the account again.' },
        reconnectAlert: prepareReconnectAlert(reconnectState.attempts),
      }, { status: 409 })
    }

    const nextAttempts = reconnectState?.attempts ?? account.reconnectAttempts
    await prisma.whatsAppAccount.update({
      where: { id },
      data: {
        reconnectAttempts: nextAttempts,
        authPersistenceStatus: whatsappAuthPersistence().status,
      },
    })
    const provider = await createWhatsAppProvider(id)
    if (provider.state().status === 'PROVIDER_UNAVAILABLE') {
      return NextResponse.json({
        ok: false,
        error: { code: 'PROVIDER_UNAVAILABLE', message: provider.state().reason },
        provider: provider.state(),
      }, { status: 503 })
    }
    void provider.connect().catch(() => undefined)
    void recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: action, accountId: id, providerStatus: provider.state().status } }).catch(() => undefined)
    return NextResponse.json({ ...account, reconnectAttempts: nextAttempts, provider: provider.state(), reconnectAlert: prepareReconnectAlert(nextAttempts) }, { status: 202 })
  }
  if (action === 'LOGOUT') {
    const providerState = await whatsappProviderStatus()
    if (providerState.status === 'PROVIDER_UNAVAILABLE') {
      return NextResponse.json({
        ok: false,
        error: { code: 'PROVIDER_UNAVAILABLE', message: providerState.reason },
      }, { status: 503 })
    }
    const provider = await createWhatsAppProvider(id)
    try {
      await provider.disconnect()
    } catch {
      return NextResponse.json({ ok: false, error: { code: 'LOGOUT_FAILED', message: 'WhatsApp logout could not be completed.' } }, { status: 503 })
    }
    const updated = await prisma.whatsAppAccount.update({ where: { id }, data: { status: 'LOGGED_OUT', lastError: null, reconnectAttempts: 0, isOtpSender: false } })
    await recordAuditEvent({ action: 'WHATSAPP_OPERATION', userId: access.userId, details: { operation: 'LOGOUT', accountId: id } }).catch(() => undefined)
    return NextResponse.json(updated)
  }
  return NextResponse.json({ ok: false, error: { code: 'INVALID_ACTION', message: 'Unsupported WhatsApp account action' } }, { status: 400 })
}