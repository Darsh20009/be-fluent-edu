import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from 'node:crypto'

export const OTP_POLICY = {
  digits: 6,
  expiresInSeconds: 5 * 60,
  maxAttempts: 5,
  verificationRateLimitWindowSeconds: 10 * 60,
  verificationLimit: 10,
} as const

export interface OtpChallenge {
  codeHash: string
  expiresAt: Date
  attempts: number
}

function secretFromEnvironment(): string {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('An auth secret is required for OTP hashing')
  }
  return secret
}

export function generateOtp(): string {
  const minimum = 10 ** (OTP_POLICY.digits - 1)
  const maximum = 10 ** OTP_POLICY.digits
  return String(randomInt(minimum, maximum))
}

export function hashOtp(code: string, secret = secretFromEnvironment()): string {
  return createHmac('sha256', secret).update(code).digest('hex')
}

export function verifyOtp(
  code: string,
  expectedHash: string,
  secret = secretFromEnvironment(),
): boolean {
  const actual = Buffer.from(hashOtp(code, secret), 'utf8')
  const expected = Buffer.from(expectedHash, 'utf8')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function createOtpChallenge(
  now = new Date(),
  secret = secretFromEnvironment(),
): { challenge: OtpChallenge; code: string } {
  const code = generateOtp()
  return {
    code,
    challenge: {
      codeHash: hashOtp(code, secret),
      expiresAt: new Date(now.getTime() + OTP_POLICY.expiresInSeconds * 1000),
      attempts: 0,
    },
  }
}

export function isOtpExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime()
}

export function canAttemptOtp(challenge: OtpChallenge): boolean {
  return challenge.attempts < OTP_POLICY.maxAttempts
}
