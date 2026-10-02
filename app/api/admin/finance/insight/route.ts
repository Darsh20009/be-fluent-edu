import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { financeMonthRange } from '@/lib/finance-core'
import { loadFinanceMonth } from '@/lib/finance-service'

const schema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  language: z.enum(['ar', 'en']).default('ar'),
})

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_MONTH' } }, { status: 400 })
  try {
    financeMonthRange(parsed.data.month)
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_MONTH' } }, { status: 400 })
  }
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: { code: 'AI_NOT_CONFIGURED', message: 'AI financial analysis is not configured.' } }, { status: 503 })
  }

  const report = await loadFinanceMonth(parsed.data.month)
  const aggregate = {
    month: report.month,
    currencies: report.summary,
    incomeRecordCount: report.incomeRecords.length,
    fixedExpenseCount: report.expenses.length,
    completedLessons: report.completedSessions.length,
    teacherRateCoverage: report.summary.map(({ currency, unpricedCompletedSessions }) => ({ currency, unpricedCompletedSessions })),
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 350,
        messages: [
          {
            role: 'system',
            content: parsed.data.language === 'ar'
              ? 'أنت مساعد محاسبي داخلي. حلل الأرقام المجمعة فقط، ولا تعِد حسابها أو تخترع بيانات. اذكر نقاط الانتباه العملية باختصار، وافصل كل عملة عن الأخرى. وضح أن صافي الربح قبل الضرائب إن لم تتوفر بياناتها. أجب بالعربية.'
              : 'You are an internal accounting assistant. Analyze only the provided aggregate figures; do not recalculate them or invent data. Briefly note practical items that need attention, keep currencies separate, and state that net profit is before tax if tax data is absent. Answer in English.',
          },
          { role: 'user', content: JSON.stringify(aggregate) },
        ],
      }),
    })
    if (!response.ok) {
      console.error('Finance AI request failed with status', response.status)
      return NextResponse.json({ ok: false, error: { code: 'AI_REQUEST_FAILED', message: 'AI analysis is temporarily unavailable.' } }, { status: 502 })
    }
    const payload = await response.json()
    const text = payload?.choices?.[0]?.message?.content
    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ ok: false, error: { code: 'AI_EMPTY_RESPONSE' } }, { status: 502 })
    }
    return NextResponse.json({ month: report.month, analysis: text.trim() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Finance AI analysis failed', error instanceof Error ? error.name : 'Unknown error')
    return NextResponse.json({ ok: false, error: { code: 'AI_REQUEST_FAILED', message: 'AI analysis is temporarily unavailable.' } }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}