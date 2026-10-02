import assert from 'node:assert/strict'
import test from 'node:test'
import { AppError } from '@/lib/errors'
import { isValidQMeetBaseUrl, QMeetClient, qmeetCreatePayload } from '@/lib/qmeet'

test('QMeet sends its API key header on every documented request', async () => {
  const methods: string[] = []
  const client = new QMeetClient({
    apiKey: 'synthetic-test-key',
    baseUrl: 'https://qmeet.example',
    fetcher: async (url, init) => {
      assert.ok(String(url).startsWith('https://qmeet.example/api/qmeet/v1/meetings'))
      assert.equal(new Headers(init?.headers).get('x-qmeet-api-key'), 'synthetic-test-key')
      assert.equal(init?.redirect, 'error')
      assert.ok(init?.signal instanceof AbortSignal)
      methods.push(init?.method || 'GET')
      return new Response(JSON.stringify({ roomName: 'qa-room', joinUrl: 'https://qmeet.example/join' }))
    },
  })
  await client.createMeeting({ title: 'QA session', scheduledAt: '2026-11-01T10:00:00Z', durationMinutes: 60 })
  await client.listMeetings()
  await client.getMeeting('qa-room')
  await client.deleteMeeting('qa-room')
  assert.deepEqual(methods, ['POST', 'GET', 'GET', 'DELETE'])
})

test('QMeet adapts existing class times to the documented creation body', async () => {
  let payload: unknown
  const client = new QMeetClient({
    apiKey: 'synthetic-test-key',
    baseUrl: 'https://qmeet.example/',
    fetcher: async (_url, init) => {
      payload = JSON.parse(String(init?.body))
      return new Response(JSON.stringify({ roomName: 'qa-room', joinUrl: 'https://qmeet.example/join' }))
    },
  })
  await client.createMeeting({
    roomName: 'local-session-reference',
    title: 'QA session',
    startTime: '2026-11-01T10:00:00Z',
    endTime: '2026-11-01T11:00:00Z',
  })
  assert.deepEqual(payload, { title: 'QA session', scheduledAt: '2026-11-01T10:00:00.000Z', durationMinutes: 60 })
})

test('QMeet rejects invalid schedules and durations without a request', () => {
  for (const input of [
    { scheduledAt: 'not-a-date' },
    { durationMinutes: 0 },
    { durationMinutes: 1.5 },
    { startTime: '2026-11-01T11:00:00Z', endTime: '2026-11-01T10:00:00Z' },
  ]) assert.throws(() => qmeetCreatePayload(input), AppError)
})

test('QMeet requires a valid HTTPS base URL without embedded credentials', async () => {
  assert.equal(isValidQMeetBaseUrl('https://qmeet.example/'), true)
  for (const value of ['not-a-url', 'http://qmeet.example', 'https://user:password@qmeet.example', 'https://qmeet.example?key=test']) {
    assert.equal(isValidQMeetBaseUrl(value), false)
    let called = false
    const client = new QMeetClient({ apiKey: 'synthetic-test-key', baseUrl: value, fetcher: async () => { called = true; return new Response('{}') } })
    await assert.rejects(() => client.listMeetings(), (error: unknown) => error instanceof AppError && error.code === 'CONFIGURATION_ERROR')
    assert.equal(called, false)
  }
})

test('QMeet sanitizes network and malformed provider responses', async () => {
  for (const fetcher of [
    async () => { throw new Error('private provider detail') },
    async () => new Response('not-json'),
  ]) {
    const client = new QMeetClient({ apiKey: 'synthetic-test-key', baseUrl: 'https://qmeet.example', fetcher })
    await assert.rejects(() => client.listMeetings(), (error: unknown) =>
      error instanceof AppError && !error.message.includes('private provider detail') && [502, 503].includes(error.status))
  }
})