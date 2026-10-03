import assert from 'node:assert/strict'
import test from 'node:test'
import { safeLocalNotificationHref } from '../lib/notifications/view'

test('notification navigation accepts only same-origin absolute paths', () => {
  assert.equal(safeLocalNotificationHref('/dashboard/student/feedback'), '/dashboard/student/feedback')
  assert.equal(safeLocalNotificationHref('/dashboard/student/learning?view=Goals'), '/dashboard/student/learning?view=Goals')
  assert.equal(safeLocalNotificationHref('https://example.com'), null)
  assert.equal(safeLocalNotificationHref('//example.com/path'), null)
  assert.equal(safeLocalNotificationHref('/\\example.com'), null)
  assert.equal(safeLocalNotificationHref(null), null)
})