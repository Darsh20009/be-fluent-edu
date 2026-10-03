type OtpFailure = {
  code: string
  diagnosticReason?: string
}

export function buildOtpChallengeActiveStateWhere() {
  return {
    AND: [
      { OR: [{ consumedAt: null }, { consumedAt: { isSet: false } }] },
      { OR: [{ invalidatedAt: null }, { invalidatedAt: { isSet: false } }] },
    ],
  }
}

export function buildOtpChallengeWhere(
  identity: { normalizedPhone?: string; email?: string },
  intent: 'LOGIN' | 'REGISTER',
  challengeId?: string,
) {
  return {
    ...(challengeId ? { id: challengeId } : {}),
    intent,
    ...buildOtpChallengeActiveStateWhere(),
    ...(identity.normalizedPhone
      ? { normalizedPhone: identity.normalizedPhone }
      : { email: identity.email }),
  }
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

  if (error.diagnosticReason === 'no_active_challenge') {
    return 'OTP_CHALLENGE_NOT_ACTIVE'
  }
  if (error.diagnosticReason === 'expired_challenge') {
    return 'OTP_CHALLENGE_EXPIRED'
  }

  return 'Invalid verification code'
}

export function shouldOfferRegistration(intent: 'LOGIN' | 'REGISTER', error?: string | null) {
  return intent === 'LOGIN' && error === 'ACCOUNT_NOT_FOUND'
}