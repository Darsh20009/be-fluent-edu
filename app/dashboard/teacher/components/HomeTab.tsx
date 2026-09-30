'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, BookOpen, Calendar, Clock, Users } from 'lucide-react'

interface Stats {
  totalStudents: number
  totalSessions: number
  upcomingSessions: number
  pendingGrading: number
  nextSession: {
    id: string
    title: string
    startTime: Date | string
    endTime: Date | string
    studentsCount: number
  } | null
}

type HomeTabProps = {
  teacherProfileId: string
  setActiveTab: (tab: string) => void
}

function formatSessionDate(value: Date | string) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return null
  return date.toLocaleString('ar', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HomeTab({ teacherProfileId, setActiveTab }: HomeTabProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch('/api/teacher/stats')
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
      <div className="space-y-4" aria-busy="true" aria-label="جارٍ تحميل نظرة عامة">
        <div className="h-8 w-48 animate-pulse rounded bg-[#e6ece7]" />
        <div className="h-52 rounded-xl border border-[#e0e6e1] bg-white" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-36 rounded-xl border border-[#e0e6e1] bg-white" />
          <div className="h-36 rounded-xl border border-[#e0e6e1] bg-white" />
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <section className="rounded-xl border border-[#ead9d5] bg-white p-6 sm:p-8" role="alert" data-teacher-profile={teacherProfileId}>
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-[#a15445]" size={20} aria-hidden="true" />
          <div>
            <h1 className="text-lg font-bold text-[#26332e]">تعذر تحميل نظرة عامة</h1>
            <p className="mt-1 text-sm leading-6 text-[#68756e]">لم نتمكن من جلب بيانات العمل الآن. حاول مرة أخرى.</p>
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

  const sessionDate = stats.nextSession ? formatSessionDate(stats.nextSession.startTime) : null

  return (
    <div className="space-y-5 sm:space-y-6" data-teacher-profile={teacherProfileId}>
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold text-[#66806e]">مساحة المعلم</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#26332e] sm:text-[28px]">نظرة عامة</h1>
        </div>
        <p className="text-sm text-[#718078]">ابدأ بما يحتاج متابعة اليوم.</p>
      </header>

      <section aria-labelledby="teacher-next-session" className="overflow-hidden rounded-xl border border-[#dfe8e0] bg-white">
        <div className="h-1 bg-[#3a7959]" />
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#527360]">
              <Calendar size={18} aria-hidden="true" />
              الحصة القادمة
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-[#315f49] hover:bg-[#f2f7f2]"
            >
              كل الحصص <ArrowLeft size={16} aria-hidden="true" />
            </button>
          </div>
          {stats.nextSession ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div>
                <h2 id="teacher-next-session" className="text-xl font-bold leading-8 text-[#26332e] sm:text-2xl">
                  {stats.nextSession.title || 'حصة مجدولة'}
                </h2>
                <p className="mt-2 text-sm text-[#68756e]">
                  {sessionDate || 'موعد الحصة غير متاح'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#56665c]">
                <Users size={17} aria-hidden="true" />
                <span>{Number.isFinite(stats.nextSession.studentsCount) ? stats.nextSession.studentsCount : '—'} طالباً مسجلاً</span>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg bg-[#f6f8f6] px-4 py-5">
              <h2 id="teacher-next-session" className="font-semibold text-[#34443a]">لا توجد حصة قادمة مسجلة</h2>
              <p className="mt-1 text-sm text-[#718078]">يمكنك مراجعة جدول الحصص لمعرفة مواعيدك.</p>
            </div>
          )}
        </div>
      </section>

      <section aria-label="العمل بانتظار المتابعة" className="grid gap-4 md:grid-cols-2">
        <article className="flex min-h-[168px] flex-col justify-between rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#58685e]">التصحيح والمتابعة</p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-[#26332e]">{Number.isFinite(stats.pendingGrading) ? stats.pendingGrading : '—'}</p>
              <p className="mt-1 text-sm text-[#718078]">أعمال بانتظار التصحيح</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#f6f1e6] text-[#866b35]">
              <BookOpen size={20} aria-hidden="true" />
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#315f49] hover:text-[#194f37]"
          >
            مراجعة الواجبات <ArrowLeft size={16} aria-hidden="true" />
          </button>
        </article>

        <article className="flex min-h-[168px] flex-col justify-between rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#58685e]">الحصص القادمة</p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-[#26332e]">{Number.isFinite(stats.upcomingSessions) ? stats.upcomingSessions : '—'}</p>
              <p className="mt-1 text-sm text-[#718078]">حسب بيانات جدولك</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#edf4ef] text-[#327453]">
              <Clock size={20} aria-hidden="true" />
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#315f49] hover:text-[#194f37]"
          >
            فتح الجدول <ArrowLeft size={16} aria-hidden="true" />
          </button>
        </article>
      </section>

      <section className="rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-[#26332e]">انتقل إلى مساحة العمل</h2>
            <p className="mt-1 text-sm text-[#718078]">الوصول المباشر إلى مهام الطلاب والحصص.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#dfe6df] px-4 text-sm font-semibold text-[#42584a] hover:bg-[#f5f8f5]"
            >
              <Users size={16} aria-hidden="true" /> الطلاب
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#dfe6df] px-4 text-sm font-semibold text-[#42584a] hover:bg-[#f5f8f5]"
            >
              <BookOpen size={16} aria-hidden="true" /> الواجبات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#dfe6df] px-4 text-sm font-semibold text-[#42584a] hover:bg-[#f5f8f5]"
            >
              <Calendar size={16} aria-hidden="true" /> الحصص
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}