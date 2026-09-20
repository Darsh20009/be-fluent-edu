import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'

const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const session = await requirePermission('admin.manageUsers')
    if (isNextResponse(session)) return session

    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    if (session.userId !== validatedData.userId && session.role !== 'ADMIN') {
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 },
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

    return NextResponse.json(
      { error: 'Password reset failed / فشل تعيين كلمة المرور' },
      { status: 500 }
    )
  }
}
