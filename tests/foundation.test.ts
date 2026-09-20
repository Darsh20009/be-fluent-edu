import assert from 'node:assert/strict'
import test from 'node:test'
import { hasPermission, roleHasPermission } from '@/lib/authorization'
import { hashOtp, isOtpExpired, verifyOtp } from '@/lib/auth/otp'
import { normalizePhone, phoneSchema } from '@/lib/validation'

test('normalizes Egyptian phone numbers to E.164', () => {
  assert.equal(normalizePhone('010 1234 5678'), '+201012345678')
  assert.equal(normalizePhone('+20 1012345678'), '+201012345678')
  assert.equal(phoneSchema.parse('01012345678'), '+201012345678')
})

test('rejects malformed phone numbers at the validation boundary', () => {
  assert.throws(() => phoneSchema.parse('not-a-phone'))
})

test('enforces centralized role permissions', () => {
  assert.equal(
    roleHasPermission('TEACHER', 'teacher.publishFeedback'),
    true,
  )
  assert.equal(
    roleHasPermission('STUDENT', 'admin.manageUsers'),
    false,
  )
  assert.equal(
    hasPermission(
      { userId: 'student-1', role: 'STUDENT', resourceOwnerId: 'student-2' },
      'student.submitHomework',
    ),
    false,
  )
})

test('hashes and verifies OTP values without accepting changed values', () => {
  const secret = 'test-only-auth-secret'
  const hash = hashOtp('123456', secret)
  assert.equal(verifyOtp('123456', hash, secret), true)
  assert.equal(verifyOtp('123457', hash, secret), false)
})

test('expires OTP challenges at the boundary', () => {
  const now = new Date('2026-09-19T00:00:00.000Z')
  assert.equal(isOtpExpired(new Date('2026-09-19T00:00:00.000Z'), now), true)
  assert.equal(isOtpExpired(new Date('2026-09-19T00:00:01.000Z'), now), false)
})
