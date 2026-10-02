export const financeCurrencies = ['EGP', 'SAR', 'USD'] as const
export type FinanceCurrency = (typeof financeCurrencies)[number]

export type FinanceIncomeInput = { amount: number; currency: string }
export type FinanceExpenseInput = { amount: number; currency: string }
export type FinanceSessionInput = { teacherId: string }
export type FinanceTeacherInput = {
  id: string
  lessonCostPerLesson: number | null
  lessonCostCurrency: string | null
}

export type FinanceCurrencySummary = {
  currency: string
  receivedIncome: number
  fixedExpenses: number
  teacherCosts: number
  netProfit: number
  unpricedCompletedSessions: number
}

export function financeMonthRange(monthKey: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) {
    throw new Error('Month must use YYYY-MM format')
  }

  const [year, month] = monthKey.split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, 1, -3))
  const end = new Date(Date.UTC(year, month, 1, -3))
  return { start, end }
}

export function calculateFinanceSummary(input: {
  incomes: FinanceIncomeInput[]
  expenses: FinanceExpenseInput[]
  sessions: FinanceSessionInput[]
  teachers: FinanceTeacherInput[]
}): FinanceCurrencySummary[] {
  const totals = new Map<string, FinanceCurrencySummary>()
  const get = (currency: string) => {
    const existing = totals.get(currency)
    if (existing) return existing
    const created: FinanceCurrencySummary = {
      currency,
      receivedIncome: 0,
      fixedExpenses: 0,
      teacherCosts: 0,
      netProfit: 0,
      unpricedCompletedSessions: 0,
    }
    totals.set(currency, created)
    return created
  }

  for (const income of input.incomes) get(income.currency).receivedIncome += income.amount
  for (const expense of input.expenses) get(expense.currency).fixedExpenses += expense.amount

  const teachers = new Map(input.teachers.map((teacher) => [teacher.id, teacher]))
  for (const session of input.sessions) {
    const teacher = teachers.get(session.teacherId)
    if (!teacher || teacher.lessonCostPerLesson == null) {
      get(teacher?.lessonCostCurrency || 'EGP').unpricedCompletedSessions += 1
      continue
    }
    get(teacher.lessonCostCurrency || 'EGP').teacherCosts += teacher.lessonCostPerLesson
  }

  return [...totals.values()]
    .map((summary) => ({
      ...summary,
      netProfit: summary.receivedIncome - summary.fixedExpenses - summary.teacherCosts,
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency))
}