import { NextRequest, NextResponse } from 'next/server'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { financeMonthRange } from '@/lib/finance-core'
import { loadFinanceMonth } from '@/lib/finance-service'

export async function GET(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access

  const month = request.nextUrl.searchParams.get('month')
    || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 7)
  try {
    financeMonthRange(month)
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_MONTH', message: 'Use YYYY-MM for month.' } }, { status: 400 })
  }
  const report = await loadFinanceMonth(month)
  return NextResponse.json(report, { headers: { 'Cache-Control': 'no-store' } })
}