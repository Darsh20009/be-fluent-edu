import assert from 'node:assert/strict'
import test from 'node:test'
import { canAttemptOtp, canResendOtp, createOtpChallenge, isOtpExpired, OTP_POLICY, verifyOtp } from '@/lib/auth/otp'
import { normalizePhone, phoneSchema } from '@/lib/validation'
import { hasPermission, roleHasPermission } from '@/lib/authorization'
import { isAccountUsable, resolveAccountStatus } from '@/lib/auth/status'

test('normalizes supported Egyptian mobile formats canonically', () => {
  assert.equal(normalizePhone('010 1234 5678'), '+201012345678')
  assert.equal(normalizePhone('01112345678'), '+201112345678')
  assert.equal(normalizePhone('00201212345678'), '+201212345678')
  assert.equal(phoneSchema.parse('01512345678'), '+201512345678')
  assert.throws(() => phoneSchema.parse('01912345678'))
})

test('hashes OTPs without retaining or accepting plaintext', () => {
  const { code, challenge } = createOtpChallenge(new Date('2026-09-20T00:00:00Z'), 'test-secret')
  assert.notEqual(challenge.codeHash, code)
  assert.equal(verifyOtp(code, challenge.codeHash, 'test-secret'), true)
  assert.equal(verifyOtp('000000', challenge.codeHash, 'test-secret'), false)
})

test('enforces OTP expiry, attempts, and resend cooldown', () => {
  const now = new Date('2026-09-20T00:00:00Z')
  const { challenge } = createOtpChallenge(now, 'test-secret')
  assert.equal(isOtpExpired(challenge.expiresAt, now), false)
  assert.equal(canAttemptOtp({ ...challenge, attempts: OTP_POLICY.maxAttempts }), false)
  assert.equal(canResendOtp({ ...challenge, resendCount: 0 }, now, new Date(now.getTime() + 30_000)), false)
  assert.equal(canResendOtp({ ...challenge, resendCount: 0 }, now, new Date(now.getTime() + 61_000)), true)
  assert.equal(canResendOtp({ ...challenge, resendCount: OTP_POLICY.maxResends }, now, new Date(now.getTime() + 61_000)), false)
})

test('resolves account status and rejects suspended users', () => {
  assert.equal(resolveAccountStatus({ status: 'SUSPENDED', isActive: true }), 'SUSPENDED')
  assert.equal(isAccountUsable({ status: 'DISABLED', isActive: true }), false)
  assert.equal(isAccountUsable({ status: 'PENDING', isActive: false }), false)
  assert.equal(isAccountUsable({ status: 'PENDING', isActive: true }), true)
})

test('keeps staff permissions explicit and manager separate from admin', () => {
  assert.equal(roleHasPermission('STAFF', 'staff.manageWhatsApp'), false)
  assert.equal(hasPermission({ userId: 'staff', role: 'STAFF', permissions: ['staff.moveStudent'] }, 'staff.moveStudent'), true)
  assert.equal(hasPermission({ userId: 'staff', role: 'STAFF', permissions: [] }, 'staff.manageSystem'), false)
  assert.equal(roleHasPermission('MANAGER', 'admin.manageSystem'), false)
  assert.equal(roleHasPermission('ADMIN', 'admin.manageSystem'), true)
})