import assert from 'node:assert/strict'
import test from 'node:test'
import type { PrismaClient } from '@prisma/client'
import { EmailOutboxWorker } from '@/lib/email-outbox-worker'
import type { EmailSendResult, SendEmailInput } from '@/lib/email'

function createFakeDatabase() {
  const notification = {
    id: 'notification-1',
    title: 'Homework reviewed',
    body: 'Your teacher reviewed the homework.',
    user: { email: 'student@example.test', name: 'Student' },
  }
  let status = 'PENDING'
  const db = {
    notification: {
      findMany: async () => status === 'PENDING' ? [notification] : [],
      updateMany: async (input: {
        where: { id: string; deliveryStatus?: string; OR?: unknown[] }
        data: { deliveryStatus: string; sentAt?: Date }
      }) => {
        const expectedStatus = input.where.deliveryStatus
          || (input.data.deliveryStatus === 'PROCESSING' ? 'PENDING' : 'PROCESSING')
        if (input.where.id !== notification.id || status !== expectedStatus) return { count: 0 }
        status = input.data.deliveryStatus
        return { count: 1 }
      },
    },
  }
  return { db: db as unknown as Pick<PrismaClient, 'notification'>, getStatus: () => status }
}

test('email outbox claims a pending email notification and marks it sent', async () => {
  const fake = createFakeDatabase()
  let sentInput: SendEmailInput | undefined
  const sender = async (input: SendEmailInput): Promise<EmailSendResult> => {
    sentInput = input
    return { success: true, providerMessageId: 'qirox-message-1' }
  }
  const worker = new EmailOutboxWorker(fake.db, sender, () => new Date('2026-10-01T10:00:00Z'), async () => {})

  assert.deepEqual(await worker.drainOnce(), { processed: true, status: 'SENT' })
  assert.equal(fake.getStatus(), 'SENT')
  assert.equal(sentInput?.to, 'student@example.test')
  assert.equal(sentInput?.recipientName, 'Student')
  assert.equal(sentInput?.subject, 'Homework reviewed')
  assert.equal(sentInput?.text, 'Homework reviewed\n\nYour teacher reviewed the homework.')
  assert.equal(sentInput?.idempotencyKey, 'notification:notification-1')
})

test('email outbox retries transient provider failures and reuses its idempotency key', async () => {
  const fake = createFakeDatabase()
  const keys: string[] = []
  let calls = 0
  const sender = async (input: SendEmailInput): Promise<EmailSendResult> => {
    calls += 1
    keys.push(input.idempotencyKey || '')
    return calls === 1
      ? { success: false, error: 'PROVIDER_UNAVAILABLE', retryable: true }
      : { success: true, providerMessageId: 'qirox-message-1' }
  }
  const worker = new EmailOutboxWorker(fake.db, sender, () => new Date(), async () => {})

  assert.deepEqual(await worker.drainOnce(), { processed: true, status: 'SENT' })
  assert.equal(calls, 2)
  assert.equal(fake.getStatus(), 'SENT')
  assert.deepEqual(keys, ['notification:notification-1', 'notification:notification-1'])
})

test('email outbox marks non-retryable provider failures as failed without leaking details', async () => {
  const fake = createFakeDatabase()
  let calls = 0
  const sender = async (): Promise<EmailSendResult> => {
    calls += 1
    return { success: false, error: 'CONFIGURATION_ERROR', retryable: false }
  }
  const worker = new EmailOutboxWorker(fake.db, sender, () => new Date(), async () => {})

  assert.deepEqual(await worker.drainOnce(), { processed: true, status: 'FAILED' })
  assert.equal(fake.getStatus(), 'FAILED')
  assert.equal(calls, 1)
})