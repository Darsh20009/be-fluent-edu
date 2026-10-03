import assert from 'node:assert/strict'
import test from 'node:test'
import { suppressSensitiveSessionLogs } from '../lib/whatsapp/suppress-sensitive-session-logs'

test('filters libsignal session objects without suppressing ordinary logs', () => {
  const entries: unknown[][] = []
  const fakeConsole = {
    info: (...args: unknown[]) => entries.push(['info', ...args]),
    warn: (...args: unknown[]) => entries.push(['warn', ...args]),
  } as unknown as Console

  suppressSensitiveSessionLogs(fakeConsole)
  fakeConsole.info('Closing session:', { privateKey: 'never-log' })
  fakeConsole.info('Opening session:', { rootKey: 'never-log' })
  fakeConsole.warn('Session already closed', { messageKeys: ['never-log'] })
  fakeConsole.info('WhatsApp connection is ready')
  fakeConsole.warn('WhatsApp connection was delayed')

  assert.deepEqual(entries, [
    ['info', 'WhatsApp connection is ready'],
    ['warn', 'WhatsApp connection was delayed'],
  ])
})