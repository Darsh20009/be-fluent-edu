import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OtpServiceError, verifyOtp } from '@/lib/auth/otp-service'

const verifySchema = z
  .object({
    phone: z.string().trim().optional(),
    email: z.string().trim().email().optional(),
    code: z.string().regex(/^\d{6}$/),
    intent: z.enum(['LOGIN', 'REGISTER']).default('LOGIN'),
  })
  .refine((value) => Boolean(value.phone || value.email), {
    message: 'Phone or email is required',
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
    const input = verifySchema.parse(await request.json())
    const user = await verifyOtp({
      ...input,
      ip: requestIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      ok: true,
      verified: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      message: 'Verification succeeded. Establish a session with the NextAuth otp provider.',
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
          : error.code === 'ACCOUNT_UNAVAILABLE'
            ? 403
            : 400
      return NextResponse.json(
        { ok: false, error: { code: error.code, message: 'Verification failed' } },
        { status },
      )
    }

    return NextResponse.json(
      { ok: false, error: { code: 'OTP_VERIFY_FAILED', message: 'Verification failed' } },
      { status: 500 },
    )
  }
}