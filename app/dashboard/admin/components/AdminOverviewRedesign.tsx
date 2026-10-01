'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Users,
} from 'lucide-react'

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

function itemsFrom<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === 'object' && Array.isArray((body as { items?: unknown }).items)) {
    return (body as { items: T[] }).items
  }
  return []
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  href,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Users
  href: string
}) {
  return (
    <Link
      href={href}
      className="min-h-[136px] rounded-2xl border p-4 transition-colors hover:bg-[var(--surface-muted)] sm:p-5"
      style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}>
          <Icon size={19} aria-hidden="true" />
        </span>
        <ArrowLeft size={15} style={{ color: 'var(--muted)' }} aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs font-semibold" style={{ color: 'var(--muted)' }}>{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="truncate text-xs" style={{ color: 'var(--muted)' }}>{detail}</span>
      </div>
    </Link>
  )
}

export default function AdminOverviewRedesign({
  stats,
  statsState,
  onRetryStats,
}: {
  stats: AdminOverviewStats | null
  statsState: DataState
  onRetryStats: () => void
}) {
  const [feedback, setFeedback] = useState<Feed<FeedbackItem[]>>({ state: 'loading' })
  const [homework, setHomework] = useState<Feed<HomeworkItem[]>>({ state: 'loading' })
  const [retryKey, setRetryKey] = useState(0)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    setFeedback({ state: 'loading' })
    setHomework({ state: 'loading' })
    const [feedbackFeed, homeworkFeed] = await Promise.all([
      loadJson<unknown>('/api/admin/feedback'),
      loadJson<unknown>('/api/admin/homework'),
    ])
    setFeedback(feedbackFeed.state === 'ready' ? { state: 'ready', data: itemsFrom<FeedbackItem>(feedbackFeed.data) } : { state: 'error' })
    setHomework(homeworkFeed.state === 'ready' ? { state: 'ready', data: itemsFrom<HomeworkItem>(homeworkFeed.data) } : { state: 'error' })
  }, [])

  useEffect(() => { void load() }, [load, retryKey])

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
    ...(feedback.state === 'ready' ? unpubFeedback.slice(0, 5).map((item) => ({
      key: `feedback-${item.id}`,
      title: item.summary?.trim() || 'ملاحظة تعليمية غير منشورة',
      label: item.status === 'READY_TO_PUBLISH' ? 'جاهزة للنشر' : 'مسودة',
      href: '/dashboard/admin/feedback',
      icon: BookOpenCheck,
    })) : []),
    ...(homework.state === 'ready' && reviewCount > 0 ? [{
      key: 'homework-review',
      title: `${reviewCount} تسليم${reviewCount === 1 ? '' : 'ات'} بانتظار المراجعة`,
      label: 'واجبات',
      href: '/dashboard/admin/homework',
      icon: FileText,
    }] : []),
  ], [feedback.state, homework.state, reviewCount, unpubFeedback])
  const filteredQueue = queue.filter((item) => `${item.title} ${item.label}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const monthlyRevenue = Array.isArray(stats?.monthlyRevenue) ? stats.monthlyRevenue.filter((item) => Number.isFinite(item?.revenue)) : []
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((item) => item.revenue))

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>Be Fluent · الإدارة</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">نظرة عامة</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>متابعة العمل المسجل والوصول إلى المهام اليومية.</p>
        </div>
        <label className="flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 sm:max-w-[320px]" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Activity size={17} style={{ color: 'var(--muted)' }} aria-hidden="true" />
          <span className="sr-only">البحث في مهام المتابعة</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            placeholder="ابحث في المتابعة"
          />
        </label>
      </header>

      {statsState === 'error' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" role="alert" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>تعذر تحميل إحصاءات الإدارة.</p>
          <button type="button" onClick={onRetryStats} className="min-h-10 rounded-lg px-3 text-sm font-bold text-white" style={{ background: 'var(--primary)' }}>إعادة المحاولة</button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="ملخص الإدارة">
        {statsState === 'loading' && Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-[136px] animate-pulse rounded-2xl border" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }} aria-hidden="true" />
        ))}
        {statsState === 'ready' && stats && (
          <>
            <StatCard label="إجمالي الطلاب" value={String(stats.totalStudents ?? '—')} detail="حساباً مسجلاً" icon={Users} href="/dashboard/admin/people" />
            <StatCard label="الطلاب النشطون" value={String(stats.activeStudents ?? '—')} detail="حساباً نشطاً" icon={CheckCircle2} href="/dashboard/admin/people" />
            <StatCard label="الحصص هذا الأسبوع" value={String(stats.sessionsThisWeek ?? '—')} detail="حصة مسجلة" icon={CalendarDays} href="/dashboard/admin/classes" />
            <StatCard label="اشتراكات قيد المراجعة" value={String(stats.pendingSubscriptions ?? '—')} detail="طلباً" icon={CreditCard} href="/dashboard/admin/commerce" />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-bold">ما يحتاج متابعة</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>قوائم مأخوذة من الملاحظات والواجبات المسجلة.</p>
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--muted)' }}>{unpubFeedback.length + reviewCount} عناصر</span>
          </div>
          <div className="mt-4 space-y-2">
            {feedback.state === 'loading' || homework.state === 'loading' ? (
              <div className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--surface-muted)' }} aria-busy="true" />
            ) : null}
            {feedback.state === 'error' || homework.state === 'error' ? (
              <div className="rounded-xl border p-4 text-sm leading-6" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                تعذر تحميل إحدى قوائم المتابعة. أعد المحاولة لقراءة بياناتها.
                <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="me-2 font-bold underline underline-offset-4" style={{ color: 'var(--primary)' }}>إعادة المحاولة</button>
              </div>
            ) : null}
            {feedback.state === 'ready' && homework.state === 'ready' && filteredQueue.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                {queue.length ? 'لا توجد نتائج مطابقة.' : 'لا توجد عناصر تحتاج متابعة حالياً.'}
              </div>
            )}
            {filteredQueue.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.key} href={item.href} className="flex min-h-[68px] items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-[var(--surface-muted)]" style={{ borderColor: 'var(--border)' }}>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}><Icon size={17} aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.title}</span>
                      <span className="mt-1 block text-xs" style={{ color: 'var(--muted)' }}>{item.label}</span>
                    </span>
                  </span>
                  <ArrowLeft size={16} className="shrink-0" style={{ color: 'var(--primary)' }} aria-hidden="true" />
                </Link>
              )
            })}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href="/dashboard/admin/feedback" className="inline-flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-semibold" style={{ background: 'var(--surface-muted)', color: 'var(--foreground)' }}>الملاحظات التعليمية <ArrowLeft size={15} aria-hidden="true" /></Link>
            <Link href="/dashboard/admin/homework" className="inline-flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-semibold" style={{ background: 'var(--surface-muted)', color: 'var(--foreground)' }}>الواجبات والتسليمات <ArrowLeft size={15} aria-hidden="true" /></Link>
          </div>
        </div>

        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-bold">اختصارات الإدارة</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>انتقال مباشر إلى المساحات التشغيلية.</p>
          </div>
          <div className="mt-4 space-y-2">
            {[
              ['/dashboard/admin/classes', 'إدارة الحصص', CalendarDays],
              ['/dashboard/admin/people', 'المستخدمون', Users],
              ['/dashboard/admin/levels', 'المستويات والمراحل', BookOpenCheck],
              ['/dashboard/admin/commerce', 'الاشتراكات والمدفوعات', CreditCard],
            ].map(([href, label, Icon]) => {
              const RouteIcon = Icon as typeof Users
              return <Link key={String(href)} href={String(href)} className="flex min-h-12 items-center justify-between rounded-xl px-3 transition-colors hover:bg-[var(--surface-muted)]">
                <span className="flex items-center gap-3 text-sm font-semibold"><RouteIcon size={17} style={{ color: 'var(--primary)' }} aria-hidden="true" />{String(label)}</span>
                <ArrowLeft size={15} style={{ color: 'var(--muted)' }} aria-hidden="true" />
              </Link>
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {monthlyRevenue.length > 0 && (
          <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">الإيرادات الشهرية</h2>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>بحسب التقرير الحالي</p>
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>ج.م</span>
            </div>
            <div className="mt-6 flex min-h-40 items-end gap-3 overflow-x-auto border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              {monthlyRevenue.map((item, index) => (
                <div key={`${item.month}-${index}`} className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--muted)' }}>{item.revenue.toLocaleString('ar-SA')}</span>
                  <div role="img" aria-label={`${item.month}: ${item.revenue.toLocaleString('ar-SA')} جنيه`} className="w-full max-w-10 rounded-t" style={{ height: `${Math.max(6, (item.revenue / maxRevenue) * 108)}px`, background: 'var(--primary)' }} />
                  <span className="max-w-full truncate text-[11px]" style={{ color: 'var(--muted)' }}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-bold">أحدث الاشتراكات</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>آخر الطلبات المسجلة</p>
            </div>
            <Link href="/dashboard/admin/commerce" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>عرض الكل <ArrowLeft size={15} aria-hidden="true" /></Link>
          </div>
          {statsState === 'loading' ? <div className="h-24 animate-pulse" style={{ background: 'var(--surface-muted)' }} /> : recentSubscriptions.length ? (
            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentSubscriptions.slice(0, 4).map((sub, index) => {
                const status = String(sub.status || '').toUpperCase()
                const statusLabel = status === 'APPROVED' ? 'مقبول' : status === 'PENDING' ? 'قيد المراجعة' : status === 'REJECTED' ? 'مرفوض' : (sub.status || 'غير محدد')
                return <li key={sub.id ?? index} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{sub.User?.name || 'مستخدم'}</p>
                    <p className="mt-1 truncate text-xs" style={{ color: 'var(--muted)' }}>{sub.Package?.title || 'باقة غير محددة'} · {formatDate(sub.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: status === 'PENDING' ? 'var(--surface-muted)' : 'var(--bf-green-soft)', color: 'var(--primary)' }}>{statusLabel}</span>
                </li>
              })}
            </ul>
          ) : <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>لا توجد اشتراكات حديثة لعرضها.</p>}
        </div>
      </section>

      {recentUsers.length > 0 && (
        <section className="overflow-hidden rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-bold">مستخدمون أُضيفوا مؤخراً</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>بحسب أحدث البيانات المتاحة</p>
            </div>
            <Link href="/dashboard/admin/people" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>المستخدمون <ArrowLeft size={15} aria-hidden="true" /></Link>
          </div>
          <ul className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0" style={{ borderColor: 'var(--border)' }}>
            {recentUsers.slice(0, 4).map((user, index) => (
              <li key={user.id ?? index} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}>{user.name?.trim().charAt(0).toUpperCase() || '؟'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{user.name || 'مستخدم'}</span>
                  <span className="mt-1 block truncate text-xs" style={{ color: 'var(--muted)' }}>{user.role || '—'} · {formatDate(user.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {stats?.totalRevenue != null && (
        <p className="sr-only">إجمالي الإيرادات المسجلة: {Number(stats.totalRevenue).toLocaleString('ar-SA')} جنيه.</p>
      )}
    </div>
  )
}