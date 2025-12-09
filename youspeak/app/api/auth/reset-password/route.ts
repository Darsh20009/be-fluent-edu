import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found / المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        passwordHash: hashedPassword,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully / تم تعيين كلمة المرور بنجاح',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Password reset failed / فشل تعيين كلمة المرور' },
      { status: 500 }
    )
  }
}
