import { prisma } from '@/lib/prisma'
import { calculateFinanceSummary, financeMonthRange } from '@/lib/finance-core'

export async function loadFinanceMonth(month: string) {
  const range = financeMonthRange(month)
  const [incomeRecords, expenses, completedSessions, teachers] = await Promise.all([
    prisma.financeIncome.findMany({ where: { monthKey: month }, orderBy: { receivedAt: 'desc' } }),
    prisma.financeExpense.findMany({ where: { monthKey: month }, orderBy: { createdAt: 'desc' } }),
    prisma.session.findMany({
      where: { status: 'COMPLETED', startTime: { gte: range.start, lt: range.end } },
      select: { id: true, teacherId: true, title: true, startTime: true },
    }),
    prisma.teacherProfile.findMany({
      select: {
        id: true,
        lessonCostPerLesson: true,
        lessonCostCurrency: true,
        User: { select: { name: true } },
      },
      orderBy: { User: { name: 'asc' } },
    }),
  ])
  const summary = calculateFinanceSummary({
    incomes: incomeRecords,
    expenses,
    sessions: completedSessions,
    teachers,
  })
  return { month, summary, incomeRecords, expenses, completedSessions, teachers }
}