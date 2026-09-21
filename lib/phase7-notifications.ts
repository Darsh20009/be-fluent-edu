import { prisma } from '@/lib/prisma'
import { deterministicNotificationKey } from '@/lib/phase7'
import type { Prisma } from '@prisma/client'

export async function queuePhase7Notifications(input: {
  event: 'feedback.published' | 'homework.assigned' | 'homework.reviewed'
  entityId: string
  recipientUserId: string
  title: string
  body: string
  payload?: Record<string, unknown>
}, client: Pick<Prisma.TransactionClient, 'notification'> = prisma) {
  for (const channel of ['IN_APP', 'WHATSAPP', 'EMAIL'] as const) {
    const dedupeKey = deterministicNotificationKey(input.event, input.entityId, input.recipientUserId, channel)
    await client.notification.upsert({
      where: { dedupeKey },
      create: {
        userId: input.recipientUserId, eventType: input.event, channel,
        title: input.title, body: input.body,
        payloadJson: input.payload ? JSON.stringify(input.payload) : undefined,
        deliveryStatus: channel === 'IN_APP' ? 'SENT' : 'PENDING',
        dedupeKey,
      },
      update: {},
    })
  }
}