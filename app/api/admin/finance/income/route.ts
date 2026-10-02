import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { financeCurrencies, financeMonthRange } from '@/lib/finance-core'

const schema = z.object({
  amount: z.number().finite().positive().max(1_000_000_000),
  currency: z.enum(financeCurrencies).default('EGP'),
  monthKey: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  receivedAt: z.coerce.date(),
  method: z.string().trim().max(80).nullable().optional(),
  studentId: z.string().trim().min(1).nullable().optional(),
  subscriptionId: z.string().trim().min(1).nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
})

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_INCOME' } }, { status: 400 })
  const body = parsed.data
  try {
    const range = financeMonthRange(body.monthKey)
    if (body.receivedAt < range.start || body.receivedAt >= range.end) {
      return NextResponse.json({ ok: false, error: { code: 'DATE_MONTH_MISMATCH', message: 'Received date must belong to the selected month.' } }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_MONTH' } }, { status: 400 })
  }
  if (body.studentId) {
    const student = await prisma.user.findFirst({ where: { id: body.studentId, role: 'STUDENT' }, select: { id: true } })
    if (!student) return NextResponse.json({ ok: false, error: { code: 'STUDENT_NOT_FOUND' } }, { status: 404 })
  }
  let subscriptionStudentId: string | undefined
  if (body.subscriptionId) {
    const subscription = await prisma.subscription.findUnique({ where: { id: body.subscriptionId }, select: { studentId: true } })
    if (!subscription) return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_NOT_FOUND' } }, { status: 404 })
    subscriptionStudentId = subscription.studentId
    if (body.studentId && body.studentId !== subscription.studentId) {
      return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_STUDENT_MISMATCH' } }, { status: 409 })
    }
  }
  const item = await prisma.financeIncome.create({
    data: {
      ...body,
      amount: Math.round(body.amount * 100) / 100,
      studentId: body.studentId || subscriptionStudentId,
      createdById: access.userId,
    },
  })
  await recordAuditEvent({ action: 'ADMIN_ACTION', userId: access.userId, details: { domain: 'FINANCE', event: 'INCOME_CREATED', incomeId: item.id, monthKey: item.monthKey, currency: item.currency, amount: item.amount } }).catch(() => undefined)
  return NextResponse.json({ item }, { status: 201 })
}