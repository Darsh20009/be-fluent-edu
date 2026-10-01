import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { isNextResponse } from '@/lib/auth-helpers'
import { phase8WhatsAppDatabaseGuard } from '@/lib/phase8-whatsapp'
import { prisma } from '@/lib/prisma'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { createWhatsAppProvider } from '@/lib/whatsapp/provider'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8WhatsAppDatabaseGuard()
  if (blocked) return blocked
  const access = await requireWhatsAppAccess()
  if (isNextResponse(access)) return access
  const { id } = await params
  const account = await prisma.whatsAppAccount.findUnique({
    where: { id },
    select: { id: true, provider: true, status: true },
  })
  if (!account) {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'WhatsApp account not found' } }, { status: 404 })
  }
  if (account.provider !== 'BAILEYS') {
    return NextResponse.json({ ok: false, error: { code: 'UNSUPPORTED_PROVIDER', message: 'This account does not use Baileys.' } }, { status: 409 })
  }

  const provider = await createWhatsAppProvider(id)
  if (provider.state().status === 'PROVIDER_UNAVAILABLE') {
    return NextResponse.json({
      ok: false,
      error: { code: 'PROVIDER_UNAVAILABLE', message: provider.state().reason },
      status: provider.state().status,
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }

  if (['DISCONNECTED', 'RECONNECTING', 'ERROR'].includes(provider.state().status)) {
    try { await provider.connect() } catch {
      return NextResponse.json({
        ok: true,
        status: provider.state().status,
        qrImage: null,
      }, { headers: { 'Cache-Control': 'no-store' } })
    }
  }

  const payload = await provider.getQRCode()
  const qrImage = payload
    ? await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 280 })
    : null
  return NextResponse.json({
    ok: true,
    status: provider.state().status,
    connected: provider.state().authenticated,
    qrImage,
  }, { headers: { 'Cache-Control': 'no-store' } })
}