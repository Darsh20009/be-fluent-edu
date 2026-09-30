import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

const setupSchema = z.object({
  password: z.string().min(8).max(72).refine((value) => Buffer.byteLength(value, 'utf8') <= 72),
})

export async function POST(request: NextRequest) {
  const access = await requirePermission('student.editProfile')
  if (isNextResponse(access)) return access

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_REQUEST' } }, { status: 400 })
  }
  const parsed = setupSchema.safeParse(input)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_PASSWORD' } }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: access.userId },
    select: {
      id: true,
      role: true,
      passwordHash: true,
      passwordSetupRequired: true,
      phoneVerifiedAt: true,
    },
  })
  if (!user || user.role !== 'STUDENT' || !user.phoneVerifiedAt) {
    return NextResponse.json({ ok: false, error: { code: 'ACCOUNT_UNAVAILABLE' } }, { status: 403 })
  }

  if (!user.passwordSetupRequired) {
    const samePassword = await bcrypt.compare(parsed.data.password, user.passwordHash)
    return samePassword
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ ok: false, error: { code: 'PASSWORD_SETUP_NOT_REQUIRED' } }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  const result = await prisma.user.updateMany({
    where: { id: user.id, passwordSetupRequired: true },
    data: { passwordHash, passwordSetupRequired: false },
  })
  if (result.count === 1) return NextResponse.json({ ok: true })

  const latestUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true, passwordSetupRequired: true },
  })
  if (latestUser && !latestUser.passwordSetupRequired && await bcrypt.compare(parsed.data.password, latestUser.passwordHash)) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ ok: false, error: { code: 'PASSWORD_SETUP_NOT_REQUIRED' } }, { status: 409 })
}