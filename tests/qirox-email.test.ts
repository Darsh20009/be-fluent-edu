import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { htmlToEmailText, qiroxEmailProviderStatus, sendEmail } from '@/lib/email'

const originalFetch = globalThis.fetch
const originalNodeEnv = process.env.NODE_ENV
const originalDevelopmentKey = process.env.QIROX_EMAIL_API_KEY
const originalProductionKey = process.env.QIROX_EMAIL_API_KEY_PRODUCTION

function setNodeEnv(value?: string) {
  if (value === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV')
  else Reflect.set(process.env, 'NODE_ENV', value)
}

afterEach(() => {
  globalThis.fetch = originalFetch
  setNodeEnv(originalNodeEnv)
  if (originalDevelopmentKey === undefined) delete process.env.QIROX_EMAIL_API_KEY
  else process.env.QIROX_EMAIL_API_KEY = originalDevelopmentKey
  if (originalProductionKey === undefined) delete process.env.QIROX_EMAIL_API_KEY_PRODUCTION
  else process.env.QIROX_EMAIL_API_KEY_PRODUCTION = originalProductionKey
})

test('Qirox email converts existing HTML templates to readable text and sends the documented payload', async () => {
  setNodeEnv('development')
  process.env.QIROX_EMAIL_API_KEY = 'qrx_project_email_test_secret'
  let requestUrl = ''
  let requestBody: Record<string, unknown> | undefined
  let requestHeaders: Headers | undefined
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestUrl = String(input)
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>
    requestHeaders = new Headers(init?.headers)
    return new Response(JSON.stringify({ id: 'qirox-message-test' }), { status: 202 })
  }) as typeof fetch

  const result = await sendEmail({
    to: 'student@example.test',
    recipientName: 'Student',
    subject: 'Class update',
    html: '<p>Class &amp; feedback</p><script>secret()</script>',
    idempotencyKey: 'notification:test-row',
  })

  assert.deepEqual(result, { success: true, providerMessageId: 'qirox-message-test' })
  assert.match(requestUrl, /\/api\/v1\/projects\/[^/]+\/email$/)
  assert.equal(requestHeaders?.get('authorization'), 'Bearer qrx_project_email_test_secret')
  assert.equal(requestHeaders?.get('idempotency-key'), 'notification:test-row')
  assert.deepEqual(requestBody, {
    recipient: { email: 'student@example.test', name: 'Student' },
    subject: 'Class update',
    message: 'Class & feedback',
  })
})

test('HTML conversion removes scripts and decodes common entities', () => {
  assert.equal(htmlToEmailText('<style>.x{color:red}</style><p>A&nbsp;&amp; B</p><script>alert(1)</script>'), 'A & B')
  assert.equal(htmlToEmailText('<a href="https://befluent.example/dashboard">Open dashboard</a>'), 'Open dashboard (https://befluent.example/dashboard)')
})

test('missing provider configuration fails without making a request', async () => {
  setNodeEnv('development')
  delete process.env.QIROX_EMAIL_API_KEY
  let called = false
  globalThis.fetch = (async () => {
    called = true
    return new Response('{}', { status: 200 })
  }) as typeof fetch

  assert.deepEqual(qiroxEmailProviderStatus(), {
    configured: false,
    environment: 'development',
    reason: 'MISSING_API_KEY',
  })
  assert.deepEqual(await sendEmail({ to: 'student@example.test', subject: 'Hello', text: 'Hello' }), {
    success: false,
    error: 'CONFIGURATION_ERROR',
    retryable: false,
  })
  assert.equal(called, false)
})

test('production never falls back to the development key', async () => {
  setNodeEnv('production')
  process.env.QIROX_EMAIL_API_KEY = 'qrx_project_email_development_key'
  delete process.env.QIROX_EMAIL_API_KEY_PRODUCTION

  assert.equal(qiroxEmailProviderStatus().configured, false)
  assert.deepEqual(await sendEmail({ to: 'student@example.test', subject: 'Hello', text: 'Hello' }), {
    success: false,
    error: 'CONFIGURATION_ERROR',
    retryable: false,
  })
})

test('production uses only the separate production key', async () => {
  setNodeEnv('production')
  process.env.QIROX_EMAIL_API_KEY = 'qrx_project_email_development_key'
  process.env.QIROX_EMAIL_API_KEY_PRODUCTION = 'qrx_project_email_production_key'
  let authorization = ''
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    authorization = new Headers(init?.headers).get('authorization') || ''
    return new Response('{}', { status: 202 })
  }) as typeof fetch

  const result = await sendEmail({ to: 'student@example.test', subject: 'Hello', text: 'Hello' })

  assert.deepEqual(result, { success: true, providerMessageId: undefined })
  assert.equal(authorization, 'Bearer qrx_project_email_production_key')
})

test('HTTP failures return safe retry classification without provider details', async () => {
  setNodeEnv('development')
  process.env.QIROX_EMAIL_API_KEY = 'qrx_project_email_test_secret'
  globalThis.fetch = (async () => new Response('private provider response', { status: 429 })) as typeof fetch

  assert.deepEqual(await sendEmail({ to: 'student@example.test', subject: 'Hello', text: 'Hello' }), {
    success: false,
    error: 'HTTP_ERROR',
    retryable: true,
  })
})

test('network failures are retryable and do not expose provider details', async () => {
  setNodeEnv('development')
  process.env.QIROX_EMAIL_API_KEY = 'qrx_project_email_test_secret'
  globalThis.fetch = (async () => {
    throw new Error('private provider response')
  }) as typeof fetch

  assert.deepEqual(await sendEmail({ to: 'student@example.test', subject: 'Hello', text: 'Hello' }), {
    success: false,
    error: 'PROVIDER_UNAVAILABLE',
    retryable: true,
  })
})

test('unsupported attachments and invalid recipients fail before a provider request', async () => {
  setNodeEnv('development')
  process.env.QIROX_EMAIL_API_KEY = 'qrx_project_email_test_secret'
  let calls = 0
  globalThis.fetch = (async () => {
    calls += 1
    return new Response('{}', { status: 200 })
  }) as typeof fetch

  assert.deepEqual(await sendEmail({
    to: 'student@example.test',
    subject: 'Hello',
    text: 'Hello',
    attachments: [{ filename: 'file.txt', fileblob: 'x', content_type: 'text/plain' }],
  }), { success: false, error: 'ATTACHMENTS_UNSUPPORTED', retryable: false })
  assert.deepEqual(await sendEmail({ to: 'not-an-email', subject: 'Hello', text: 'Hello' }), {
    success: false,
    error: 'INVALID_MESSAGE',
    retryable: false,
  })
  assert.equal(calls, 0)
})