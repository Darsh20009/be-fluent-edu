import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { financeCurrencies } from '@/lib/finance-core'

const schema = z.object({
  lessonCostPerLesson: z.number().finite().nonnegative().max(1_000_000),
  lessonCostCurrency: z.enum(financeCurrencies).default('EGP'),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_TEACHER_RATE' } }, { status: 400 })
  const { id } = await params
  const exists = await prisma.teacherProfile.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return NextResponse.json({ ok: false, error: { code: 'TEACHER_NOT_FOUND' } }, { status: 404 })
  const item = await prisma.teacherProfile.update({ where: { id }, data: parsed.data })
  await recordAuditEvent({ action: 'ADMIN_ACTION', userId: access.userId, details: { domain: 'FINANCE', event: 'TEACHER_LESSON_RATE_CHANGE', teacherProfileId: id, ...parsed.data } }).catch(() => undefined)
  return NextResponse.json({ item })
}