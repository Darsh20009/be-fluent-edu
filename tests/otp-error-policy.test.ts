import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getOtpSignInErrorMessage,
  shouldOfferRegistration,
} from '../lib/auth/otp-error-policy'

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
})