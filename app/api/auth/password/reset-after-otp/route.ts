import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { requireSession } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

const resetSchema = z.object({
  newPassword: z.string().min(8).refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'Password must be 72 bytes or fewer',
  ),
})

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Verify your identity first.' } },
      { status: 401 },
    )
  }

  try {
    const data = resetSchema.parse(await request.json())
    const passwordHash = await bcrypt.hash(data.newPassword, 12)
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash, passwordSetupRequired: false },
      select: { id: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_PASSWORD', message: 'Use at least 8 characters and no more than 72 bytes.' } },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { ok: false, error: { code: 'PASSWORD_RESET_FAILED', message: 'Unable to update your password.' } },
      { status: 500 },
    )
  }
}