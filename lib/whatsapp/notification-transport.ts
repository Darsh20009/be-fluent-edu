import { prisma } from '@/lib/prisma'
import { whatsappProviderStatus } from './provider'

/**
 * Phase 7 remains the single notification outbox owner. This adapter only
 * claims WhatsApp-channel rows for delivery when a real provider exists; it
 * does not create a parallel notification system.
 */
export async function preparePendingWhatsAppTransport(limit = 50) {
  const provider = await whatsappProviderStatus()
  if (provider.status === 'PROVIDER_UNAVAILABLE') {
    return { prepared: false, reason: provider.reason, count: 0 }
  }
  const rows = await prisma.notification.findMany({
    where: { channel: 'WHATSAPP', deliveryStatus: 'PENDING' },
    take: limit,
    orderBy: { createdAt: 'asc' },
    select: { id: true, userId: true, title: true, body: true, payloadJson: true },
  })
  return { prepared: true, count: rows.length, ids: rows.map((row) => row.id) }
}