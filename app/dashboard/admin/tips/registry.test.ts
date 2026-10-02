import assert from 'node:assert/strict'
import test from 'node:test'
import { canAccessTips, getScreenshotPath, TIPS_REGISTRY, validateRegistry } from '@/lib/tips/registry'

test('guide registry is complete enough to render bilingual pages', () => {
  assert.deepEqual(validateRegistry(), [])
  assert.ok(TIPS_REGISTRY.length >= 40)
  assert.equal(new Set(TIPS_REGISTRY.map(entry => entry.slug)).size, TIPS_REGISTRY.length)
  assert.deepEqual(new Set(TIPS_REGISTRY.map(entry => entry.group)), new Set(['public', 'student', 'teacher', 'admin']))
})

test('tips access is restricted to the exact ADMIN role', () => {
  assert.equal(canAccessTips('ADMIN'), true)
  for (const role of ['ASSISTANT', 'MANAGER', 'TEACHER', 'STUDENT', 'STAFF', '']) {
    assert.equal(canAccessTips(role), false, `${role} must not access the ADMIN-only guide`)
  }
})

test('screenshot paths are returned only for files the server confirms exist', () => {
  assert.equal(getScreenshotPath('admin-overview', new Set(['admin-overview'])), '/tips/screens/admin-overview.png')
  assert.equal(getScreenshotPath('admin-overview', new Set()), null)
})