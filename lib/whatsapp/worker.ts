import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { Prisma, type PrismaClient } from '@prisma/client'
import { WHATSAPP_MIN_OUTGOING_INTERVAL_MS, type WhatsAppProvider } from '@/lib/whatsapp'
import { whatsappProviderStatus } from './provider'

const LOCK_TIMEOUT_MS = 30_000
const DEFAULT_MAX_ATTEMPTS = 3

export type WorkerResult =
  | { processed: false; reason: 'PROVIDER_UNAVAILABLE' | 'NO_DUE_WORK' | 'LOCK_BUSY' | 'PACED' }
  | { processed: true; status: 'SENT' | 'RETRY_SCHEDULED' | 'FAILED' }

/**
 * Durable server worker. It is intended for a protected server-side job
 * invocation, never a browser timer. Provider state is checked before any DB
 * claim, so unavailable deployments leave both outbox and queue untouched.
 */
export class WhatsAppOutboxWorker {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly provider: WhatsAppProvider,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async drainOnce(): Promise<WorkerResult> {
    const providerState = whatsappProviderStatus()
    if (providerState.status === 'PROVIDER_UNAVAILABLE') return { processed: false, reason: 'PROVIDER_UNAVAILABLE' }
    await this.materializePendingOutbox()
    const current = this.now()
    const account = await this.db.whatsAppAccount.findFirst({
      where: {
        status: 'CONNECTED',
        OR: [
          { AND: [{ workerLockToken: null }, { workerLockedAt: null }] },
          { workerLockedAt: { lt: new Date(current.getTime() - LOCK_TIMEOUT_MS) } },
        ],
        AND: [{ OR: [{ lastMessageSentAt: null }, { lastMessageSentAt: { lte: new Date(current.getTime() - WHATSAPP_MIN_OUTGOING_INTERVAL_MS) } }] }],
      },
      orderBy: { updatedAt: 'asc' },
    })
    if (!account) return { processed: false, reason: 'NO_DUE_WORK' }
    const token = randomUUID()
    const locked = await this.db.whatsAppAccount.updateMany({
      where: {
        id: account.id,
        OR: [
          { AND: [{ workerLockToken: null }, { workerLockedAt: null }] },
          { workerLockedAt: { lt: new Date(current.getTime() - LOCK_TIMEOUT_MS) } },
        ],
      },
      data: { workerLockToken: token, workerLockedAt: current },
    })
    if (locked.count !== 1) return { processed: false, reason: 'LOCK_BUSY' }
    try {
      const queue = await this.db.whatsAppQueue.findFirst({
        where: {
          accountId: account.id,
          status: { in: ['PENDING', 'FAILED'] },
          attempts: { lt: DEFAULT_MAX_ATTEMPTS },
          nextAttemptAt: { lte: current },
          OR: [{ lockedAt: null }, { lockedAt: { lt: new Date(current.getTime() - LOCK_TIMEOUT_MS) } }],
        },
        include: { message: true, conversation: { include: { contact: true } } },
        orderBy: { createdAt: 'asc' },
      })
      if (!queue || !queue.message || !queue.conversation || queue.conversation.contact.isGroup) return { processed: false, reason: 'NO_DUE_WORK' }
      const claimed = await this.db.whatsAppQueue.updateMany({
        where: { id: queue.id, status: { in: ['PENDING', 'FAILED'] }, OR: [{ lockedAt: null }, { lockedAt: { lt: new Date(current.getTime() - LOCK_TIMEOUT_MS) } }] },
        data: { status: 'PROCESSING', lockedAt: current, lastAttemptAt: current },
      })
      if (claimed.count !== 1) return { processed: false, reason: 'LOCK_BUSY' }
      try {
        const result = await this.provider.sendMessage({ to: queue.conversation.contact.normalizedPhone || queue.conversation.contact.phoneNumber, body: queue.message.body || '', correlationId: queue.dedupeKey })
        await this.db.$transaction([
          this.db.whatsAppQueue.update({ where: { id: queue.id }, data: { status: 'SENT', lockedAt: null, lastError: null } }),
          this.db.whatsAppMessage.update({ where: { id: queue.message.id }, data: { deliveryStatus: 'SENT', providerMessageId: result.providerMessageId, sentAt: current } }),
          this.db.whatsAppAccount.update({ where: { id: account.id }, data: { lastMessageSentAt: current, workerLockToken: null, workerLockedAt: null } }),
          ...(queue.notificationId ? [this.db.notification.update({ where: { id: queue.notificationId }, data: { deliveryStatus: 'SENT', sentAt: current } })] : []),
        ])
        return { processed: true, status: 'SENT' }
      } catch (error) {
        const attempts = queue.attempts + 1
        const terminal = attempts >= (queue.maxAttempts || DEFAULT_MAX_ATTEMPTS)
        await this.db.$transaction([
          this.db.whatsAppQueue.update({ where: { id: queue.id }, data: { status: terminal ? 'FAILED' : 'PENDING', attempts, lockedAt: null, nextAttemptAt: new Date(current.getTime() + WHATSAPP_MIN_OUTGOING_INTERVAL_MS), lastError: error instanceof Error ? error.message.slice(0, 500) : 'Provider send failed' } }),
          this.db.whatsAppMessage.update({ where: { id: queue.message.id }, data: { deliveryStatus: terminal ? 'FAILED' : 'PENDING' } }),
          this.db.whatsAppAccount.update({ where: { id: account.id }, data: { workerLockToken: null, workerLockedAt: null } }),
          ...(terminal && queue.notificationId ? [this.db.notification.update({ where: { id: queue.notificationId }, data: { deliveryStatus: 'FAILED' } })] : []),
        ])
        return { processed: true, status: terminal ? 'FAILED' : 'RETRY_SCHEDULED' }
      }
    } finally {
      await this.db.whatsAppAccount.updateMany({ where: { id: account.id, workerLockToken: token }, data: { workerLockToken: null, workerLockedAt: null } })
    }
  }

  private async materializePendingOutbox() {
    const pending = await this.db.notification.findMany({
      where: { channel: 'WHATSAPP', deliveryStatus: 'PENDING' },
      take: 50,
      orderBy: { createdAt: 'asc' },
      select: { id: true, userId: true, title: true, body: true },
    })
    for (const notification of pending) {
      const contact = await this.db.whatsAppContact.findFirst({ where: { userId: notification.userId, isGroup: false, account: { status: 'CONNECTED' } }, include: { account: true, conversations: { where: { status: { not: 'ARCHIVED' } }, take: 1 } } })
      if (!contact) continue
      const conversation = contact.conversations[0] || await this.db.whatsAppConversation.create({ data: { accountId: contact.accountId, contactId: contact.id, studentId: contact.userId } })
      const dedupeKey = `notification:${notification.id}`
      try {
        await this.db.$transaction(async (tx) => {
          const message = await tx.whatsAppMessage.create({ data: { conversationId: conversation.id, direction: 'OUTBOUND', mode: 'NOTIFICATION', body: `${notification.title}: ${notification.body}`, deliveryStatus: 'QUEUED', idempotencyKey: dedupeKey } })
          await tx.whatsAppQueue.create({ data: { accountId: contact.accountId, conversationId: conversation.id, messageId: message.id, notificationId: notification.id, recipientPhone: contact.normalizedPhone || contact.phoneNumber, dedupeKey, status: 'PENDING', nextAttemptAt: this.now() } })
          await tx.notification.update({ where: { id: notification.id }, data: { deliveryStatus: 'QUEUED' } })
        })
      } catch (error) {
        // Unique queue dedupe is the concurrency boundary. A competing worker
        // may have materialized this notification already.
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error
      }
    }
  }
}