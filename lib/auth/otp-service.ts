import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { normalizePhone } from '@/lib/validation'
import { recordAuditEvent } from '@/lib/audit'
import {
  canAttemptOtp,
  canResendOtp,
  createOtpChallenge,
  hashOtp,
  isOtpExpired,
  OTP_POLICY,
  verifyOtp as verifyOtpCode,
} from './otp'
import {
  getOtpDeliveryProvider,
  type OtpDeliveryChannel,
  type OtpDeliveryProvider,
} from './providers'
import { WhatsAppOtpDeliveryError } from '@/lib/whatsapp/otp-delivery'
import { isAccountUsable } from './status'
import { buildOtpChallengeWhere } from './otp-error-policy'

export type OtpIntent = 'LOGIN' | 'REGISTER'

export interface RequestOtpInput {
  phone?: string
  email?: string
  name?: string
  intent: OtpIntent
  channel: OtpDeliveryChannel
  ip?: string
  userAgent?: string
  provider?: OtpDeliveryProvider
}

export interface VerifyOtpInput {
  phone?: string
  email?: string
  challengeId?: string
  code: string
  intent: OtpIntent
  ip?: string
  userAgent?: string
}

export class OtpServiceError extends Error {
  constructor(
    public readonly code:
      | 'INVALID_REQUEST'
      | 'RATE_LIMITED'
      | 'DELIVERY_UNAVAILABLE'
      | 'INVALID_CODE'
      | 'EXPIRED_CODE'
      | 'ACCOUNT_UNAVAILABLE'
      | 'IDENTITY_CONFLICT',
    message = 'Unable to process verification request',
    public readonly diagnosticReason?:
      | 'no_active_challenge'
      | 'expired_challenge'
      | 'attempt_limit'
      | 'code_mismatch'
      | 'login_identity_unmatched'
      | 'account_unavailable'
      | 'whatsapp_provider_unavailable'
      | 'whatsapp_sender_not_configured'
      | 'whatsapp_multiple_senders'
      | 'whatsapp_session_in_use'
      | 'whatsapp_send_failed'
      | 'delivery_failed',
  ) {
    super(message)
    this.name = 'OtpServiceError'
  }
}

function audit(action: Parameters<typeof recordAuditEvent>[0]['action'], userId?: string) {
  // Authentication must not reveal OTP material or fail solely because an
  // audit write is temporarily unavailable.
  void recordAuditEvent({ action, userId }).catch(() => undefined)
}

function hashRateKey(value: string): string {
  return hashOtp(value)
}

function assertIdentity(input: { phone?: string; email?: string }) {
  const normalizedPhone = input.phone ? normalizePhone(input.phone) : undefined
  const email = input.email?.trim().toLowerCase() || undefined

  if (!normalizedPhone && !email) {
    throw new OtpServiceError('INVALID_REQUEST', 'Phone or email is required')
  }

  return { normalizedPhone, email }
}

async function consumeRateLimit(
  kind: string,
  rawKey: string,
  limit: number,
  windowSeconds: number,
  now = new Date(),
) {
  const key = hashRateKey(rawKey)
  const existing = await prisma.authRateLimit.findUnique({
    where: { key_kind: { key, kind } },
  })

  if (!existing) {
    await prisma.authRateLimit.create({
      data: {
        key,
        kind,
        windowStartedAt: now,
        count: 1,
        blockedUntil: null,
      },
    })
    return
  }

  if (existing.blockedUntil && existing.blockedUntil > now) {
    throw new OtpServiceError('RATE_LIMITED')
  }

  const windowExpired =
    now.getTime() - existing.windowStartedAt.getTime() >= windowSeconds * 1000

  if (windowExpired) {
    await prisma.authRateLimit.update({
      where: { id: existing.id },
      data: {
        windowStartedAt: now,
        count: 1,
        blockedUntil: null,
      },
    })
    return
  }

  if (existing.count >= limit) {
    const blockedUntil = new Date(
      existing.windowStartedAt.getTime() + windowSeconds * 1000,
    )
    await prisma.authRateLimit.update({
      where: { id: existing.id },
      data: { blockedUntil },
    })
    throw new OtpServiceError('RATE_LIMITED')
  }

  await prisma.authRateLimit.update({
    where: { id: existing.id },
    data: { count: { increment: 1 } },
  })
}

async function invalidatePreviousChallenges(
  identity: { normalizedPhone?: string; email?: string },
  intent: OtpIntent,
  keepChallengeId: string,
  createdBefore: Date,
) {
  const identityFilters = [
    identity.normalizedPhone ? { normalizedPhone: identity.normalizedPhone } : undefined,
    identity.email ? { email: identity.email } : undefined,
  ].filter(Boolean) as Array<{ normalizedPhone?: string; email?: string }>

  if (identityFilters.length === 0) return

  await prisma.authOtpChallenge.updateMany({
    where: {
      intent,
      consumedAt: null,
      invalidatedAt: null,
      id: { not: keepChallengeId },
      createdAt: { lt: createdBefore },
      OR: identityFilters,
    },
    data: { invalidatedAt: new Date() },
  })
}

export async function requestOtp(input: RequestOtpInput) {
  const identity = assertIdentity(input)
  const now = new Date()

  if (identity.normalizedPhone) {
    await consumeRateLimit(
      'OTP_REQUEST_PHONE',
      identity.normalizedPhone,
      OTP_POLICY.requestLimit,
      OTP_POLICY.resendWindowSeconds,
      now,
    )
  }
  if (input.ip) {
    await consumeRateLimit(
      'OTP_REQUEST_IP',
      input.ip,
      OTP_POLICY.requestLimit * 4,
      OTP_POLICY.resendWindowSeconds,
      now,
    )
  }

  const previous = await prisma.authOtpChallenge.findFirst({
    where: {
      intent: input.intent,
      consumedAt: null,
      invalidatedAt: null,
      ...(identity.normalizedPhone
        ? { normalizedPhone: identity.normalizedPhone }
        : { email: identity.email }),
    },
    orderBy: { createdAt: 'desc' },
  })

  if (previous) {
    const previousChallenge = {
      codeHash: previous.codeHash,
      expiresAt: previous.expiresAt,
      attempts: previous.attempts,
      resendCount: previous.resendCount,
    }
    if (!canResendOtp(previousChallenge, previous.lastSentAt, now)) {
      throw new OtpServiceError('RATE_LIMITED')
    }
  }

  const { challenge, code } = createOtpChallenge(now)
  const provider = input.provider || getOtpDeliveryProvider(input.channel)
  const created = await prisma.authOtpChallenge.create({
    data: {
      normalizedPhone: identity.normalizedPhone,
      email: identity.email,
      name: input.name?.trim() || null,
      intent: input.intent,
      channel: input.channel,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
      attempts: 0,
      maxAttempts: OTP_POLICY.maxAttempts,
      resendCount: previous ? previous.resendCount + 1 : 0,
      requestedAt: now,
      lastSentAt: now,
      requestIpHash: input.ip ? hashRateKey(input.ip) : null,
      userAgentHash: input.userAgent ? hashRateKey(input.userAgent) : null,
    },
  })

  audit('AUTH_OTP_REQUESTED')

  try {
    await provider.sendVerificationCode({
      phone: identity.normalizedPhone,
      email: identity.email,
      code,
      expiresInSeconds: OTP_POLICY.expiresInSeconds,
    })
    audit('AUTH_OTP_SENT')
  } catch (error) {
    await prisma.authOtpChallenge.update({
      where: { id: created.id },
      data: { invalidatedAt: new Date() },
    })
    const whatsappDeliveryReasons = {
          PROVIDER_UNAVAILABLE: 'whatsapp_provider_unavailable',
          SENDER_NOT_CONFIGURED: 'whatsapp_sender_not_configured',
          MULTIPLE_SENDERS: 'whatsapp_multiple_senders',
          SESSION_IN_USE: 'whatsapp_session_in_use',
          SEND_FAILED: 'whatsapp_send_failed',
    } as const
    const deliveryReason: NonNullable<OtpServiceError['diagnosticReason']> =
      error instanceof WhatsAppOtpDeliveryError
        ? whatsappDeliveryReasons[error.reason]
        : 'delivery_failed'
    console.warn('OTP delivery failed', {
      channel: input.channel,
      reason: deliveryReason,
    })
    throw new OtpServiceError('DELIVERY_UNAVAILABLE', undefined, deliveryReason)
  }

  try {
    await invalidatePreviousChallenges(identity, input.intent, created.id, created.createdAt)
  } catch {
    // The delivered challenge remains verifiable by its id if cleanup of older
    // challenges fails; do not report a delivery failure after sending the code.
    console.warn('OTP previous challenge cleanup failed', {
      channel: input.channel,
      reason: 'supersession_failed',
    })
  }

  return {
    challengeId: created.id,
    channel: input.channel,
    expiresAt: challenge.expiresAt,
    resendAfterSeconds: OTP_POLICY.resendCooldownSeconds,
  }
}

async function findUserByIdentity(identity: {
  normalizedPhone?: string
  email?: string
}) {
  const filters = [
    identity.normalizedPhone ? { normalizedPhone: identity.normalizedPhone } : undefined,
    identity.normalizedPhone ? { phone: identity.normalizedPhone } : undefined,
    identity.email ? { email: identity.email } : undefined,
  ].filter(Boolean) as Array<{
    normalizedPhone?: string
    phone?: string
    email?: string
  }>

  return prisma.user.findFirst({
    where: { OR: filters },
    include: { staffPermissions: { where: { granted: true } } },
  })
}

async function createOtpUser(
  identity: { normalizedPhone?: string; email?: string },
  challenge: { name: string | null; email: string | null },
) {
  if (!identity.normalizedPhone) {
    throw new OtpServiceError('INVALID_REQUEST', 'Phone is required for registration')
  }

  const email =
    identity.email ||
    challenge.email ||
    `${identity.normalizedPhone.replace(/\D/g, '')}@otp.befluent.invalid`
  const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12)
  return prisma.user.create({
    data: {
      name: challenge.name?.trim() || 'Be Fluent Student',
      email,
      phone: identity.normalizedPhone,
      normalizedPhone: identity.normalizedPhone,
      passwordHash,
      passwordSetupRequired: true,
      role: 'STUDENT',
      isActive: true,
      status: 'ACTIVE',
      phoneVerifiedAt: new Date(),
      lastSeenAt: new Date(),
    },
    include: { staffPermissions: { where: { granted: true } } },
  })
}

export async function verifyOtp(input: VerifyOtpInput) {
  const identity = assertIdentity(input)
  const now = new Date()

  if (identity.normalizedPhone) {
    await consumeRateLimit(
      'OTP_VERIFY_PHONE',
      identity.normalizedPhone,
      OTP_POLICY.verificationLimit,
      OTP_POLICY.resendWindowSeconds,
      now,
    )
  }
  if (input.ip) {
    await consumeRateLimit(
      'OTP_VERIFY_IP',
      input.ip,
      OTP_POLICY.verificationLimit * 3,
      OTP_POLICY.resendWindowSeconds,
      now,
    )
  }

  const challenge = await prisma.authOtpChallenge.findFirst({
    where: buildOtpChallengeWhere(identity, input.intent, input.challengeId),
    orderBy: { createdAt: 'desc' },
  })

  if (!challenge) {
    const challengeById = input.challengeId
      ? await prisma.authOtpChallenge.findUnique({
          where: { id: input.challengeId },
          select: {
            intent: true,
            normalizedPhone: true,
            email: true,
            consumedAt: true,
            invalidatedAt: true,
            expiresAt: true,
          },
        })
      : null
    const identityMatches = challengeById
      ? identity.normalizedPhone
        ? challengeById.normalizedPhone === identity.normalizedPhone
        : challengeById.email === identity.email
      : null
    console.warn('OTP challenge lookup missed', {
      challengeIdProvided: Boolean(input.challengeId),
      challengeRecordFound: Boolean(challengeById),
      intentMatches: challengeById ? challengeById.intent === input.intent : null,
      identityMatches,
      challengeConsumed: challengeById ? Boolean(challengeById.consumedAt) : null,
      challengeInvalidated: challengeById ? Boolean(challengeById.invalidatedAt) : null,
      challengeExpired: challengeById ? isOtpExpired(challengeById.expiresAt, now) : null,
    })
    audit('AUTH_OTP_FAILED')
    throw new OtpServiceError('INVALID_CODE', undefined, 'no_active_challenge')
  }

  if (isOtpExpired(challenge.expiresAt, now)) {
    await prisma.authOtpChallenge.update({
      where: { id: challenge.id },
      data: { invalidatedAt: now },
    })
    audit('AUTH_OTP_EXPIRED')
    throw new OtpServiceError('EXPIRED_CODE', undefined, 'expired_challenge')
  }

  if (!canAttemptOtp({
    codeHash: challenge.codeHash,
    expiresAt: challenge.expiresAt,
    attempts: challenge.attempts,
    resendCount: challenge.resendCount,
  })) {
    await prisma.authOtpChallenge.update({
      where: { id: challenge.id },
      data: { invalidatedAt: now },
    })
    audit('AUTH_OTP_FAILED')
    throw new OtpServiceError('RATE_LIMITED', undefined, 'attempt_limit')
  }

  await prisma.authOtpChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } },
  })

  if (!verifyOtpCode(input.code, challenge.codeHash)) {
    if (challenge.attempts + 1 >= challenge.maxAttempts) {
      await prisma.authOtpChallenge.update({
        where: { id: challenge.id },
        data: { invalidatedAt: now },
      })
    }
    audit('AUTH_OTP_FAILED')
    throw new OtpServiceError('INVALID_CODE', undefined, 'code_mismatch')
  }

  const user = await findUserByIdentity(identity)
  if (!user && input.intent === 'LOGIN') {
    await prisma.authOtpChallenge.update({
      where: { id: challenge.id },
      data: { invalidatedAt: now },
    })
    audit('AUTH_OTP_FAILED')
    throw new OtpServiceError('INVALID_CODE', undefined, 'login_identity_unmatched')
  }

  const verifiedUser = user || await createOtpUser(identity, challenge)
  if (!isAccountUsable(verifiedUser)) {
    await prisma.authOtpChallenge.update({
      where: { id: challenge.id },
      data: { invalidatedAt: now },
    })
    audit('AUTH_SESSION_REVOKED', verifiedUser.id)
    throw new OtpServiceError('ACCOUNT_UNAVAILABLE', undefined, 'account_unavailable')
  }

  await prisma.authOtpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: now, userId: verifiedUser.id },
  })
  await prisma.user.update({
    where: { id: verifiedUser.id },
    data: {
      normalizedPhone: identity.normalizedPhone || verifiedUser.normalizedPhone,
      phoneVerifiedAt: identity.normalizedPhone ? now : verifiedUser.phoneVerifiedAt,
      lastSeenAt: now,
    },
  })
  audit('AUTH_OTP_VERIFIED', verifiedUser.id)
  audit('AUTH_LOGIN_SUCCESS', verifiedUser.id)

  return verifiedUser
}