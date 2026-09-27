'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import base from '@/app/phase4/phase4.module.css'

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
  admin: { title: 'Classes operations', subtitle: 'A focused view of sessions, schedules, and live-room readiness.', endpoint: '/api/admin/classes/sessions', tabs: ['Classes', 'Sessions', 'Schedule', 'QMeet'] },
  teacher: { title: 'My classes', subtitle: 'Keep the next teaching moments visible and ready.', endpoint: '/api/teacher/classes/sessions', tabs: ['My Classes', 'Upcoming Sessions', 'Session Details', 'QMeet', 'Attendance'] },
  student: { title: 'My classes', subtitle: 'Your next class, details, and joining access in one calm view.', endpoint: '/api/student/classes', tabs: ['My Classes', 'Upcoming Class', 'Class Details', 'Join Class'] },
} as const

function formatDate(value?: string) {
  if (!value) return 'Time to be confirmed'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function getErrorState(response: Response, body: Record<string, unknown>) {
  const code = String((body.error as Record<string, unknown> | undefined)?.code || body.code || '')
  if (response.status === 503 && code === 'DATABASE_UNAVAILABLE') return 'database' as const
  if (code === 'PROVIDER_UNAVAILABLE' || response.status === 502) return 'provider' as const
  return 'error' as const
}

export default function ClassesClient({ role }: { role: Role }) {
  const config = copy[role]
  const [tab, setTab] = useState<string>(config.tabs[0])
  const [items, setItems] = useState<Session[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [message, setMessage] = useState('')
  const [joinMessage, setJoinMessage] = useState('')
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
          ? 'Class records are unavailable right now.'
          : errorState === 'provider'
            ? 'Live meeting service is currently unavailable.'
            : 'Class information could not be loaded. Please try again.')
        return
      }
      const next = Array.isArray(body) ? body : body.items
      setItems(Array.isArray(next) ? next : [])
      setLoadedAt(Date.now())
      setState(Array.isArray(next) && next.length ? 'ready' : 'empty')
    } catch { setItems([]); setState('error'); setMessage('Class information could not be loaded. Please try again.') }
  }, [config.endpoint])

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
        setJoinMessage(code === 'DATABASE_UNAVAILABLE'
          ? 'Class records are unavailable right now.'
          : code === 'PROVIDER_UNAVAILABLE' || response.status === 502
            ? 'Live meeting service is currently unavailable.'
            : 'Joining is not available for this session.')
        return
      }
      if (body.joinUrl) window.location.assign(body.joinUrl)
      else setJoinMessage('This class is ready, but no join link was returned.')
    } catch { setJoinMessage('Joining is temporarily unavailable. Please try again.') }
  }

  return <section>
    <div className={base.sectionNav} role="tablist" aria-label="Class views">
      {config.tabs.map((item) => <button data-testid={`tab-${item.toLowerCase().replaceAll(' ', '-')}`} key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}
    </div>
    {state === 'loading' && <div className={base.grid} aria-live="polite" data-testid="state-loading">{[1, 2, 3].map((item) => <div className={base.skeleton} key={item} />)}</div>}
    {state === 'database' && <div className={`${base.notice} ${base.blocked}`} role="status" data-testid="state-database-unavailable"><strong>Database unavailable</strong><p>{message || 'Class records are unavailable. Controls remain disabled; no persistence is claimed.'}</p></div>}
    {state === 'provider' && <div className={base.notice} role="status" data-testid="state-provider-unavailable"><strong>Live meeting service is currently unavailable.</strong><p>Please try again later.</p><button className={base.button} data-testid="button-retry-provider" onClick={() => void load()}>Retry</button></div>}
    {state === 'error' && <div className={base.error} role="alert" data-testid="state-error">{message}<button className={base.button} data-testid="button-retry-classes" onClick={() => void load()}>Retry</button></div>}
    {(state === 'empty' || (state === 'ready' && visible.length === 0)) && <div className={base.empty} data-testid="state-empty"><strong>No sessions to show</strong><br />When classes are assigned, they will appear here.</div>}
    {state === 'ready' && visible.length > 0 && <div className={base.grid} data-testid="class-list">
      {visible.map((item) => <article className={base.card} key={item.id} data-testid={`class-card-${item.id}`}>
        <div className={base.eyebrow}>{String(item.status || 'Scheduled')}</div>
        <h2 data-testid={`class-title-${item.id}`}>{String(item.title || item.group?.name || item.group?.nameAr || 'Untitled class')}</h2>
        <p className={base.muted}>{formatDate(item.startTime)}{item.endTime ? ` · ${formatDate(item.endTime)}` : ''}</p>
        <p>{item.group ? `Group · ${item.group.name || item.group.nameAr || 'Assigned group'}` : 'Class session'}{Array.isArray(item.participants) ? ` · ${item.participants.length} participants` : ''}</p>
        {role === 'admin' && <p className={base.muted}>{Array.isArray(item.attendances) ? `${item.attendances.length} attendance records` : 'Attendance not reported'}{item.qmeetMeeting ? ' · QMeet linked' : ' · QMeet not linked'}</p>}
        {role === 'student' && <div className={base.actions}><button className={base.button} disabled={dbBlocked} data-testid={`button-join-class-${item.id}`} onClick={() => void join(item.id)}>Join class</button></div>}
      </article>)}
    </div>}
    {joinMessage && <div className={base.notice} role="status" data-testid="status-join">{joinMessage}</div>}
    {tab === 'QMeet' && role === 'admin' && <QMeetStatus />}
    {tab === 'QMeet' && role === 'teacher' && <div className={base.notice} data-testid="qmeet-info">QMeet links are shown on sessions when the provider returns one.</div>}
  </section>
}

function QMeetStatus() {
  const [state, setState] = useState<LoadState>('loading')
  const [status, setStatus] = useState('')
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
          setStatus(`${body.configured ? 'Configured' : 'Not configured'} · ${body.status || 'Status unavailable'}`)
          setState('ready')
        }
      }).catch(() => { if (active) setState('error') })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [retryKey])
  const retry = () => { setState('loading'); setRetryKey((key) => key + 1) }
  if (state === 'loading') return <div className={base.notice} aria-live="polite" data-testid="qmeet-loading">Checking QMeet readiness…</div>
  if (state === 'database') return <div className={`${base.notice} ${base.blocked}`} role="status" data-testid="qmeet-database">Database unavailable. QMeet status cannot be confirmed. <button className={base.button} onClick={retry}>Retry</button></div>
  if (state === 'provider') return <div className={base.notice} role="status" data-testid="qmeet-provider"><strong>Live meeting service is currently unavailable.</strong> <button className={base.button} onClick={retry}>Retry</button></div>
  if (state === 'error') return <div className={base.error} role="alert" data-testid="qmeet-error">QMeet status could not be loaded. <button className={base.button} onClick={retry}>Retry</button></div>
  return <div className={base.notice} data-testid="qmeet-status"><strong>QMeet readiness</strong><p>{status}</p></div>
}