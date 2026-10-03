import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OtpServiceError, requestOtp } from '@/lib/auth/otp-service'

const requestSchema = z
  .object({
    phone: z.string().trim().optional(),
    email: z.string().trim().email().optional(),
    name: z.string().trim().min(2).max(120).optional(),
    intent: z.enum(['LOGIN', 'REGISTER']).default('LOGIN'),
    channel: z.enum(['WHATSAPP', 'EMAIL']).default('WHATSAPP'),
  })
  .refine((value) => Boolean(value.phone || value.email), {
    message: 'Phone or email is required',
  })
  .refine((value) => value.channel !== 'EMAIL' || Boolean(value.email), {
    message: 'Email is required for email verification',
    path: ['email'],
  })

function requestIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  )
}

export async function POST(request: NextRequest) {
  try {
    const input = requestSchema.parse(await request.json())
    const result = await requestOtp({
      ...input,
      ip: requestIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      ok: true,
      message: 'If the identity can be verified, a verification code will be sent.',
      channel: result.channel,
      challengeId: result.challengeId,
      expiresAt: result.expiresAt,
      resendAfterSeconds: result.resendAfterSeconds,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_REQUEST', message: 'Invalid verification request' } },
        { status: 400 },
      )
    }

    if (error instanceof OtpServiceError) {
      const status =
        error.code === 'RATE_LIMITED'
          ? 429
          : error.code === 'DELIVERY_UNAVAILABLE'
            ? 503
            : 400
      const senderConfigurationReasons = [
        'whatsapp_sender_not_configured',
        'whatsapp_multiple_senders',
      ]
      const responseCode = error.diagnosticReason === 'whatsapp_sender_not_configured'
        ? 'OTP_SENDER_NOT_CONFIGURED'
        : error.diagnosticReason === 'whatsapp_multiple_senders'
          ? 'OTP_SENDER_CONFIGURATION_INVALID'
          : error.code
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: responseCode,
            message: senderConfigurationReasons.includes(error.diagnosticReason || '')
              ? 'WhatsApp verification sender configuration requires administrator attention.'
              : error.message,
          },
        },
        { status },
      )
    }

    return NextResponse.json(
      { ok: false, error: { code: 'OTP_REQUEST_FAILED', message: 'Unable to request verification' } },
      { status: 500 },
    )
  }
}