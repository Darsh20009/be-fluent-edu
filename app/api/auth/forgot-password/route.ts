import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    const isEmail = validatedData.emailOrPhone.includes('@')

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: validatedData.emailOrPhone }
        : { phone: validatedData.emailOrPhone },
      include: {
        StudentProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found / المستخدم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'User verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred / حدث خطأ' },
      { status: 500 }
    )
  }
}
