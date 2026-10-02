import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateFinanceSummary, financeMonthRange } from '../lib/finance-core'

test('finance month range follows the app business timezone (Asia/Riyadh)', () => {
  const { start, end } = financeMonthRange('2026-10')
  assert.equal(start.toISOString(), '2026-09-30T21:00:00.000Z')
  assert.equal(end.toISOString(), '2026-10-31T21:00:00.000Z')
  assert.throws(() => financeMonthRange('2026-13'), /YYYY-MM/)
})

test('net profit uses received income, monthly expenses and completed lessons by currency', () => {
  const summaries = calculateFinanceSummary({
    incomes: [{ amount: 6000, currency: 'EGP' }, { amount: 100, currency: 'SAR' }],
    expenses: [{ amount: 1500, currency: 'EGP' }],
    sessions: [{ teacherId: 't1' }, { teacherId: 't1' }, { teacherId: 't2' }],
    teachers: [
      { id: 't1', lessonCostPerLesson: 250, lessonCostCurrency: 'EGP' },
      { id: 't2', lessonCostPerLesson: null, lessonCostCurrency: 'EGP' },
    ],
  })

  assert.deepEqual(summaries, [
    { currency: 'EGP', receivedIncome: 6000, fixedExpenses: 1500, teacherCosts: 500, netProfit: 4000, unpricedCompletedSessions: 1 },
    { currency: 'SAR', receivedIncome: 100, fixedExpenses: 0, teacherCosts: 0, netProfit: 100, unpricedCompletedSessions: 0 },
  ])
})