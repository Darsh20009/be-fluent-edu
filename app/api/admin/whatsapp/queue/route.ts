import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse } from '@/lib/auth-helpers'
import { phase8WhatsAppDatabaseGuard } from '@/lib/phase8-whatsapp'
import { requireWhatsAppAccess } from '@/lib/whatsapp/access'
import { whatsappProviderStatus } from '@/lib/whatsapp/provider'

export async function GET() {
  const blocked = phase8WhatsAppDatabaseGuard(); if (blocked) return blocked
  const access = await requireWhatsAppAccess(); if (isNextResponse(access)) return access
  const [pending, failed, sent] = await Promise.all([
    prisma.whatsAppQueue.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
    prisma.whatsAppQueue.count({ where: { status: 'FAILED' } }),
    prisma.whatsAppQueue.count({ where: { status: 'SENT' } }),
  ])
  return NextResponse.json({ provider: whatsappProviderStatus(), counts: { pending, failed, sent }, pacingMs: 3000, maxAttempts: 3 })
}