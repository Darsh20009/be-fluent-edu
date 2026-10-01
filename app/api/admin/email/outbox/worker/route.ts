import { NextResponse } from 'next/server'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { phase7DatabaseGuard } from '@/lib/phase7'
import { EmailOutboxWorker } from '@/lib/email-outbox-worker'
import { qiroxEmailProviderStatus } from '@/lib/email'

export async function POST() {
  const access = await requireAdmin()
  if (isNextResponse(access)) return access

  const blocked = phase7DatabaseGuard()
  if (blocked) return blocked

  if (!qiroxEmailProviderStatus().configured) {
    return NextResponse.json(
      { ok: false, error: { code: 'EMAIL_PROVIDER_UNAVAILABLE', message: 'Email delivery is not configured.' } },
      { status: 503 },
    )
  }

  try {
    const worker = await new EmailOutboxWorker().drainOnce()
    return NextResponse.json({ ok: true, worker })
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'EMAIL_OUTBOX_UNAVAILABLE', message: 'Email notifications could not be processed.' } },
      { status: 503 },
    )
  }
}