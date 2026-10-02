'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'
import styles from './finance.module.css'

type Identifier = string | number

type SummaryLine = {
  currency: string
  receivedIncome: number
  fixedExpenses: number
  teacherCosts: number
  netProfit: number
  unpricedCompletedSessions: number
}

type IncomeRecord = {
  id: Identifier
  monthKey: string
  amount: number
  currency: string
  receivedAt: string
  method?: string | null
  studentId?: Identifier | null
  subscriptionId?: Identifier | null
  note?: string | null
}

type ExpenseRecord = {
  id: Identifier
  monthKey: string
  category: string
  description: string
  amount: number
  currency: string
  createdAt: string
}

type CompletedSession = {
  id: Identifier
  teacherId: Identifier
  title: string
  startTime: string
}

type Teacher = {
  id: Identifier
  lessonCostPerLesson: number | null
  lessonCostCurrency: string | null
  User?: { name?: string | null } | null
}

type FinanceData = {
  month: string
  summary: SummaryLine[]
  incomeRecords: IncomeRecord[]
  expenses: ExpenseRecord[]
  completedSessions: CompletedSession[]
  teachers: Teacher[]
}

type Student = {
  id: Identifier
  name?: string | null
  email?: string | null
}

type DialogState =
  | { kind: 'income'; item?: IncomeRecord }
  | { kind: 'expense'; item?: ExpenseRecord }
  | { kind: 'teacher'; item: Teacher }
  | null

type IncomeForm = {
  monthKey: string
  amount: string
  currency: string
  receivedAt: string
  method: string
  studentId: string
  subscriptionId: string
  note: string
}

type ExpenseForm = {
  monthKey: string
  category: string
  description: string
  amount: string
  currency: string
}

type TeacherForm = {
  lessonCostPerLesson: string
  lessonCostCurrency: string
}

const currencyPresets = ['EGP', 'SAR', 'USD']

function currentMonth() {
  return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 7)
}

function dateTimeInput(value?: string | null) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function readError(body: unknown, fallback: string) {
  if (body && typeof body === 'object') {
    const record = body as { message?: unknown; error?: unknown }
    if (typeof record.message === 'string' && record.message.trim()) return record.message
    if (typeof record.error === 'string' && record.error.trim()) return record.error
    if (record.error && typeof record.error === 'object') {
      const error = record.error as { message?: unknown }
      if (typeof error.message === 'string' && error.message.trim()) return error.message
    }
  }
  return fallback
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function numericValue(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

function money(value: number | string | null | undefined, currency: string, language: 'ar' | 'en') {
  const amount = numericValue(value)
  const code = (currency || '').toUpperCase()
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${code || '—'} ${new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en', { maximumFractionDigits: 2 }).format(amount)}`
  }
}

function readableDate(value: string | null | undefined, language: 'ar' | 'en') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function monthLabel(month: string, language: 'ar' | 'en') {
  const date = new Date(`${month}-01T12:00:00`)
  if (Number.isNaN(date.getTime())) return month
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function validateCurrency(value: string) {
  return currencyPresets.includes(value.trim().toUpperCase())
}

export default function FinanceClient() {
  const { language } = useTheme()
  const direction = localeDirection(language)
  const translate = useCallback((ar: string, en: string) => localeText(language, ar, en), [language])
  const [month, setMonth] = useState(currentMonth)
  const [finance, setFinance] = useState<FinanceData | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [incomeForm, setIncomeForm] = useState<IncomeForm>({
    monthKey: month,
    amount: '',
    currency: 'EGP',
    receivedAt: dateTimeInput(),
    method: '',
    studentId: '',
    subscriptionId: '',
    note: '',
  })
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    monthKey: month,
    category: '',
    description: '',
    amount: '',
    currency: 'EGP',
  })
  const [teacherForm, setTeacherForm] = useState<TeacherForm>({
    lessonCostPerLesson: '',
    lessonCostCurrency: 'EGP',
  })
  const [students, setStudents] = useState<Student[]>([])
  const [studentState, setStudentState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [studentRetryKey, setStudentRetryKey] = useState(0)
  const [studentError, setStudentError] = useState('')
  const [insight, setInsight] = useState('')
  const [insightError, setInsightError] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoadState('loading')
    setLoadError('')
    try {
      const response = await fetch(`/api/admin/finance?month=${encodeURIComponent(month)}`, {
        cache: 'no-store',
        credentials: 'include',
      })
      const body = await readJson(response)
      if (!response.ok) {
        throw new Error(readError(body, translate('تعذر تحميل البيانات المالية.', 'Unable to load finance data.')))
      }
      const payload = body as FinanceData
      if (!payload || !Array.isArray(payload.summary) || !Array.isArray(payload.incomeRecords) ||
          !Array.isArray(payload.expenses) || !Array.isArray(payload.completedSessions) ||
          !Array.isArray(payload.teachers)) {
        throw new Error(translate('استجابة البيانات المالية غير مكتملة.', 'The finance response is incomplete.'))
      }
      setFinance(payload)
      setLoadState('ready')
    } catch (error) {
      setFinance(null)
      setLoadState('error')
      setLoadError(error instanceof Error ? error.message : translate('تعذر تحميل البيانات المالية.', 'Unable to load finance data.'))
    }
  }, [month, translate])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const currencyOptions = currencyPresets

  useEffect(() => {
    if (dialog?.kind !== 'income') return
    let active = true
    void (async () => {
      try {
        const response = await fetch('/api/admin/people/students?page=1&pageSize=50', {
          cache: 'no-store',
          credentials: 'include',
        })
        const body = await readJson(response)
        if (!response.ok) throw new Error(readError(body, translate('تعذر تحميل قائمة الطلاب.', 'Could not load the student list.')))
        const items = (body as { items?: Student[] } | null)?.items
        if (!Array.isArray(items)) throw new Error(translate('استجابة قائمة الطلاب غير صالحة.', 'The student list response is invalid.'))
        if (!active) return
        setStudents(items)
        setStudentState('ready')
      } catch (error) {
        if (!active) return
        setStudentError(error instanceof Error ? error.message : translate('تعذر تحميل قائمة الطلاب.', 'Could not load the student list.'))
        setStudentState('error')
      }
    })()
    return () => { active = false }
  }, [dialog?.kind, studentRetryKey, translate])

  const openIncome = (item?: IncomeRecord) => {
    setFormError('')
    setStudentState('loading')
    setStudentError('')
    setIncomeForm({
      monthKey: item?.monthKey || month,
      amount: item ? String(item.amount) : '',
      currency: item?.currency?.toUpperCase() || 'EGP',
      receivedAt: dateTimeInput(item?.receivedAt),
      method: item?.method || '',
      studentId: item?.studentId == null ? '' : String(item.studentId),
      subscriptionId: item?.subscriptionId == null ? '' : String(item.subscriptionId),
      note: item?.note || '',
    })
    setDialog({ kind: 'income', item })
  }

  const openExpense = (item?: ExpenseRecord) => {
    setFormError('')
    setExpenseForm({
      monthKey: item?.monthKey || month,
      category: item?.category || '',
      description: item?.description || '',
      amount: item ? String(item.amount) : '',
      currency: item?.currency?.toUpperCase() || 'EGP',
    })
    setDialog({ kind: 'expense', item })
  }

  const openTeacher = (item: Teacher) => {
    setFormError('')
    setTeacherForm({
      lessonCostPerLesson: item.lessonCostPerLesson == null ? '' : String(item.lessonCostPerLesson),
      lessonCostCurrency: item.lessonCostCurrency?.toUpperCase() || 'EGP',
    })
    setDialog({ kind: 'teacher', item })
  }

  const closeDialog = () => {
    if (saving) return
    setDialog(null)
    setFormError('')
  }

  const submitIncome = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (dialog?.kind !== 'income') return
    const amount = Number(incomeForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError(translate('أدخل مبلغًا أكبر من صفر.', 'Enter an amount greater than zero.'))
      return
    }
    if (!validateCurrency(incomeForm.currency)) {
      setFormError(translate('اختر EGP أو SAR أو USD.', 'Use EGP, SAR, or USD.'))
      return
    }
    const receivedAt = new Date(incomeForm.receivedAt)
    if (Number.isNaN(receivedAt.getTime())) {
      setFormError(translate('أدخل تاريخ استلام صالحًا.', 'Enter a valid received date.'))
      return
    }
    const payload: Record<string, unknown> = {
      amount,
      currency: incomeForm.currency.trim().toUpperCase(),
      monthKey: incomeForm.monthKey,
      receivedAt: receivedAt.toISOString(),
      method: incomeForm.method.trim(),
      subscriptionId: incomeForm.subscriptionId.trim() || null,
      note: incomeForm.note.trim(),
      studentId: incomeForm.studentId || null,
    }
    const editing = dialog.item
    if (!incomeForm.studentId && !editing) delete payload.studentId
    if (!incomeForm.subscriptionId.trim() && !editing) delete payload.subscriptionId
    setSaving(true)
    setFormError('')
    try {
      const response = await fetch(editing
        ? `/api/admin/finance/income/${encodeURIComponent(String(editing.id))}`
        : '/api/admin/finance/income', {
        method: editing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await readJson(response)
      if (!response.ok) throw new Error(readError(body, translate('تعذر حفظ سجل الدخل.', 'Could not save the income record.')))
      setDialog(null)
      await load(true)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : translate('تعذر حفظ سجل الدخل.', 'Could not save the income record.'))
    } finally {
      setSaving(false)
    }
  }

  const submitExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (dialog?.kind !== 'expense') return
    const amount = Number(expenseForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError(translate('أدخل مبلغًا أكبر من صفر.', 'Enter an amount greater than zero.'))
      return
    }
    if (!validateCurrency(expenseForm.currency)) {
      setFormError(translate('اختر EGP أو SAR أو USD.', 'Use EGP, SAR, or USD.'))
      return
    }
    const payload = {
      monthKey: expenseForm.monthKey,
      category: expenseForm.category.trim(),
      description: expenseForm.description.trim(),
      amount,
      currency: expenseForm.currency.trim().toUpperCase(),
    }
    if (!payload.category || !payload.description) {
      setFormError(translate('أدخل الفئة والوصف.', 'Enter both a category and description.'))
      return
    }
    const editing = dialog.item
    setSaving(true)
    setFormError('')
    try {
      const response = await fetch(editing
        ? `/api/admin/finance/expenses/${encodeURIComponent(String(editing.id))}`
        : '/api/admin/finance/expenses', {
        method: editing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await readJson(response)
      if (!response.ok) throw new Error(readError(body, translate('تعذر حفظ المصروف.', 'Could not save the expense.')))
      setDialog(null)
      await load(true)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : translate('تعذر حفظ المصروف.', 'Could not save the expense.'))
    } finally {
      setSaving(false)
    }
  }

  const submitTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (dialog?.kind !== 'teacher') return
    if (!teacherForm.lessonCostPerLesson.trim()) {
      setFormError(translate('أدخل تكلفة الدرس. اكتب صفرًا إذا لم تُدفع أتعاب عن الحصة.', 'Enter a lesson cost. Use zero if the lesson has no teacher charge.'))
      return
    }
    const lessonCostPerLesson = Number(teacherForm.lessonCostPerLesson)
    if (!Number.isFinite(lessonCostPerLesson) || lessonCostPerLesson < 0) {
      setFormError(translate('أدخل تكلفة صالحة للدرس.', 'Enter a valid per-lesson cost.'))
      return
    }
    if (!validateCurrency(teacherForm.lessonCostCurrency)) {
      setFormError(translate('اختر EGP أو SAR أو USD.', 'Use EGP, SAR, or USD.'))
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const response = await fetch(`/api/admin/finance/teachers/${encodeURIComponent(String(dialog.item.id))}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonCostPerLesson,
          lessonCostCurrency: teacherForm.lessonCostCurrency.trim().toUpperCase(),
        }),
      })
      const body = await readJson(response)
      if (!response.ok) throw new Error(readError(body, translate('تعذر حفظ تكلفة الدرس.', 'Could not save the lesson cost.')))
      setDialog(null)
      await load(true)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : translate('تعذر حفظ تكلفة الدرس.', 'Could not save the lesson cost.'))
    } finally {
      setSaving(false)
    }
  }

  const generateInsight = async () => {
    setInsightLoading(true)
    setInsightError('')
    setInsight('')
    try {
      const response = await fetch('/api/admin/finance/insight', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, language }),
      })
      const body = await readJson(response)
      if (!response.ok) {
        throw new Error(readError(body, translate(
          'تعذر إنشاء الملاحظة المحاسبية. تحقق من إعداد خدمة الذكاء الاصطناعي ثم حاول مرة أخرى.',
          'The accounting note is unavailable. Check the AI service configuration and try again.',
        )))
      }
      const analysis = (body as { analysis?: unknown } | null)?.analysis
      if (typeof analysis !== 'string' || !analysis.trim()) {
        throw new Error(translate(
          'لم تتوفر ملاحظة لهذه الفترة. تحقق من إعداد خدمة الذكاء الاصطناعي وحاول مرة أخرى.',
          'No accounting note was returned. Check the AI service configuration and try again.',
        ))
      }
      setInsight(analysis)
    } catch (error) {
      setInsightError(error instanceof Error ? error.message : translate(
        'تعذر الوصول إلى خدمة الذكاء الاصطناعي. حاول مرة أخرى لاحقًا.',
        'The AI accounting service is unavailable. Please try again later.',
      ))
    } finally {
      setInsightLoading(false)
    }
  }

  const sessionsByTeacher = useMemo(() => {
    const counts = new Map<string, number>()
    finance?.completedSessions.forEach((session) => {
      const key = String(session.teacherId)
      counts.set(key, (counts.get(key) || 0) + 1)
    })
    return counts
  }, [finance])

  const activeTeacher = dialog?.kind === 'teacher' ? dialog.item : null

  return (
    <main className={styles.page} dir={direction} data-testid="finance-page">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <p className={styles.eyebrow}>{translate('مساحة الحسابات', 'BE FLUENT · ADMIN FINANCE')}</p>
            <h1 className={styles.title}>{translate('المالية', 'Finance')}</h1>
            <p className={styles.subtitle}>
              {translate('الأموال المستلمة، التكاليف الثابتة، وأجر المعلم لكل درس مكتمل، كل عملة على حدة.', 'Cash received, fixed costs, and teacher pay per completed lesson, kept separate by currency.')}
            </p>
          </div>
          <div className={styles.monthControl}>
            <label htmlFor="finance-month">{translate('الشهر', 'Month')}</label>
            <input
              id="finance-month"
              className={styles.monthInput}
              type="month"
              value={month}
              onChange={(event) => {
                setInsight('')
                setInsightError('')
                setMonth(event.target.value || currentMonth())
              }}
              data-testid="input-finance-month"
            />
          </div>
        </header>

        <div className={styles.toolbar}>
          <p className={styles.periodText} data-testid="text-finance-period">
            {monthLabel(month, language)}{finance?.month && finance.month !== month ? ` · ${finance.month}` : ''}
          </p>
          <div className={styles.toolbarActions}>
            <button
              className={styles.button}
              type="button"
              onClick={() => void generateInsight()}
              disabled={loadState !== 'ready' || insightLoading}
              data-testid="button-generate-insight"
            >
              {insightLoading
                ? translate('جارٍ إعداد الملاحظة…', 'Preparing note…')
                : translate('ملاحظة محاسبية', 'Accounting note')}
            </button>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => openIncome()}
              disabled={loadState !== 'ready'}
              data-testid="button-add-income"
            >
              {translate('إضافة دخل', 'Add income')}
            </button>
            <button
              className={styles.button}
              type="button"
              onClick={() => openExpense()}
              disabled={loadState !== 'ready'}
              data-testid="button-add-expense"
            >
              {translate('إضافة مصروف', 'Add expense')}
            </button>
          </div>
        </div>

        {loadState === 'loading' && (
          <section className={styles.section} aria-label={translate('ملخص الشهر', 'Monthly summary')} aria-live="polite">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{translate('ملخص الشهر', 'Monthly summary')}</h2>
            </div>
            <div className={styles.skeletonGrid} data-testid="status-finance-loading">
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
            </div>
            <p className={styles.status}>{translate('جارٍ تحميل السجلات المالية…', 'Loading finance records…')}</p>
          </section>
        )}

        {loadState === 'error' && (
          <div className={styles.error} role="alert" data-testid="status-finance-error">
            {loadError || translate('تعذر تحميل البيانات المالية.', 'Unable to load finance data.')}
            <button
              className={styles.quietButton}
              type="button"
              onClick={() => void load()}
              data-testid="button-retry-finance"
            >
              {translate('إعادة المحاولة', 'Retry')}
            </button>
          </div>
        )}

        {loadState === 'ready' && finance && (
          <>
            <section className={styles.section} aria-labelledby="finance-summary-heading">
              <div className={styles.sectionHeader}>
                <h2 id="finance-summary-heading" className={styles.sectionTitle}>{translate('ملخص الشهر', 'Monthly summary')}</h2>
                <p className={styles.sectionHint}>{translate('كل بطاقة بعملة مستقلة.', 'Each total stays in its own currency.')}</p>
              </div>
              {finance.summary.length === 0 ? (
                <div className={styles.empty} data-testid="empty-finance-summary">
                  <p className={styles.emptyTitle}>{translate('لا توجد بيانات ملخص لهذا الشهر', 'No summary data for this month')}</p>
                  <p>{translate('ستظهر العملات عند توفر دخل أو تكاليف مسجلة.', 'Currencies appear here once income or costs are recorded.')}</p>
                </div>
              ) : (
                <div className={styles.currencyGrid}>
                  {finance.summary.map((line) => (
                    <article className={styles.currencyCard} key={line.currency} data-testid={`card-finance-currency-${line.currency.toLowerCase()}`}>
                      <div className={styles.currencyTop}>
                        <span className={styles.currencyCode} data-testid={`text-currency-${line.currency.toLowerCase()}`}>{line.currency}</span>
                        <span className={`${styles.netLabel} ${Number(line.netProfit) < 0 ? styles.netNegative : styles.netPositive}`}>
                          {translate('صافي الربح', 'Net profit')}
                        </span>
                      </div>
                      <p
                        className={`${styles.netValue} ${Number(line.netProfit) < 0 ? styles.netNegative : styles.netPositive}`}
                        data-testid={`value-net-profit-${line.currency.toLowerCase()}`}
                      >
                        {money(line.netProfit, line.currency, language)}
                      </p>
                      <div className={styles.metrics}>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>{translate('دخل مستلم', 'Received')}</span>
                          <strong className={styles.metricValue} data-testid={`value-income-${line.currency.toLowerCase()}`}>
                            {money(line.receivedIncome, line.currency, language)}
                          </strong>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>{translate('تكاليف ثابتة', 'Fixed costs')}</span>
                          <strong className={styles.metricValue} data-testid={`value-fixed-costs-${line.currency.toLowerCase()}`}>
                            {money(line.fixedExpenses, line.currency, language)}
                          </strong>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>{translate('أجور المعلمين', 'Teacher pay')}</span>
                          <strong className={styles.metricValue} data-testid={`value-teacher-costs-${line.currency.toLowerCase()}`}>
                            {money(line.teacherCosts, line.currency, language)}
                          </strong>
                        </div>
                      </div>
                      <div className={styles.unpriced} data-testid={`text-unpriced-sessions-${line.currency.toLowerCase()}`}>
                        <span>{translate('دروس مكتملة بلا تكلفة محددة', 'Completed lessons without a rate')}</span>
                        <strong>{new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en').format(Number(line.unpricedCompletedSessions) || 0)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section} aria-labelledby="finance-income-heading">
              <div className={styles.sectionHeader}>
                <h2 id="finance-income-heading" className={styles.sectionTitle}>{translate('الدخل المستلم', 'Received income')}</h2>
                <p className={styles.sectionHint}>{translate(`${finance.incomeRecords.length} سجل`, `${finance.incomeRecords.length} records`)}</p>
              </div>
              {finance.incomeRecords.length === 0 ? (
                <div className={styles.empty} data-testid="empty-finance-income">
                  <p className={styles.emptyTitle}>{translate('لا توجد دفعات مسجلة', 'No received payments recorded')}</p>
                  <p>{translate('أضف المبالغ التي وصلت فعليًا لهذا الشهر.', 'Add the payments that actually arrived this month.')}</p>
                </div>
              ) : (
                <div className={styles.panel}>
                  <div className={styles.tableWrap}>
                    <table className={styles.table} data-testid="table-finance-income">
                      <thead><tr>
                        <th>{translate('تاريخ الاستلام', 'Received')}</th>
                        <th>{translate('الطالب / المرجع', 'Student / reference')}</th>
                        <th>{translate('طريقة الدفع', 'Method')}</th>
                        <th>{translate('المبلغ', 'Amount')}</th>
                        <th>{translate('إجراء', 'Action')}</th>
                      </tr></thead>
                      <tbody>
                        {finance.incomeRecords.map((item) => (
                          <tr key={item.id} data-testid={`row-income-${item.id}`}>
                            <td data-label={translate('تاريخ الاستلام', 'Received')}>
                              <span data-testid={`text-income-date-${item.id}`}>{readableDate(item.receivedAt, language)}</span>
                            </td>
                            <td data-label={translate('الطالب / المرجع', 'Student / reference')}>
                              <span className={styles.rowPrimary} data-testid={`text-income-reference-${item.id}`}>
                                {item.studentId != null
                                  ? translate(`طالب ${item.studentId}`, `Student ${item.studentId}`)
                                  : item.subscriptionId
                                    ? translate(`اشتراك ${item.subscriptionId}`, `Subscription ${item.subscriptionId}`)
                                    : item.note || '—'}
                              </span>
                              {item.note && (item.studentId != null || item.subscriptionId) && <span className={styles.rowSecondary}>{item.note}</span>}
                            </td>
                            <td data-label={translate('طريقة الدفع', 'Method')}>{item.method || '—'}</td>
                            <td data-label={translate('المبلغ', 'Amount')}>
                              <span className={styles.amount} data-testid={`value-income-record-${item.id}`}>
                                {money(item.amount, item.currency, language)}
                              </span>
                            </td>
                            <td data-label={translate('إجراء', 'Action')}>
                              <button
                                className={`${styles.quietButton} ${styles.editButton}`}
                                type="button"
                                onClick={() => openIncome(item)}
                                data-testid={`button-edit-income-${item.id}`}
                              >{translate('تعديل', 'Edit')}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <section className={styles.section} aria-labelledby="finance-expenses-heading">
              <div className={styles.sectionHeader}>
                <h2 id="finance-expenses-heading" className={styles.sectionTitle}>{translate('التكاليف الثابتة', 'Fixed expenses')}</h2>
                <p className={styles.sectionHint}>{translate(`${finance.expenses.length} سجل`, `${finance.expenses.length} records`)}</p>
              </div>
              {finance.expenses.length === 0 ? (
                <div className={styles.empty} data-testid="empty-finance-expenses">
                  <p className={styles.emptyTitle}>{translate('لا توجد مصروفات لهذا الشهر', 'No expenses recorded this month')}</p>
                  <p>{translate('أضف التكاليف الثابتة لتظهر ضمن صافي الربح بعملتها.', 'Add fixed costs to include them in net profit in their original currency.')}</p>
                </div>
              ) : (
                <div className={styles.panel}>
                  <div className={styles.tableWrap}>
                    <table className={styles.table} data-testid="table-finance-expenses">
                      <thead><tr>
                        <th>{translate('الفئة والتفاصيل', 'Category and details')}</th>
                        <th>{translate('تاريخ التسجيل', 'Recorded')}</th>
                        <th>{translate('المبلغ', 'Amount')}</th>
                        <th>{translate('إجراء', 'Action')}</th>
                      </tr></thead>
                      <tbody>
                        {finance.expenses.map((item) => (
                          <tr key={item.id} data-testid={`row-expense-${item.id}`}>
                            <td data-label={translate('الفئة والتفاصيل', 'Category and details')}>
                              <span className={styles.rowPrimary} data-testid={`text-expense-category-${item.id}`}>{item.category}</span>
                              <span className={styles.rowSecondary}>{item.description}</span>
                            </td>
                            <td data-label={translate('تاريخ التسجيل', 'Recorded')}>{readableDate(item.createdAt, language)}</td>
                            <td data-label={translate('المبلغ', 'Amount')}>
                              <span className={styles.amount} data-testid={`value-expense-record-${item.id}`}>{money(item.amount, item.currency, language)}</span>
                            </td>
                            <td data-label={translate('إجراء', 'Action')}>
                              <button
                                className={`${styles.quietButton} ${styles.editButton}`}
                                type="button"
                                onClick={() => openExpense(item)}
                                data-testid={`button-edit-expense-${item.id}`}
                              >{translate('تعديل', 'Edit')}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <section className={styles.section} aria-labelledby="finance-teachers-heading">
              <div className={styles.sectionHeader}>
                <h2 id="finance-teachers-heading" className={styles.sectionTitle}>{translate('أجر الدرس المكتمل', 'Teacher pay per completed lesson')}</h2>
                <p className={styles.sectionHint}>{translate('يُحسب العرض من الدروس المكتملة في الشهر المحدد.', 'Monthly amounts use completed lessons for this month.')}</p>
              </div>
              {finance.teachers.length === 0 ? (
                <div className={styles.empty} data-testid="empty-finance-teachers">
                  <p className={styles.emptyTitle}>{translate('لا توجد بيانات معلمين لهذا الشهر', 'No teacher pay data for this month')}</p>
                  <p>{translate('ستظهر تكلفة الدرس عند توفر بيانات المعلمين والجلسات المكتملة.', 'Teacher rates appear when teacher and completed-session data is available.')}</p>
                </div>
              ) : (
                <div className={styles.panel}>
                  <div className={styles.tableWrap}>
                    <table className={styles.table} data-testid="table-finance-teachers">
                      <thead><tr>
                        <th>{translate('المعلم', 'Teacher')}</th>
                        <th>{translate('دروس مكتملة', 'Completed lessons')}</th>
                        <th>{translate('تكلفة الدرس', 'Rate per lesson')}</th>
                        <th>{translate('إجمالي الشهر', 'Month total')}</th>
                        <th>{translate('إجراء', 'Action')}</th>
                      </tr></thead>
                      <tbody>
                        {finance.teachers.map((teacher) => {
                          const count = sessionsByTeacher.get(String(teacher.id)) || 0
                          const hasRate = teacher.lessonCostPerLesson != null && Boolean(teacher.lessonCostCurrency)
                          const currency = teacher.lessonCostCurrency?.toUpperCase() || ''
                          return (
                            <tr key={teacher.id} data-testid={`row-teacher-pay-${teacher.id}`}>
                              <td data-label={translate('المعلم', 'Teacher')}>
                                <span className={styles.rowPrimary} data-testid={`text-teacher-name-${teacher.id}`}>
                                  {teacher.User?.name || translate('معلم بدون اسم', 'Unnamed teacher')}
                                </span>
                              </td>
                              <td data-label={translate('دروس مكتملة', 'Completed lessons')} data-testid={`value-teacher-lessons-${teacher.id}`}>
                                {new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en').format(count)}
                              </td>
                              <td data-label={translate('تكلفة الدرس', 'Rate per lesson')}>
                                {hasRate
                                  ? <span className={styles.amount} data-testid={`value-teacher-rate-${teacher.id}`}>{money(teacher.lessonCostPerLesson, currency, language)}</span>
                                  : <span className={styles.currencyTag} data-testid={`status-teacher-unpriced-${teacher.id}`}>{translate('غير محدد', 'Not set')}</span>}
                              </td>
                              <td data-label={translate('إجمالي الشهر', 'Month total')}>
                                {hasRate
                                  ? <span className={styles.amount} data-testid={`value-teacher-month-total-${teacher.id}`}>{money(numericValue(teacher.lessonCostPerLesson) * count, currency, language)}</span>
                                  : <span className={styles.currencyTag}>{translate('غير محسوب', 'Not priced')}</span>}
                              </td>
                              <td data-label={translate('إجراء', 'Action')}>
                                <button
                                  className={`${styles.quietButton} ${styles.editButton}`}
                                  type="button"
                                  onClick={() => openTeacher(teacher)}
                                  data-testid={`button-edit-teacher-rate-${teacher.id}`}
                                >{translate('تعديل الأجر', 'Edit rate')}</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {(insight || insightError || insightLoading) && (
              <section className={styles.section} aria-labelledby="finance-insight-heading">
                <div className={styles.sectionHeader}>
                  <h2 id="finance-insight-heading" className={styles.sectionTitle}>{translate('ملاحظة محاسبية', 'Accounting note')}</h2>
                  <p className={styles.sectionHint}>{monthLabel(month, language)}</p>
                </div>
                {insightLoading && <div className={styles.status} role="status" data-testid="status-insight-loading">{translate('جارٍ إعداد ملاحظة لهذه الفترة…', 'Preparing a note for this period…')}</div>}
                {insightError && <div className={styles.error} role="alert" data-testid="status-insight-error">{insightError}</div>}
                {insight && (
                  <div className={styles.insightBox} data-testid="text-finance-insight">
                    <p className={styles.insightMeta}>{translate('ملاحظة للفترة المحددة', 'Note for selected month')}</p>
                    {insight}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      <datalist id="finance-currency-options">
        {currencyOptions.map((code) => <option value={code} key={code} />)}
      </datalist>

      {dialog && (
        <div
          className={styles.dialogBackdrop}
          role="presentation"
          onClick={(event) => { if (event.target === event.currentTarget) closeDialog() }}
          data-testid="dialog-finance-backdrop"
        >
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="finance-dialog-title"
            onClick={(event) => event.stopPropagation()}
            data-testid="dialog-finance-form"
          >
            <div className={styles.dialogHeader}>
              <div>
                <h2 className={styles.dialogTitle} id="finance-dialog-title">
                  {dialog.kind === 'income'
                    ? dialog.item ? translate('تعديل سجل الدخل', 'Edit income record') : translate('إضافة دخل مستلم', 'Add received income')
                    : dialog.kind === 'expense'
                      ? dialog.item ? translate('تعديل المصروف', 'Edit expense') : translate('إضافة مصروف ثابت', 'Add fixed expense')
                      : translate('تكلفة المعلم لكل درس', 'Teacher rate per lesson')}
                </h2>
                <p className={styles.dialogDescription}>
                  {dialog.kind === 'teacher'
                    ? activeTeacher?.User?.name || translate('تحديث قيمة الأجر وعملته.', 'Update the rate and its currency.')
                    : translate('تُحفظ المبالغ بعملتها الأصلية دون تحويل.', 'Amounts are saved in their original currency, without conversion.')}
                </p>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={closeDialog}
                disabled={saving}
                aria-label={translate('إغلاق', 'Close')}
                data-testid="button-close-finance-dialog"
              >×</button>
            </div>

            {dialog.kind === 'income' && (
              <form onSubmit={submitIncome} noValidate>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label htmlFor="income-month">{translate('شهر التسجيل', 'Month')}</label>
                    <input id="income-month" className={styles.input} type="month" required value={incomeForm.monthKey} onChange={(event) => setIncomeForm({ ...incomeForm, monthKey: event.target.value })} data-testid="input-income-month" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="income-received">{translate('تاريخ الاستلام', 'Received at')}</label>
                    <input id="income-received" className={styles.input} type="datetime-local" required value={incomeForm.receivedAt} onChange={(event) => setIncomeForm({ ...incomeForm, receivedAt: event.target.value })} data-testid="input-income-received-at" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="income-amount">{translate('المبلغ المستلم', 'Amount received')}</label>
                    <input id="income-amount" className={styles.input} type="number" min="0.01" step="0.01" inputMode="decimal" required value={incomeForm.amount} onChange={(event) => setIncomeForm({ ...incomeForm, amount: event.target.value })} data-testid="input-income-amount" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="income-currency">{translate('العملة', 'Currency')}</label>
                    <input id="income-currency" className={styles.input} list="finance-currency-options" maxLength={3} required value={incomeForm.currency} onChange={(event) => setIncomeForm({ ...incomeForm, currency: event.target.value.toUpperCase() })} data-testid="input-income-currency" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="income-method">{translate('طريقة الدفع', 'Payment method')}</label>
                    <input id="income-method" className={styles.input} value={incomeForm.method} onChange={(event) => setIncomeForm({ ...incomeForm, method: event.target.value })} data-testid="input-income-method" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="income-student">{translate('ربط بطالب', 'Associate student')}</label>
                    <select id="income-student" className={styles.select} value={incomeForm.studentId} onChange={(event) => setIncomeForm({ ...incomeForm, studentId: event.target.value })} data-testid="select-income-student">
                      <option value="">{translate('بدون ربط', 'No student')}</option>
                      {incomeForm.studentId && !students.some((student) => String(student.id) === incomeForm.studentId) &&
                        <option value={incomeForm.studentId}>{translate(`طالب ${incomeForm.studentId}`, `Student ${incomeForm.studentId}`)}</option>}
                      {students.map((student) => (
                        <option key={student.id} value={String(student.id)}>{student.name || student.email || `#${student.id}`}</option>
                      ))}
                    </select>
                    {studentState === 'loading' && <span className={styles.selectHint} role="status">{translate('جارٍ تحميل الطلاب…', 'Loading students…')}</span>}
                    {studentState === 'error' && <span className={styles.selectHint} role="status">
                      {studentError}{' '}
                      <button className={styles.quietButton} type="button" onClick={() => {
                        setStudentError('')
                        setStudentState('loading')
                        setStudentRetryKey((key) => key + 1)
                      }} data-testid="button-retry-students">{translate('إعادة المحاولة', 'Retry')}</button>
                    </span>}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="income-subscription">{translate('رقم الاشتراك', 'Subscription ID')}</label>
                    <input id="income-subscription" className={styles.input} value={incomeForm.subscriptionId} onChange={(event) => setIncomeForm({ ...incomeForm, subscriptionId: event.target.value })} data-testid="input-income-subscription" />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label htmlFor="income-note">{translate('ملاحظة', 'Note')}</label>
                    <textarea id="income-note" className={styles.textarea} value={incomeForm.note} onChange={(event) => setIncomeForm({ ...incomeForm, note: event.target.value })} data-testid="input-income-note" />
                  </div>
                  {formError && <p className={styles.formError} role="alert" data-testid="status-income-form-error">{formError}</p>}
                </div>
                <div className={styles.dialogActions}>
                  <button className={styles.quietButton} type="button" onClick={closeDialog} disabled={saving} data-testid="button-cancel-income">{translate('إلغاء', 'Cancel')}</button>
                  <button className={styles.primaryButton} type="submit" disabled={saving} data-testid="button-save-income">
                    {saving ? translate('جارٍ الحفظ…', 'Saving…') : dialog.item ? translate('حفظ التعديلات', 'Save changes') : translate('حفظ الدخل', 'Save income')}
                  </button>
                </div>
              </form>
            )}

            {dialog.kind === 'expense' && (
              <form onSubmit={submitExpense} noValidate>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label htmlFor="expense-month">{translate('الشهر', 'Month')}</label>
                    <input id="expense-month" className={styles.input} type="month" required value={expenseForm.monthKey} onChange={(event) => setExpenseForm({ ...expenseForm, monthKey: event.target.value })} data-testid="input-expense-month" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="expense-category">{translate('الفئة', 'Category')}</label>
                    <input id="expense-category" className={styles.input} required value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })} data-testid="input-expense-category" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="expense-amount">{translate('المبلغ', 'Amount')}</label>
                    <input id="expense-amount" className={styles.input} type="number" min="0.01" step="0.01" inputMode="decimal" required value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} data-testid="input-expense-amount" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="expense-currency">{translate('العملة', 'Currency')}</label>
                    <input id="expense-currency" className={styles.input} list="finance-currency-options" maxLength={3} required value={expenseForm.currency} onChange={(event) => setExpenseForm({ ...expenseForm, currency: event.target.value.toUpperCase() })} data-testid="input-expense-currency" />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label htmlFor="expense-description">{translate('الوصف', 'Description')}</label>
                    <textarea id="expense-description" className={styles.textarea} required value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} data-testid="input-expense-description" />
                  </div>
                  {formError && <p className={styles.formError} role="alert" data-testid="status-expense-form-error">{formError}</p>}
                </div>
                <div className={styles.dialogActions}>
                  <button className={styles.quietButton} type="button" onClick={closeDialog} disabled={saving} data-testid="button-cancel-expense">{translate('إلغاء', 'Cancel')}</button>
                  <button className={styles.primaryButton} type="submit" disabled={saving} data-testid="button-save-expense">
                    {saving ? translate('جارٍ الحفظ…', 'Saving…') : dialog.item ? translate('حفظ التعديلات', 'Save changes') : translate('حفظ المصروف', 'Save expense')}
                  </button>
                </div>
              </form>
            )}

            {dialog.kind === 'teacher' && (
              <form onSubmit={submitTeacher} noValidate>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label htmlFor="teacher-rate">{translate('تكلفة الدرس الواحد', 'Cost per lesson')}</label>
                    <input id="teacher-rate" className={styles.input} type="number" min="0" step="0.01" inputMode="decimal" required value={teacherForm.lessonCostPerLesson} onChange={(event) => setTeacherForm({ ...teacherForm, lessonCostPerLesson: event.target.value })} data-testid="input-teacher-lesson-cost" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="teacher-currency">{translate('العملة', 'Currency')}</label>
                    <input id="teacher-currency" className={styles.input} list="finance-currency-options" maxLength={3} required value={teacherForm.lessonCostCurrency} onChange={(event) => setTeacherForm({ ...teacherForm, lessonCostCurrency: event.target.value.toUpperCase() })} data-testid="input-teacher-currency" />
                  </div>
                  {formError && <p className={styles.formError} role="alert" data-testid="status-teacher-form-error">{formError}</p>}
                </div>
                <div className={styles.dialogActions}>
                  <button className={styles.quietButton} type="button" onClick={closeDialog} disabled={saving} data-testid="button-cancel-teacher">{translate('إلغاء', 'Cancel')}</button>
                  <button className={styles.primaryButton} type="submit" disabled={saving} data-testid="button-save-teacher">
                    {saving ? translate('جارٍ الحفظ…', 'Saving…') : translate('حفظ تكلفة الدرس', 'Save rate')}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  )
}