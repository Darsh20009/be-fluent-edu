import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const viewPasswordSchema = z.object({
  userId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = viewPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User not found / المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Generate a temporary password since we cannot decrypt hashed passwords
    const tempPassword = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15)

    // Update user with new temporary password
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10)
    
    await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        passwordHash: hashedTempPassword,
      },
    })

    return NextResponse.json({
      success: true,
      password: tempPassword,
      message: 'تم إنشاء كلمة مرور مؤقتة / Temporary password generated',
      note: 'هذه كلمة مرور مؤقتة. الرجاء تغييرها بعد تسجيل الدخول / This is a temporary password. Please change it after logging in.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('View password error:', error)
    return NextResponse.json(
      { error: 'An error occurred / حدث خطأ' },
      { status: 500 }
    )
  }
}
