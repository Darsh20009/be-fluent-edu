import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { financeCurrencies } from '@/lib/finance-core'

const schema = z.object({
  monthKey: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  amount: z.number().finite().positive().max(1_000_000_000).optional(),
  currency: z.enum(financeCurrencies).optional(),
}).refine((value) => Object.keys(value).length > 0)

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_EXPENSE' } }, { status: 400 })
  const { id } = await params
  const existing = await prisma.financeExpense.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'EXPENSE_NOT_FOUND' } }, { status: 404 })
  const item = await prisma.financeExpense.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.amount !== undefined ? { amount: Math.round(parsed.data.amount * 100) / 100 } : {}),
    },
  })
  await recordAuditEvent({ action: 'ADMIN_ACTION', userId: access.userId, details: { domain: 'FINANCE', event: 'EXPENSE_UPDATED', expenseId: id, fields: Object.keys(parsed.data) } }).catch(() => undefined)
  return NextResponse.json({ item })
}