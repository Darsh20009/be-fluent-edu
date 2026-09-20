import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requestOtp, OtpServiceError } from '@/lib/auth/otp-service'

const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    const isEmail = validatedData.emailOrPhone.includes('@')
    await requestOtp({
      email: isEmail ? validatedData.emailOrPhone : undefined,
      phone: isEmail ? undefined : validatedData.emailOrPhone,
      intent: 'LOGIN',
      channel: isEmail ? 'EMAIL' : 'WHATSAPP',
    })

    return NextResponse.json({
      ok: true,
      message: 'If the identity can be verified, a verification code will be sent.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof OtpServiceError && error.code === 'RATE_LIMITED') {
      return NextResponse.json(
        { ok: false, error: 'Please wait before requesting another code.' },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Unable to process the request / تعذر تنفيذ الطلب' },
      { status: 500 }
    )
  }
}
