type OtpFailure = {
  code: string
  diagnosticReason?: string
}

export function getOtpSignInErrorMessage(
  intent: 'LOGIN' | 'REGISTER',
  error: OtpFailure,
) {
  if (
    intent === 'LOGIN' &&
    error.code === 'INVALID_CODE' &&
    error.diagnosticReason === 'login_identity_unmatched'
  ) {
    return 'ACCOUNT_NOT_FOUND'
  }

  return 'Invalid verification code'
}

export function shouldOfferRegistration(intent: 'LOGIN' | 'REGISTER', error?: string | null) {
  return intent === 'LOGIN' && error === 'ACCOUNT_NOT_FOUND'
}