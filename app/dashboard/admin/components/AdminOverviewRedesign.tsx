'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Server,
  Clock3,
  UserCheck,
  Users,
} from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

type RecentSubscription = {
  id?: string | number
  status?: string
  createdAt?: string
  User?: { name?: string | null } | null
  Package?: { title?: string | null; price?: number | null } | null
}
type RecentUser = { id?: string | number; name?: string | null; role?: string | null; createdAt?: string | null }
export type AdminOverviewStats = {
  totalUsers?: number
  totalStudents?: number
  activeStudents?: number
  totalTeachers?: number
  totalSessions?: number
  sessionsThisWeek?: number
  pendingSubscriptions?: number
  totalRevenue?: number
  recentSubscriptions?: RecentSubscription[]
  recentUsers?: RecentUser[]
  monthlyRevenue?: { month: string; revenue: number }[]
}
type HealthStatus = { database?: string; application?: string; checkedAt?: string }
type FeedbackItem = { id?: string; status?: string; summary?: string | null; updatedAt?: string }
type HomeworkItem = {
  id?: string
  title?: string
  status?: string
  submissions?: Array<{ id?: string; status?: string; reviews?: unknown[] }>
}
type DataState = 'loading' | 'ready' | 'error'
type Feed<T> = { state: DataState; data?: T }

async function loadJson<T>(url: string): Promise<Feed<T>> {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return { state: 'error' }
    return { state: 'ready', data: await response.json() as T }
  } catch {
    return { state: 'error' }
  }
}

async function loadHealth(): Promise<Feed<HealthStatus>> {
  try {
    const response = await fetch('/api/health', { cache: 'no-store' })
    const body = await response.json().catch(() => null)
    if (response.ok || (response.status === 503 && body && typeof body === 'object' && 'database' in body)) {
      return { state: 'ready', data: body as HealthStatus }
    }
    return { state: 'error' }
  } catch {
    return { state: 'error' }
  }
}

function itemsFrom<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === 'object' && Array.isArray((body as { items?: unknown }).items)) {
    return (body as { items: T[] }).items
  }
  return []
}

function formatDate(value: string | null | undefined, language: 'ar' | 'en') {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.valueOf())
    ? '—'
    : date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' })
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Users
}) {
  return (
    <article
      className="flex min-h-[112px] items-center gap-4 rounded-xl border p-4 sm:p-5"
      style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>{label}</p>
        <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums">{value}</p>
      </div>
    </article>
  )
}

export default function AdminOverviewRedesign({
  stats,
  statsState,
  onRetryStats,
  onNavigate,
}: {
  stats: AdminOverviewStats | null
  statsState: DataState
  onRetryStats: () => void
  onNavigate: (tab: string) => void
}) {
  const { language } = useTheme()
  const t = useCallback((ar: string, en: string) => localeText(language, ar, en), [language])
  const locale = language === 'ar' ? 'ar-SA' : 'en-US'
  const formatNumber = (value: number) => value.toLocaleString(locale)
  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
  const [feedback, setFeedback] = useState<Feed<FeedbackItem[]>>({ state: 'loading' })
  const [homework, setHomework] = useState<Feed<HomeworkItem[]>>({ state: 'loading' })
  const [health, setHealth] = useState<Feed<HealthStatus>>({ state: 'loading' })
  const [retryKey, setRetryKey] = useState(0)

  const retry = useCallback(() => {
    setFeedback({ state: 'loading' })
    setHomework({ state: 'loading' })
    setHealth({ state: 'loading' })
    setRetryKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [feedbackFeed, homeworkFeed, healthFeed] = await Promise.all([
        loadJson<unknown>('/api/admin/feedback'),
        loadJson<unknown>('/api/admin/homework'),
        loadHealth(),
      ])
      if (cancelled) return
      setFeedback(feedbackFeed.state === 'ready' ? { state: 'ready', data: itemsFrom<FeedbackItem>(feedbackFeed.data) } : { state: 'error' })
      setHomework(homeworkFeed.state === 'ready' ? { state: 'ready', data: itemsFrom<HomeworkItem>(homeworkFeed.data) } : { state: 'error' })
      setHealth(healthFeed)
    }

    void load()
    return () => { cancelled = true }
  }, [retryKey])

  const recentSubscriptions = Array.isArray(stats?.recentSubscriptions) ? stats.recentSubscriptions : []
  const recentUsers = Array.isArray(stats?.recentUsers) ? stats.recentUsers : []
  const unpubFeedback = (feedback.data || []).filter((item) => item.status !== 'PUBLISHED')
  const reviewCount = (homework.data || []).reduce((count, item) => {
    const pending = (item.submissions || []).filter((submission) =>
      String(submission.status || '').toUpperCase() === 'SUBMITTED' && !submission.reviews?.length,
    ).length
    return count + pending
  }, 0)
  const queue = useMemo(() => [
    ...(statsState === 'ready' && (stats?.pendingSubscriptions || 0) > 0 ? [{
      key: 'pending-subscriptions',
      title: t(`${stats?.pendingSubscriptions} طلب اشتراك بانتظار المراجعة`, `${stats?.pendingSubscriptions} subscription requests pending review`),
      label: t('مراجعة دفعات الاشتراك', 'Subscription payment review'),
      tab: 'subscriptions',
      icon: CreditCard,
    }] : []),
    ...(feedback.state === 'ready' ? unpubFeedback.slice(0, 5).map((item) => ({
      key: `feedback-${item.id}`,
      title: item.summary?.trim() || t('ملاحظة تعليمية غير منشورة', 'Unpublished learning note'),
      label: item.status === 'READY_TO_PUBLISH' ? t('جاهزة للنشر', 'Ready to publish') : t('مسودة', 'Draft'),
      href: '/dashboard/admin/feedback',
      icon: BookOpenCheck,
    })) : []),
    ...(homework.state === 'ready' && reviewCount > 0 ? [{
      key: 'homework-review',
      title: t(`${reviewCount} تسليم${reviewCount === 1 ? '' : 'ات'} بانتظار المراجعة`, `${reviewCount} submissions pending review`),
      label: t('واجبات', 'Homework'),
      href: '/dashboard/admin/homework',
      icon: FileText,
    }] : []),
  ], [feedback.state, homework.state, reviewCount, stats?.pendingSubscriptions, statsState, unpubFeedback, t])
  const monthlyRevenue = Array.isArray(stats?.monthlyRevenue) ? stats.monthlyRevenue.filter((item) => Number.isFinite(item?.revenue)) : []
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((item) => item.revenue))
  const healthServices = [
    {
      label: t('التطبيق', 'Application'),
      icon: Activity,
      value: health.data?.application === 'healthy' ? t('يعمل', 'Healthy') : t('غير متاح', 'Unavailable'),
      ok: health.data?.application === 'healthy',
    },
    {
      label: t('قاعدة البيانات', 'Database'),
      icon: CheckCircle2,
      value: health.data?.database === 'healthy'
        ? t('متصلة', 'Connected')
        : health.data?.database === 'not_configured'
          ? t('غير مهيأة', 'Not configured')
          : t('غير متاحة', 'Unavailable'),
      ok: health.data?.database === 'healthy',
    },
  ]
  const followUpCount = (stats?.pendingSubscriptions || 0) + unpubFeedback.length + reviewCount

  return (
    <div className="space-y-5 sm:space-y-6" dir={localeDirection(language)}>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>Be Fluent · {t('الإدارة', 'Administration')}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t('نظرة عامة', 'Overview')}</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>{t('متابعة بيانات الإدارة والمهام اليومية.', 'Monitor administration data and daily tasks.')}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('subscriptions')}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border px-4 text-sm font-semibold transition-colors hover:bg-[var(--surface-muted)] sm:self-auto"
          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
        >
          {t('الاشتراكات', 'Subscriptions')}
          {typeof stats?.pendingSubscriptions === 'number' && stats.pendingSubscriptions > 0 && (
            <span className="min-w-6 rounded-full px-2 py-1 text-center text-xs font-bold tabular-nums" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}>
              {stats.pendingSubscriptions}
            </span>
          )}
        </button>
      </header>

      {statsState === 'error' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" role="alert" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('تعذر تحميل إحصاءات الإدارة.', 'Admin statistics could not be loaded.')}</p>
          <button type="button" onClick={onRetryStats} className="min-h-10 rounded-lg px-3 text-sm font-bold text-white" style={{ background: 'var(--primary)' }}>{t('إعادة المحاولة', 'Retry')}</button>
        </div>
      )}
      {statsState === 'ready' && !stats && (
        <div className="rounded-xl border p-4 text-sm" role="status" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
          {t('لا تتوفر إحصاءات لعرضها حالياً.', 'No statistics are currently available.')}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label={t('ملخص الإدارة', 'Administration summary')}>
        {statsState === 'loading' && Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }} aria-hidden="true" />
        ))}
        {statsState === 'ready' && stats && (
          <>
             <StatCard label={t('الطلاب النشطون', 'Active students')} value={stats.activeStudents != null ? formatNumber(stats.activeStudents) : '—'} icon={Users} />
             <StatCard label={t('المعلمون', 'Teachers')} value={stats.totalTeachers != null ? formatNumber(stats.totalTeachers) : '—'} icon={UserCheck} />
             <StatCard label={t('حصص هذا الأسبوع', 'Classes this week')} value={stats.sessionsThisWeek != null ? formatNumber(stats.sessionsThisWeek) : '—'} icon={CalendarDays} />
             <StatCard label={t('طلبات الاشتراك المعلّقة', 'Pending subscription requests')} value={stats.pendingSubscriptions != null ? formatNumber(stats.pendingSubscriptions) : '—'} icon={Clock3} />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-bold">{t('ما يحتاج متابعة', 'Needs attention')}</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{t('طلبات ومهام مبنية على البيانات المسجلة.', 'Requests and tasks based on recorded data.')}</p>
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--muted)' }}>{formatNumber(followUpCount)} {t('عناصر', 'items')}</span>
          </div>
          <div className="mt-4 space-y-2">
            {feedback.state === 'loading' || homework.state === 'loading' ? (
              <div className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--surface-muted)' }} aria-busy="true" />
            ) : null}
            {feedback.state === 'error' || homework.state === 'error' ? (
              <div className="rounded-xl border p-4 text-sm leading-6" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                {t('تعذر تحميل إحدى قوائم المتابعة. أعد المحاولة لقراءة بياناتها.', 'A follow-up list could not be loaded. Retry to fetch its data.')}
                <button type="button" onClick={retry} className="ms-2 font-bold underline underline-offset-4" style={{ color: 'var(--primary)' }}>{t('إعادة المحاولة', 'Retry')}</button>
              </div>
            ) : null}
            {feedback.state === 'ready' && homework.state === 'ready' && queue.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                {t('لا توجد عناصر تحتاج متابعة حالياً.', 'There are no items needing attention.')}
              </div>
            )}
            {queue.map((item) => {
              const Icon = item.icon
              const content = (
                <>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}><Icon size={17} aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.title}</span>
                      <span className="mt-1 block text-xs" style={{ color: 'var(--muted)' }}>{item.label}</span>
                    </span>
                  </span>
                   <ArrowLeft size={16} className={`shrink-0 ${language === 'ar' ? 'rotate-180' : ''}`} style={{ color: 'var(--primary)' }} aria-hidden="true" />
                </>
              )
              const className = 'flex min-h-[68px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition-colors hover:bg-[var(--surface-muted)]'

              return 'tab' in item ? (
                <button key={item.key} type="button" onClick={() => onNavigate(item.tab)} className={className} style={{ borderColor: 'var(--border)' }}>
                  {content}
                </button>
              ) : (
                <Link key={item.key} href={item.href} className={className} style={{ borderColor: 'var(--border)' }}>
                  {content}
                </Link>
              )
            })}
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{t('اختصارات', 'Shortcuts')}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Link href="/dashboard/admin/people" className="inline-flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors hover:opacity-80" style={{ background: 'var(--surface-muted)', color: 'var(--foreground)' }}>{t('الأشخاص', 'People')} <Users size={15} aria-hidden="true" /></Link>
              <Link href="/dashboard/admin/classes" className="inline-flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors hover:opacity-80" style={{ background: 'var(--surface-muted)', color: 'var(--foreground)' }}>{t('الحصص', 'Classes')} <CalendarDays size={15} aria-hidden="true" /></Link>
              <button type="button" onClick={() => onNavigate('subscriptions')} className="inline-flex min-h-11 items-center justify-between rounded-xl px-4 text-start text-sm font-semibold transition-colors hover:opacity-80" style={{ background: 'var(--surface-muted)', color: 'var(--foreground)' }}>{t('مراجعة دفعات الاشتراك', 'Review subscription payments')} <CreditCard size={15} aria-hidden="true" /></button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="flex items-center gap-2 font-bold"><Server size={18} style={{ color: 'var(--primary)' }} aria-hidden="true" />{t('حالة الخدمات', 'Service health')}</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('نتيجة فحص التطبيق وقاعدة البيانات.', 'Application and database health check results.')}</p>
          <div className="mt-4 space-y-2">
            {health.state === 'loading' && (
              <div className="space-y-2" aria-busy="true" aria-label={t('جارٍ فحص الخدمات', 'Checking service health')}>
                <div className="h-12 animate-pulse rounded-lg" style={{ background: 'var(--surface-muted)' }} />
                <div className="h-12 animate-pulse rounded-lg" style={{ background: 'var(--surface-muted)' }} />
              </div>
            )}
            {health.state === 'error' && (
              <div className="rounded-xl border p-4 text-sm leading-6" role="status" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                {t('تعذر قراءة حالة الخدمات.', 'Service health could not be loaded.')}
                <button type="button" onClick={retry} className="ms-2 font-bold underline underline-offset-4" style={{ color: 'var(--primary)' }}>{t('إعادة المحاولة', 'Retry')}</button>
              </div>
            )}
            {health.state === 'ready' && healthServices.map((service) => {
              const Icon = service.icon
              return (
                <div key={service.label} className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3" style={{ background: 'var(--surface-muted)' }}>
                  <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}><Icon size={16} aria-hidden="true" />{service.label}</span>
                  <span className="text-sm font-semibold" style={{ color: service.ok ? 'var(--primary)' : 'var(--muted)' }}>{service.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <details className="rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-start text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset" style={{ color: 'var(--foreground)' }}>
          {t('تقارير وبيانات إضافية', 'Additional reports and data')}
          <span className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>
            {t('افتح عند الحاجة', 'Expand when needed')}
            <ChevronDown size={15} aria-hidden="true" />
          </span>
        </summary>
        <div className="space-y-4 border-t p-4" style={{ borderColor: 'var(--border)' }}>
      <section className="grid gap-4 xl:grid-cols-2">
        {monthlyRevenue.length > 0 && (
          <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">{t('الإيرادات الشهرية', 'Monthly revenue')}</h2>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('بحسب تقرير الاشتراكات المسجل', 'Based on recorded subscription reports')}</p>
              </div>
            </div>
            <div className="mt-6 flex min-h-40 items-end gap-3 overflow-x-auto border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              {monthlyRevenue.map((item, index) => (
                <div key={`${item.month}-${index}`} className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--muted)' }}>{formatCurrency(item.revenue)}</span>
                  <div role="img" aria-label={t(`إيرادات ${item.month}: ${formatCurrency(item.revenue)}`, `Revenue for ${item.month}: ${formatCurrency(item.revenue)}`)} className="w-full max-w-10 rounded-t" style={{ height: `${Math.max(6, (item.revenue / maxRevenue) * 108)}px`, background: 'var(--primary)' }} />
                  <span className="max-w-full truncate text-[11px]" style={{ color: 'var(--muted)' }}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-bold">{t('أحدث الاشتراكات', 'Recent subscriptions')}</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('آخر الطلبات المسجلة', 'Latest recorded requests')}</p>
            </div>
            <Link href="/dashboard/admin/commerce" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>{t('عرض الكل', 'View all')} <ArrowLeft className={language === 'ar' ? 'rotate-180' : ''} size={15} aria-hidden="true" /></Link>
          </div>
          {statsState === 'loading' ? <div className="h-24 animate-pulse" aria-busy="true" aria-label={t('جارٍ تحميل الاشتراكات', 'Loading subscriptions')} style={{ background: 'var(--surface-muted)' }} /> : recentSubscriptions.length ? (
            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentSubscriptions.slice(0, 4).map((sub, index) => {
                const status = String(sub.status || '').toUpperCase()
                const statusLabel = status === 'APPROVED' ? t('مقبول', 'Approved') : status === 'PENDING' ? t('قيد المراجعة', 'Pending review') : status === 'REJECTED' ? t('مرفوض', 'Rejected') : (sub.status || t('غير محدد', 'Unspecified'))
                return <li key={sub.id ?? index} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{sub.User?.name || t('مستخدم', 'User')}</p>
                    <p className="mt-1 truncate text-xs" style={{ color: 'var(--muted)' }}>{sub.Package?.title || t('باقة غير محددة', 'Unspecified package')} · {formatDate(sub.createdAt, language)}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: status === 'PENDING' ? 'var(--surface-muted)' : 'var(--bf-green-soft)', color: 'var(--primary)' }}>{statusLabel}</span>
                </li>
              })}
            </ul>
          ) : <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>{t('لا توجد اشتراكات حديثة لعرضها.', 'No recent subscriptions to show.')}</p>}
        </div>
      </section>

      {recentUsers.length > 0 && (
        <section className="overflow-hidden rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-bold">{t('مستخدمون أُضيفوا مؤخراً', 'Recently added users')}</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('بحسب أحدث البيانات المتاحة', 'Based on the latest available data')}</p>
            </div>
            <Link href="/dashboard/admin/people" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>{t('المستخدمون', 'Users')} <ArrowLeft className={language === 'ar' ? 'rotate-180' : ''} size={15} aria-hidden="true" /></Link>
          </div>
          <ul className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0" style={{ borderColor: 'var(--border)' }}>
            {recentUsers.slice(0, 4).map((user, index) => (
              <li key={user.id ?? index} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}>{user.name?.trim().charAt(0).toUpperCase() || '؟'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{user.name || t('مستخدم', 'User')}</span>
                  <span className="mt-1 block truncate text-xs" style={{ color: 'var(--muted)' }}>{user.role ? (user.role === 'STUDENT' ? t('طالب', 'Student') : user.role === 'TEACHER' ? t('معلم', 'Teacher') : user.role === 'ADMIN' ? t('مدير', 'Admin') : user.role) : '—'} · {formatDate(user.createdAt, language)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
        </div>
      </details>
      {stats?.totalRevenue != null && (
        <p className="sr-only">{t(`إجمالي الإيرادات المسجلة: ${formatCurrency(Number(stats.totalRevenue))}.`, `Total recorded revenue: ${formatCurrency(Number(stats.totalRevenue))}.`)}</p>
      )}
    </div>
  )
}