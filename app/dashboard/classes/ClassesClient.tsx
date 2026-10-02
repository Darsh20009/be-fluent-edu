'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import base from '@/app/phase4/phase4.module.css'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import AdminQMeetQuickStart from '@/app/dashboard/admin/classes/AdminQMeetQuickStart'

type Role = 'admin' | 'teacher' | 'student'
type Session = Record<string, unknown> & {
  id: string
  title?: string
  startTime?: string
  endTime?: string
  status?: string
  group?: { name?: string; nameAr?: string | null } | null
  participants?: unknown[]
  attendances?: unknown[]
  qmeetMeeting?: Record<string, unknown> | null
}
type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'database' | 'provider'

const copy = {
  admin: { endpoint: '/api/admin/classes/sessions', tabs: ['Classes', 'Sessions', 'Schedule', 'QMeet'] },
  teacher: { endpoint: '/api/teacher/classes/sessions', tabs: ['My Classes', 'Upcoming Sessions', 'Session Details', 'QMeet', 'Attendance'] },
  student: { endpoint: '/api/student/classes', tabs: ['My Classes', 'Upcoming Class', 'Class Details', 'Join Class'] },
} as const

const tabTranslations: Record<string, string> = {
  Classes: 'الفصول',
  Sessions: 'الجلسات',
  Schedule: 'الجدول',
  QMeet: 'QMeet',
  'My Classes': 'فصولي',
  'Upcoming Sessions': 'الجلسات القادمة',
  'Session Details': 'تفاصيل الجلسة',
  Attendance: 'الحضور',
  'Upcoming Class': 'الحصة القادمة',
  'Class Details': 'تفاصيل الحصة',
  'Join Class': 'الانضمام إلى الحصة',
}

function formatDate(value: string | undefined, language: 'ar' | 'en') {
  if (!value) return localeText(language, 'سيتم تأكيد الوقت لاحقاً', 'Time to be confirmed')
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function getErrorState(response: Response, body: Record<string, unknown>) {
  const code = String((body.error as Record<string, unknown> | undefined)?.code || body.code || '')
  if (response.status === 503 && code === 'DATABASE_UNAVAILABLE') return 'database' as const
  if (code === 'PROVIDER_UNAVAILABLE' || response.status === 502) return 'provider' as const
  return 'error' as const
}

export default function ClassesClient({ role }: { role: Role }) {
  const { language } = useTheme()
  const isArabic = language === 'ar'
  const tr = useCallback((arabic: string, english: string) => localeText(language, arabic, english), [language])
  const config = copy[role]
  const [tab, setTab] = useState<string>(config.tabs[0])
  const [items, setItems] = useState<Session[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [message, setMessage] = useState('')
  const [joinMessage, setJoinMessage] = useState('')
  const [qmeetActionId, setQmeetActionId] = useState('')
  const [qmeetActionMessage, setQmeetActionMessage] = useState('')
  const [qmeetActionLink, setQmeetActionLink] = useState('')
  const [loadedAt, setLoadedAt] = useState(0)

  const load = useCallback(async () => {
    setState('loading'); setMessage('')
    try {
      const response = await fetch(config.endpoint, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        const errorState = getErrorState(response, body)
        setItems([])
        setState(errorState)
        setMessage(errorState === 'database'
          ? tr('بيانات الفصول غير متاحة حالياً.', 'Class records are unavailable right now.')
          : errorState === 'provider'
            ? tr('خدمة الاجتماعات المباشرة QMeet غير متاحة حالياً.', 'The QMeet live meeting service is currently unavailable.')
            : tr('تعذر تحميل بيانات الفصول. حاول مرة أخرى.', 'Class information could not be loaded. Please try again.'))
        return
      }
      const next = Array.isArray(body) ? body : body.items
      setItems(Array.isArray(next) ? next : [])
      setLoadedAt(Date.now())
      setState(Array.isArray(next) && next.length ? 'ready' : 'empty')
    } catch { setItems([]); setState('error'); setMessage(tr('تعذر تحميل بيانات الفصول. حاول مرة أخرى.', 'Class information could not be loaded. Please try again.')) }
  }, [config.endpoint, tr])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get('view')
    // Apply optional deep-linked tabs after hydration to keep the server render stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (requestedView && (config.tabs as readonly string[]).includes(requestedView)) setTab(requestedView)
  }, [config.tabs])
  const upcoming = useMemo(() => items.filter((item) => item.startTime && new Date(item.startTime).valueOf() >= loadedAt), [items, loadedAt])
  const visible = tab === 'Upcoming Sessions' || tab === 'Upcoming Class' ? upcoming : items
  const dbBlocked = state === 'database'

  async function join(id: string) {
    setJoinMessage('')
    try {
      const response = await fetch(`/api/student/classes/sessions/${encodeURIComponent(id)}/join`, { method: 'POST' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok || body.allowed === false) {
        const code = String((body?.error as Record<string, unknown> | undefined)?.code || body?.code || '')
        const missing = Array.isArray((body?.error as Record<string, unknown> | undefined)?.missing)
          ? ((body.error as Record<string, unknown>).missing as unknown[]).filter((value): value is string => typeof value === 'string')
          : []
        setJoinMessage(code === 'DATABASE_UNAVAILABLE'
          ? tr('بيانات الفصول غير متاحة حالياً.', 'Class records are unavailable right now.')
          : code === 'PROVIDER_UNAVAILABLE' || response.status === 502
            ? missing.length
              ? tr(`تعذر الانضمام لأن إعدادات QMeet التالية غير موجودة: ${missing.join('، ')}. أبلغ فريق Be Fluent.`, `Can't join because these QMeet settings are missing: ${missing.join(', ')}. Please contact Be Fluent.`)
              : tr('خدمة الاجتماعات المباشرة QMeet غير متاحة حالياً.', 'The QMeet live meeting service is currently unavailable.')
            : tr('الانضمام إلى هذه الجلسة غير متاح.', 'Joining is not available for this session.'))
        return
      }
      if (body.joinUrl) window.location.assign(body.joinUrl)
      else setJoinMessage(tr('الحصة جاهزة، لكن لم يصل رابط الانضمام.', 'This class is ready, but no join link was returned.'))
    } catch { setJoinMessage(tr('الانضمام غير متاح مؤقتاً. حاول مرة أخرى.', 'Joining is temporarily unavailable. Please try again.')) }
  }

  async function createQMeetLink(id: string) {
    setQmeetActionId(id)
    setQmeetActionMessage('')
    setQmeetActionLink('')
    try {
      const endpoint = role === 'admin'
        ? `/api/admin/classes/sessions/${encodeURIComponent(id)}/qmeet`
        : `/api/teacher/classes/sessions/${encodeURIComponent(id)}/qmeet`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        const error = body?.error
        setQmeetActionMessage(typeof error?.message === 'string'
          ? error.message
          : tr('تعذر إنشاء رابط QMeet.', 'Could not create a QMeet link.'))
        return
      }
      const meeting = body.meeting
      const link = typeof meeting?.hostUrl === 'string' ? meeting.hostUrl : meeting?.joinUrl
      if (typeof link === 'string') setQmeetActionLink(link)
      await load()
      setQmeetActionMessage(tr('تم إنشاء رابط QMeet.', 'QMeet link created.'))
    } catch {
      setQmeetActionMessage(tr('تعذر الاتصال بخدمة QMeet. حاول مرة أخرى.', 'Could not reach QMeet. Please try again.'))
    } finally {
      setQmeetActionId('')
    }
  }

  const statusLabel = (status: unknown) => {
    const value = String(status || 'Scheduled')
    const labels: Record<string, string> = { SCHEDULED: 'مجدولة', CREATED: 'تم الإنشاء', CANCELLED: 'ملغاة', FAILED: 'فشل' }
    return isArabic ? (labels[value.toUpperCase()] || value) : value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())
  }

  return <section dir={isArabic ? 'rtl' : 'ltr'} lang={language}>
    <div className={base.sectionNav} role="tablist" aria-label={tr('عرض الفصول', 'Class views')}>
      {config.tabs.map((item) => <button data-testid={`tab-${item.toLowerCase().replaceAll(' ', '-')}`} key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{tr(tabTranslations[item] || item, item)}</button>)}
    </div>
    {role === 'admin' && <AdminQMeetQuickStart onCreated={() => void load()} />}
    {role === 'admin' && <QMeetStatus />}
    {qmeetActionMessage && (role === 'admin' || role === 'teacher') && <div className={base.notice} role="status" data-testid="qmeet-action-status">
      {qmeetActionMessage}
      {qmeetActionLink && <> · <a href={qmeetActionLink} target="_blank" rel="noopener noreferrer">{tr('فتح اجتماع QMeet', 'Open QMeet')}</a></>}
    </div>}
    {state === 'loading' && <div className={base.grid} aria-live="polite" data-testid="state-loading">{[1, 2, 3].map((item) => <div className={base.skeleton} key={item} />)}</div>}
    {state === 'database' && <div className={`${base.notice} ${base.blocked}`} role="status" data-testid="state-database-unavailable"><strong>{tr('قاعدة البيانات غير متاحة', 'Database unavailable')}</strong><p>{message || tr('بيانات الفصول غير متاحة. ستظل عناصر التحكم متوقفة ولن تُحفظ تغييرات.', 'Class records are unavailable. Controls remain disabled; changes will not be saved.')}</p></div>}
    {state === 'provider' && <div className={base.notice} role="status" data-testid="state-provider-unavailable"><strong>{tr('خدمة الاجتماعات المباشرة QMeet غير متاحة حالياً.', 'The QMeet live meeting service is currently unavailable.')}</strong><p>{tr('تحقق من جاهزية QMeet أو تواصل مع فريق Be Fluent.', 'Check QMeet readiness or contact Be Fluent.')}</p><button className={base.button} data-testid="button-retry-provider" onClick={() => void load()}>{tr('إعادة المحاولة', 'Retry')}</button></div>}
    {state === 'error' && <div className={base.error} role="alert" data-testid="state-error">{message}<button className={base.button} data-testid="button-retry-classes" onClick={() => void load()}>{tr('إعادة المحاولة', 'Retry')}</button></div>}
    {(state === 'empty' || (state === 'ready' && visible.length === 0)) && <div className={base.empty} data-testid="state-empty"><strong>{tr('لا توجد جلسات لعرضها', 'No sessions to show')}</strong><br />{tr('ستظهر الجلسات هنا عند تعيين الفصول.', 'When classes are assigned, they will appear here.')}</div>}
    {state === 'ready' && visible.length > 0 && <div className={base.grid} data-testid="class-list">
      {visible.map((item) => <article className={base.card} key={item.id} data-testid={`class-card-${item.id}`}>
        <div className={base.eyebrow}>{statusLabel(item.status)}</div>
        <h2 data-testid={`class-title-${item.id}`}>{String(item.title || (isArabic ? item.group?.nameAr || item.group?.name : item.group?.name || item.group?.nameAr) || tr('حصة بدون عنوان', 'Untitled class'))}</h2>
        <p className={base.muted}>{formatDate(item.startTime, language)}{item.endTime ? ` · ${formatDate(item.endTime, language)}` : ''}</p>
        <p>{item.group ? `${tr('المجموعة', 'Group')} · ${isArabic ? item.group.nameAr || item.group.name || tr('مجموعة معينة', 'Assigned group') : item.group.name || item.group.nameAr || tr('مجموعة معينة', 'Assigned group')}` : tr('جلسة صفية', 'Class session')}{Array.isArray(item.participants) ? ` · ${item.participants.length} ${tr('مشاركاً', 'participants')}` : ''}</p>
        {role === 'admin' && <p className={base.muted}>{Array.isArray(item.attendances) ? `${item.attendances.length} ${tr('سجل حضور', 'attendance records')}` : tr('الحضور غير مسجل', 'Attendance not reported')}{item.qmeetMeeting ? ` · ${tr('حالة QMeet', 'QMeet status')}: ${statusLabel(item.qmeetMeeting.status)}` : ` · ${tr('غير مرتبط بـ QMeet', 'QMeet not linked')}`}</p>}
        {(role === 'admin' || role === 'teacher') && <div className={base.actions}>
          {item.qmeetMeeting?.status === 'CREATED' && (typeof item.qmeetMeeting.hostUrl === 'string' || typeof item.qmeetMeeting.joinUrl === 'string')
            ? <a className={base.button} href={typeof item.qmeetMeeting.hostUrl === 'string' ? item.qmeetMeeting.hostUrl : String(item.qmeetMeeting.joinUrl)} target="_blank" rel="noopener noreferrer">{tr('فتح اجتماع QMeet', 'Open QMeet')}</a>
            : <button className={base.button} disabled={Boolean(qmeetActionId) || dbBlocked} data-testid={`button-create-qmeet-${item.id}`} onClick={() => void createQMeetLink(item.id)}>
              {qmeetActionId === item.id ? tr('جارٍ إنشاء الرابط…', 'Creating link…') : tr('إنشاء رابط QMeet', 'Create QMeet link')}
            </button>}
        </div>}
        {role === 'student' && <div className={base.actions}><button className={base.button} disabled={dbBlocked} data-testid={`button-join-class-${item.id}`} onClick={() => void join(item.id)}>{tr('الانضمام إلى الحصة', 'Join class')}</button></div>}
      </article>)}
    </div>}
    {joinMessage && <div className={base.notice} role="status" data-testid="status-join">{joinMessage}</div>}
    {tab === 'QMeet' && role === 'teacher' && <div className={base.notice} data-testid="qmeet-info">{tr('يظهر رابط QMeet في الجلسة عند توفره من الخدمة.', 'QMeet links are shown on sessions when the provider returns one.')}</div>}
  </section>
}

function QMeetStatus() {
  const { language } = useTheme()
  const tr = useCallback((arabic: string, english: string) => localeText(language, arabic, english), [language])
  const [state, setState] = useState<LoadState>('loading')
  const [status, setStatus] = useState('')
  const [missing, setMissing] = useState<string[]>([])
  const [configured, setConfigured] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void fetch('/api/admin/classes/qmeet/status', { cache: 'no-store' }).then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) {
          const code = String(body?.error?.code || body?.code || '')
          if (active) setState(code === 'DATABASE_UNAVAILABLE' ? 'database' : code === 'PROVIDER_UNAVAILABLE' || response.status === 502 ? 'provider' : 'error')
          return
        }
        if (active) {
          const missingConfig = Array.isArray(body.missing) ? body.missing.filter((item: unknown): item is string => typeof item === 'string') : []
          setMissing(missingConfig)
          setConfigured(body.configured === true)
          setStatus(String(body.status || 'Status unavailable'))
          setState('ready')
        }
      }).catch(() => { if (active) setState('error') })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [retryKey])
  const retry = () => { setState('loading'); setRetryKey((key) => key + 1) }
  if (state === 'loading') return <div className={base.notice} aria-live="polite" data-testid="qmeet-loading">{tr('جارٍ التحقق من جاهزية QMeet…', 'Checking QMeet readiness…')}</div>
  if (state === 'database') return <div className={`${base.notice} ${base.blocked}`} role="status" data-testid="qmeet-database">{tr('قاعدة البيانات غير متاحة. تعذر التحقق من حالة QMeet.', 'Database unavailable. QMeet status cannot be confirmed.')} <button className={base.button} onClick={retry}>{tr('إعادة المحاولة', 'Retry')}</button></div>
  if (state === 'provider') return <div className={base.notice} role="status" data-testid="qmeet-provider"><strong>{tr('خدمة الاجتماعات المباشرة غير متاحة حالياً.', 'The live meeting service is currently unavailable.')}</strong> <button className={base.button} onClick={retry}>{tr('إعادة المحاولة', 'Retry')}</button></div>
  if (state === 'error') return <div className={base.error} role="alert" data-testid="qmeet-error">{tr('تعذر تحميل حالة QMeet.', 'QMeet status could not be loaded.')} <button className={base.button} onClick={retry}>{tr('إعادة المحاولة', 'Retry')}</button></div>
  return <div className={base.notice} data-testid="qmeet-status">
    <strong>{tr('جاهزية QMeet', 'QMeet readiness')}</strong>
    <p>{configured ? tr('مهيأ', 'Configured') : tr('غير مهيأ', 'Not configured')} · {status === 'AVAILABLE' ? tr('متاح', 'Available') : tr('يتطلب الإعداد', 'Setup required')}</p>
    {!configured && <p className={base.blocked} role="status">{tr('تعذر إنشاء رابط الاجتماع لأن الإعدادات التالية مفقودة:', 'Meeting links cannot be created because these settings are missing:')} {missing.length ? missing.join(', ') : 'QMEET_API_BASE_URL, QMEET_API_KEY'}. {tr('أضفها إلى بيئة التطبيق ثم أعد المحاولة.', 'Add them to the app environment, then retry.')}</p>}
  </div>
}