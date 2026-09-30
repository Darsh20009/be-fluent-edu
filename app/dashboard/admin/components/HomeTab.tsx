'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Mail as MailIcon,
  PhoneCall,
  Server,
  UserCheck,
  Users,
} from 'lucide-react'

interface RecentSubscription {
  id?: string | number
  status?: string
  createdAt?: string
  User?: { name?: string | null } | null
  Package?: { title?: string | null; price?: number | null } | null
}

interface RecentUser {
  id?: string | number
  name?: string | null
  role?: string | null
  createdAt?: string | null
}

interface Stats {
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
  health?: {
    database?: string
    email?: string
  }
}

type StatTile = {
  label: string
  value: string
  icon: typeof Users
  note?: string
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleDateString('ar')
}

function getServiceState(value: string | undefined, activeValue: string) {
  if (!value) return 'غير متاح'
  return value.toLowerCase() === activeValue ? (activeValue === 'connected' ? 'متصل' : 'نشط') : 'غير متاح'
}

export default function HomeTab({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        setError(true)
        return
      }
      const data: unknown = await response.json()
      if (!data || typeof data !== 'object') {
        setError(true)
        return
      }
      setStats(data as Stats)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="جارٍ تحميل لوحة الإدارة">
        <div className="h-9 w-52 animate-pulse rounded bg-[#e5ebe6]" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-28 rounded-xl border border-[#e0e6e1] bg-white" />
          <div className="h-28 rounded-xl border border-[#e0e6e1] bg-white" />
          <div className="h-28 rounded-xl border border-[#e0e6e1] bg-white" />
        </div>
        <div className="h-56 rounded-xl border border-[#e0e6e1] bg-white" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <section className="rounded-xl border border-[#ead9d5] bg-white p-6 sm:p-8" role="alert">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-[#a15445]" size={20} aria-hidden="true" />
          <div>
            <h1 className="text-lg font-bold text-[#26332e]">تعذر تحميل بيانات لوحة الإدارة</h1>
            <p className="mt-1 text-sm leading-6 text-[#68756e]">لم نتمكن من قراءة الإحصاءات الآن. حاول مرة أخرى.</p>
            <button
              type="button"
              onClick={() => void fetchStats()}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#247456] px-4 text-sm font-bold text-white hover:bg-[#19583f]"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    )
  }

  const tiles: StatTile[] = [
    ...(isFiniteNumber(stats.totalStudents) ? [{ label: 'إجمالي الطلاب', value: String(stats.totalStudents), icon: Users }] : []),
    ...(isFiniteNumber(stats.activeStudents) ? [{ label: 'الطلاب النشطون', value: String(stats.activeStudents), icon: UserCheck }] : []),
    ...(isFiniteNumber(stats.totalRevenue) ? [{ label: 'إجمالي الإيرادات', value: `${stats.totalRevenue.toLocaleString('ar')} ج.م`, icon: CreditCard }] : []),
    ...(isFiniteNumber(stats.sessionsThisWeek) ? [{ label: 'حصص هذا الأسبوع', value: String(stats.sessionsThisWeek), icon: Calendar }] : []),
    ...(isFiniteNumber(stats.pendingSubscriptions) ? [{ label: 'اشتراكات بانتظار المراجعة', value: String(stats.pendingSubscriptions), icon: Clock }] : []),
    ...(isFiniteNumber(stats.totalTeachers) ? [{ label: 'المعلمون', value: String(stats.totalTeachers), icon: Users }] : []),
  ]
  const monthlyRevenue = Array.isArray(stats.monthlyRevenue)
    ? stats.monthlyRevenue.filter((item) => item && typeof item.month === 'string' && isFiniteNumber(item.revenue))
    : []
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((item) => item.revenue))
  const recentSubscriptions = Array.isArray(stats.recentSubscriptions) ? stats.recentSubscriptions : []
  const recentUsers = Array.isArray(stats.recentUsers) ? stats.recentUsers : []
  const pendingSubscriptions = isFiniteNumber(stats.pendingSubscriptions) ? stats.pendingSubscriptions : null

  return (
    <div className="space-y-6 sm:space-y-7">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold text-[#66806e]">Be Fluent · الإدارة</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#26332e] sm:text-[28px]">نظرة عامة</h1>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab?.('subscriptions')}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-[#dfe6df] px-4 text-sm font-semibold text-[#3d614b] hover:bg-[#f3f7f3] sm:self-auto"
        >
          الاشتراكات
          {pendingSubscriptions !== null && pendingSubscriptions > 0 && (
            <span className="min-w-6 rounded-full bg-[#edf4ef] px-2 py-1 text-center text-xs font-bold tabular-nums text-[#286547]">{pendingSubscriptions}</span>
          )}
        </button>
      </header>

      {tiles.length > 0 && (
        <section aria-label="إحصاءات فعلية" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tiles.map((tile) => {
            const Icon = tile.icon
            return (
              <article key={tile.label} className="flex min-h-[112px] items-center gap-4 rounded-xl border border-[#e0e6e1] bg-white p-4 sm:p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#edf4ef] text-[#327453]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#68756e]">{tile.label}</p>
                  <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums text-[#26332e]">{tile.value}</p>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <section aria-label="مهام الإدارة" className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
        <div className="rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-[#26332e]">ما يحتاج متابعة</h2>
              <p className="mt-1 text-sm text-[#718078]">انتقل مباشرة إلى قائمة العمل المرتبطة.</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f5f1e8] text-[#866b35]">
              <CheckCircle2 size={19} aria-hidden="true" />
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab?.('subscriptions')}
            className="mt-5 flex min-h-[68px] w-full items-center justify-between gap-4 rounded-lg border border-[#e7ebe7] px-4 text-right hover:bg-[#f7f9f7]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CreditCard size={18} className="shrink-0 text-[#557360]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-[#334239]">طلبات الاشتراك</span>
                <span className="mt-1 block text-xs text-[#718078]">مراجعة الطلبات المسجلة</span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#315f49]">
              {pendingSubscriptions === null ? 'عرض القائمة' : `${pendingSubscriptions} بانتظار المراجعة`}
              <ArrowLeft size={16} aria-hidden="true" />
            </span>
          </button>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab?.('leads')}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-4 text-sm font-semibold text-[#465a4e] hover:bg-[#edf3ee]"
            >
              طلبات الحجز <PhoneCall size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab?.('system')}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-4 text-sm font-semibold text-[#465a4e] hover:bg-[#edf3ee]"
            >
              النظام والسجلات <FileText size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <section className="rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-bold text-[#26332e]">
            <Server size={18} className="text-[#527360]" aria-hidden="true" />
            حالة الخدمات المسجلة
          </h2>
          <p className="mt-1 text-xs text-[#7a867f]">الحالة الواردة من بيانات النظام</p>
          <div className="mt-4 space-y-2">
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-3">
              <span className="flex items-center gap-2 text-sm text-[#536258]"><Activity size={16} aria-hidden="true" />قاعدة البيانات</span>
              <span className="text-sm font-semibold text-[#3d614b]">{getServiceState(stats.health?.database, 'connected')}</span>
            </div>
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-3">
              <span className="flex items-center gap-2 text-sm text-[#536258]"><MailIcon size={16} aria-hidden="true" />خدمة البريد</span>
              <span className="text-sm font-semibold text-[#3d614b]">{getServiceState(stats.health?.email, 'active')}</span>
            </div>
          </div>
        </section>
      </section>

      <section aria-label="بيانات النشاط" className="grid gap-4 xl:grid-cols-2">
        {monthlyRevenue.length > 0 && (
          <div className="rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-[#26332e]">
                  <BarChart3 size={18} className="text-[#527360]" aria-hidden="true" />
                  الإيرادات الشهرية
                </h2>
                <p className="mt-1 text-xs text-[#718078]">القيم كما وردت في تقرير النظام</p>
              </div>
              <span className="text-xs text-[#718078]">ج.م</span>
            </div>
            <div className="mt-6 flex min-h-40 items-end gap-3 overflow-x-auto border-b border-[#e8ece8] pb-3">
              {monthlyRevenue.map((item, index) => (
                <div key={`${item.month}-${index}`} className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold tabular-nums text-[#6d7a71]">{item.revenue.toLocaleString('ar')}</span>
                  <div
                    aria-label={`${item.month}: ${item.revenue.toLocaleString('ar')} جنيه`}
                    className="w-full max-w-10 rounded-t bg-[#6a9b7d]"
                    role="img"
                    style={{ height: `${Math.max(6, (item.revenue / maxRevenue) * 108)}px` }}
                  />
                  <span className="max-w-full truncate text-[11px] text-[#6d7a71]">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[#e0e6e1] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ece8] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-[#26332e]">أحدث الاشتراكات</h2>
              <p className="mt-1 text-xs text-[#718078]">الطلبات المسجلة مؤخراً</p>
            </div>
            <button type="button" onClick={() => setActiveTab?.('subscriptions')} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#315f49]">
              عرض الكل <ArrowLeft size={15} aria-hidden="true" />
            </button>
          </div>
          {recentSubscriptions.length ? (
            <ul className="divide-y divide-[#edf0ed]">
              {recentSubscriptions.slice(0, 4).map((sub, index) => {
                const status = String(sub.status || '').toUpperCase()
                const statusLabel = status === 'APPROVED' ? 'مقبول' : status === 'PENDING' ? 'معلّق' : status === 'REJECTED' ? 'مرفوض' : (sub.status || 'غير محدد')
                return (
                  <li key={sub.id ?? index} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#334239]">{sub.User?.name || 'مستخدم'}</p>
                      <p className="mt-1 truncate text-xs text-[#718078]">{sub.Package?.title || 'باقة غير محددة'} · {formatDate(sub.createdAt)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      status === 'APPROVED' ? 'bg-[#edf4ef] text-[#286547]' : status === 'PENDING' ? 'bg-[#f8f2e3] text-[#80662d]' : 'bg-[#f1f3f1] text-[#657168]'
                    }`}>{statusLabel}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-[#718078]">لا توجد اشتراكات حديثة لعرضها.</p>
          )}
        </div>
      </section>

      {recentUsers.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-[#e0e6e1] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ece8] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-[#26332e]">مستخدمون أُضيفوا مؤخراً</h2>
              <p className="mt-1 text-xs text-[#718078]">بحسب أحدث البيانات المتاحة</p>
            </div>
            <button type="button" onClick={() => setActiveTab?.('users')} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#315f49]">
              المستخدمون <ArrowLeft size={15} aria-hidden="true" />
            </button>
          </div>
          <ul className="grid divide-y divide-[#edf0ed] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {recentUsers.slice(0, 4).map((user, index) => (
              <li key={user.id ?? index} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf4ef] text-xs font-bold text-[#286547]">
                  {user.name?.trim().charAt(0).toUpperCase() || '؟'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#334239]">{user.name || 'مستخدم'}</span>
                  <span className="mt-1 block truncate text-xs text-[#718078]">{user.role || '—'} · {formatDate(user.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}