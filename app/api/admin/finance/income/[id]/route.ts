import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { financeCurrencies, financeMonthRange } from '@/lib/finance-core'

const schema = z.object({
  amount: z.number().finite().positive().max(1_000_000_000).optional(),
  currency: z.enum(financeCurrencies).optional(),
  monthKey: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  receivedAt: z.coerce.date().optional(),
  method: z.string().trim().max(80).nullable().optional(),
  studentId: z.string().trim().min(1).nullable().optional(),
  subscriptionId: z.string().trim().min(1).nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0)

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_INCOME' } }, { status: 400 })
  const { id } = await params
  const existing = await prisma.financeIncome.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'INCOME_NOT_FOUND' } }, { status: 404 })
  const data = parsed.data
  const monthKey = data.monthKey ?? existing.monthKey
  const receivedAt = data.receivedAt ?? existing.receivedAt
  try {
    const range = financeMonthRange(monthKey)
    if (receivedAt < range.start || receivedAt >= range.end) {
      return NextResponse.json({ ok: false, error: { code: 'DATE_MONTH_MISMATCH' } }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_MONTH' } }, { status: 400 })
  }
  if (data.studentId) {
    const student = await prisma.user.findFirst({ where: { id: data.studentId, role: 'STUDENT' }, select: { id: true } })
    if (!student) return NextResponse.json({ ok: false, error: { code: 'STUDENT_NOT_FOUND' } }, { status: 404 })
  }
  const item = await prisma.financeIncome.update({
    where: { id },
    data: {
      ...data,
      monthKey,
      receivedAt,
      ...(data.amount !== undefined ? { amount: Math.round(data.amount * 100) / 100 } : {}),
    },
  })
  await recordAuditEvent({ action: 'ADMIN_ACTION', userId: access.userId, details: { domain: 'FINANCE', event: 'INCOME_UPDATED', incomeId: id, fields: Object.keys(data) } }).catch(() => undefined)
  return NextResponse.json({ item })
}