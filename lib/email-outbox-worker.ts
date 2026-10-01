import { prisma } from '@/lib/prisma'
import type { Prisma, PrismaClient } from '@prisma/client'
import { sendEmail, type EmailSendResult, type SendEmailInput } from '@/lib/email'

const LOCK_TIMEOUT_MS = 120_000
const MAX_ATTEMPTS = 3

export type EmailOutboxWorkerResult =
  | { processed: false; reason: 'NO_DUE_WORK' | 'LOCK_BUSY' }
  | { processed: true; status: 'SENT' | 'FAILED' }

type EmailOutboxDatabase = Pick<PrismaClient, 'notification'>
type EmailSender = (input: SendEmailInput) => Promise<EmailSendResult>
type PendingEmailNotification = Prisma.NotificationGetPayload<{
  include: { user: { select: { email: true; name: true } } }
}>

export class EmailOutboxWorker {
  constructor(
    private readonly db: EmailOutboxDatabase = prisma,
    private readonly sender: EmailSender = sendEmail,
    private readonly now: () => Date = () => new Date(),
    private readonly delay: (milliseconds: number) => Promise<void> = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
  ) {}

  async drainOnce(): Promise<EmailOutboxWorkerResult> {
    const current = this.now()
    const staleBefore = new Date(current.getTime() - LOCK_TIMEOUT_MS)
    const pending = await this.db.notification.findMany({
      where: {
        channel: 'EMAIL',
        OR: [
          { deliveryStatus: 'PENDING' },
          { deliveryStatus: 'PROCESSING', updatedAt: { lt: staleBefore } },
        ],
      },
      take: 10,
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { email: true, name: true } } },
    })

    for (const notification of pending) {
      const claimed = await this.db.notification.updateMany({
        where: {
          id: notification.id,
          channel: 'EMAIL',
          OR: [
            { deliveryStatus: 'PENDING' },
            { deliveryStatus: 'PROCESSING', updatedAt: { lt: staleBefore } },
          ],
        },
        data: { deliveryStatus: 'PROCESSING' },
      })
      if (claimed.count !== 1) continue
      return this.deliver(notification)
    }

    return { processed: false, reason: pending.length ? 'LOCK_BUSY' : 'NO_DUE_WORK' }
  }

  private async deliver(notification: PendingEmailNotification) {
    const recipient = notification.user.email.trim()
    const subject = notification.title?.trim() || 'Be Fluent update'
    const message = [notification.title?.trim(), notification.body?.trim()].filter(Boolean).join('\n\n')

    if (!recipient || !message) {
      await this.markFailed(notification.id)
      return { processed: true, status: 'FAILED' } as const
    }

    const input: SendEmailInput = {
      to: recipient,
      recipientName: notification.user.name,
      subject,
      text: message,
      idempotencyKey: `notification:${notification.id}`,
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      let result: EmailSendResult
      try {
        result = await this.sender(input)
      } catch {
        result = { success: false, error: 'PROVIDER_UNAVAILABLE', retryable: true }
      }

      if (result.success) {
        await this.db.notification.updateMany({
          where: { id: notification.id, channel: 'EMAIL', deliveryStatus: 'PROCESSING' },
          data: { deliveryStatus: 'SENT', sentAt: this.now() },
        })
        return { processed: true, status: 'SENT' } as const
      }

      if (!result.retryable || attempt === MAX_ATTEMPTS) {
        await this.markFailed(notification.id)
        return { processed: true, status: 'FAILED' } as const
      }

      await this.delay(attempt * 250)
    }

    await this.markFailed(notification.id)
    return { processed: true, status: 'FAILED' } as const
  }

  private async markFailed(notificationId: string) {
    await this.db.notification.updateMany({
      where: { id: notificationId, channel: 'EMAIL', deliveryStatus: 'PROCESSING' },
      data: { deliveryStatus: 'FAILED' },
    })
  }
}