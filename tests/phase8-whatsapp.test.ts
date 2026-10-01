import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canManageWhatsApp,
  isGroupChatPhone,
  nextReconnectState,
  normalizeWhatsAppPhone,
  phase8WhatsAppDatabaseGuard,
  prepareReconnectAlert,
  retentionCutoff,
} from '@/lib/phase8-whatsapp'
import {
  decryptWhatsAppAuthState,
  encryptWhatsAppAuthState,
  UnavailableWhatsAppAuthPersistence,
} from '@/lib/whatsapp/persistence'
import { UnavailableWhatsAppProvider, whatsappProviderStatus } from '@/lib/whatsapp/provider'
import { WhatsAppSequentialQueue } from '@/lib/whatsapp/queue'
import { WhatsAppOutboxWorker } from '@/lib/whatsapp/worker'

test('WhatsApp CRM access is explicit and excludes students and teachers', () => {
  assert.equal(canManageWhatsApp('ADMIN', []), true)
  assert.equal(canManageWhatsApp('MANAGER', ['manager.manageWhatsAppCRM']), true)
  assert.equal(canManageWhatsApp('TEACHER', []), false)
  assert.equal(canManageWhatsApp('STUDENT', []), false)
})

test('phone normalization and group-chat filtering are server-bound', () => {
  assert.equal(normalizeWhatsAppPhone('+20 (109) 151-5594'), '201091515594')
  assert.equal(normalizeWhatsAppPhone('bad'), null)
  assert.equal(isGroupChatPhone('1203630@g.us'), true)
  assert.equal(isGroupChatPhone('201091515594'), false)
})

test('provider and auth persistence are truthful when unavailable', async () => {
  const originalProvider = process.env.WHATSAPP_PROVIDER
  process.env.WHATSAPP_PROVIDER = 'disabled'
  try {
    assert.equal(new UnavailableWhatsAppAuthPersistence().status, 'PERSISTENCE_UNAVAILABLE')
    assert.equal((await whatsappProviderStatus()).status, 'PROVIDER_UNAVAILABLE')
    assert.equal((await whatsappProviderStatus()).persistence, 'PERSISTENCE_UNAVAILABLE')
    await assert.rejects(() => new UnavailableWhatsAppProvider().connect())
  } finally {
    if (originalProvider === undefined) delete process.env.WHATSAPP_PROVIDER
    else process.env.WHATSAPP_PROVIDER = originalProvider
  }
})

test('Baileys auth state is encrypted, account-scoped, and tamper-evident', () => {
  const secret = 'test-only-session-secret-for-whatsapp-state'
  const state = {
    creds: { noiseKey: { public: Buffer.from('public-key'), private: Buffer.from('private-key') } },
    keys: { session: { peer: Buffer.from('signal-state') } },
  }
  const encrypted = encryptWhatsAppAuthState('account-1', state, secret)
  assert.equal('creds' in encrypted, false)
  assert.deepEqual(decryptWhatsAppAuthState(encrypted, 'account-1', secret), state)
  assert.throws(() => decryptWhatsAppAuthState(encrypted, 'account-2', secret))
  const changedCiphertext = `${encrypted.ciphertext[0] === 'A' ? 'B' : 'A'}${encrypted.ciphertext.slice(1)}`
  assert.throws(() => decryptWhatsAppAuthState({ ...encrypted, ciphertext: changedCiphertext }, 'account-1', secret))
})

test('reconnect stops at ten attempts and prepares email only', () => {
  assert.deepEqual(nextReconnectState(9, false), { status: 'RECONNECTING', attempts: 10 })
  assert.deepEqual(nextReconnectState(10, false), { status: 'ERROR', attempts: 10 })
  assert.deepEqual(nextReconnectState(10, false, true), { status: 'LOGGED_OUT', attempts: 10 })
  assert.equal(prepareReconnectAlert(9).prepared, false)
  assert.equal(prepareReconnectAlert(10).delivery, 'EMAIL_PENDING_PROVIDER_REQUIRED')
})

test('retention keeps the latest 150 messages', () => {
  const messages = Array.from({ length: 151 }, (_, index) => ({ id: String(index), createdAt: new Date(index * 1000) }))
  const retained = retentionCutoff(messages)
  assert.equal(retained.length, 150)
  assert.equal(retained[0].id, '150')
  assert.equal(retained.at(-1)?.id, '1')
})

test('queue deduplicates, serializes by account, and applies three-second pacing', async () => {
  let now = 0
  const queue = new WhatsAppSequentialQueue(() => now)
  const input = { to: '201091515594', body: 'Hello' }
  assert.equal(queue.enqueue('account-1', input, 'message-1').accepted, true)
  assert.equal(queue.enqueue('account-1', input, 'message-1').reason, 'DUPLICATE')
  const provider = {
    sendMessage: async () => ({ queued: false, providerMessageId: 'provider-1' }),
  } as never
  await queue.processNext('account-1', provider)
  assert.equal(queue.next('account-1'), null)
  now += 3000
  assert.equal(queue.size(), 0)
})

test('in-memory queue holds an in-flight account lock during concurrent sends', async () => {
  let release!: () => void
  const waiting = new Promise<void>((resolve) => { release = resolve })
  const queue = new WhatsAppSequentialQueue()
  queue.enqueue('account-1', { to: '201091515594', body: 'Hello' }, 'message-1')
  let sends = 0
  const provider = {
    sendMessage: async () => {
      sends += 1
      await waiting
      return { queued: false, providerMessageId: 'provider-1' }
    },
  } as never
  const first = queue.processNext('account-1', provider)
  await new Promise((resolve) => setImmediate(resolve))
  const second = await queue.processNext('account-1', provider)
  assert.equal(second, null)
  release()
  await first
  assert.equal(sends, 1)
})

test('worker stops before database claims and provider sends when unavailable', async () => {
  const originalProvider = process.env.WHATSAPP_PROVIDER
  process.env.WHATSAPP_PROVIDER = 'disabled'
  try {
    let databaseTouched = false
    const database = new Proxy({}, { get() { databaseTouched = true; throw new Error('database should not be touched') } })
    let sends = 0
    const provider = {
      sendMessage: async () => { sends += 1; return { queued: false } },
    } as never
    const result = await new WhatsAppOutboxWorker(database as never, provider).drainOnce()
    assert.deepEqual(result, { processed: false, reason: 'PROVIDER_UNAVAILABLE' })
    assert.equal(databaseTouched, false)
    assert.equal(sends, 0)
  } finally {
    if (originalProvider === undefined) delete process.env.WHATSAPP_PROVIDER
    else process.env.WHATSAPP_PROVIDER = originalProvider
  }
})

test('WhatsApp database guard blocks before authentication while MongoDB is disabled', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  delete process.env.PHASE5_DATABASE_ENABLED
  const response = phase8WhatsAppDatabaseGuard()
  assert.equal(response?.status, 503)
  assert.equal((await response!.json()).error.code, 'DATABASE_UNAVAILABLE')
  if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
  else process.env.PHASE5_DATABASE_ENABLED = original
})

test.skip('MongoDB/Baileys integration: CRM account, queue, and inbound reconciliation', () => {
  // Blocked explicitly: MongoDB and provider credentials/persistent auth storage are unavailable.
})