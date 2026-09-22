import { NextResponse } from 'next/server'
import { whatsappProviderStatus } from '@/lib/whatsapp/provider'

/**
 * Provider-only health surface. It intentionally exposes no account, QR, or
 * credential information and does not touch MongoDB.
 */
export async function GET() {
  return NextResponse.json({ ok: true, ...whatsappProviderStatus() })
}