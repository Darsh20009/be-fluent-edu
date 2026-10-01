import { NextResponse } from 'next/server'
import { isNextResponse } from '@/lib/auth-helpers'
import { phase8WhatsAppDatabaseGuard } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { createWhatsAppProvider, whatsappProviderStatus } from '@/lib/whatsapp/provider'
import { WhatsAppOutboxWorker } from '@/lib/whatsapp/worker'

/**
 * Callable server-side worker hook. A scheduler may invoke this endpoint;
 * browser code must not use it as a timer. It claims no DB rows unless the
 * provider has a real authenticated persistent state.
 */
export async function POST() {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const providerState = await whatsappProviderStatus()
  if (providerState.status === 'PROVIDER_UNAVAILABLE') {
    return NextResponse.json({ ok: false, error: { code: 'PROVIDER_UNAVAILABLE', message: providerState.reason }, worker: { processed: false, reason: 'PROVIDER_UNAVAILABLE' } }, { status: 503 })
  }
  const result = await new WhatsAppOutboxWorker(undefined, createWhatsAppProvider).drainOnce()
  return NextResponse.json({ ok: true, worker: result })
}