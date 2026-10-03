import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildOtpChallengeWhere,
  getOtpSignInErrorMessage,
  shouldOfferRegistration,
} from '../lib/auth/otp-error-policy'

test('OTP verification is constrained to the request id, identity, and intent', () => {
  assert.deepEqual(
    buildOtpChallengeWhere(
      { normalizedPhone: '+966512345678' },
      'LOGIN',
      'request-123',
    ),
    {
      id: 'request-123',
      intent: 'LOGIN',
      consumedAt: null,
      invalidatedAt: null,
      normalizedPhone: '+966512345678',
    },
  )
  assert.deepEqual(
    buildOtpChallengeWhere({ email: 'learner@example.com' }, 'REGISTER'),
    {
      intent: 'REGISTER',
      consumedAt: null,
      invalidatedAt: null,
      email: 'learner@example.com',
    },
  )
})

test('a verified login phone without an account is handed to registration', () => {
  const unmatchedLogin = {
    code: 'INVALID_CODE',
    diagnosticReason: 'login_identity_unmatched',
  }

  const error = getOtpSignInErrorMessage('LOGIN', unmatchedLogin)
  assert.equal(error, 'ACCOUNT_NOT_FOUND')
  assert.equal(shouldOfferRegistration('LOGIN', error), true)
})

test('wrong codes and registration failures do not trigger the registration handoff', () => {
  assert.equal(
    getOtpSignInErrorMessage('LOGIN', {
      code: 'INVALID_CODE',
      diagnosticReason: 'code_mismatch',
    }),
    'Invalid verification code',
  )
  assert.equal(shouldOfferRegistration('LOGIN', 'Invalid verification code'), false)
  assert.equal(
    getOtpSignInErrorMessage('REGISTER', {
      code: 'INVALID_CODE',
      diagnosticReason: 'login_identity_unmatched',
    }),
    'Invalid verification code',
  )
  assert.equal(shouldOfferRegistration('REGISTER', 'ACCOUNT_NOT_FOUND'), false)
  assert.equal(
    getOtpSignInErrorMessage('LOGIN', {
      code: 'INVALID_CODE',
      diagnosticReason: 'no_active_challenge',
    }),
    'OTP_CHALLENGE_NOT_ACTIVE',
  )
  assert.equal(
    getOtpSignInErrorMessage('LOGIN', {
      code: 'EXPIRED_CODE',
      diagnosticReason: 'expired_challenge',
    }),
    'OTP_CHALLENGE_EXPIRED',
  )
})