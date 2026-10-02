import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { financeCurrencies, financeMonthRange } from '@/lib/finance-core'

const schema = z.object({
  monthKey: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(500),
  amount: z.number().finite().positive().max(1_000_000_000),
  currency: z.enum(financeCurrencies).default('EGP'),
})

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_EXPENSE' } }, { status: 400 })
  try {
    financeMonthRange(parsed.data.monthKey)
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_MONTH' } }, { status: 400 })
  }
  const item = await prisma.financeExpense.create({
    data: { ...parsed.data, amount: Math.round(parsed.data.amount * 100) / 100, createdById: access.userId },
  })
  await recordAuditEvent({ action: 'ADMIN_ACTION', userId: access.userId, details: { domain: 'FINANCE', event: 'EXPENSE_CREATED', expenseId: item.id, monthKey: item.monthKey, category: item.category, currency: item.currency, amount: item.amount } }).catch(() => undefined)
  return NextResponse.json({ item }, { status: 201 })
}