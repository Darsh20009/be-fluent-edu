'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import base from '@/app/phase4/phase4.module.css'

type Role = 'admin' | 'teacher' | 'student'
type Kind = 'feedback' | 'homework'
type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'database'
type Item = Record<string, unknown> & {
  id?: string | number
  title?: string
  name?: string
  status?: string
  state?: string
  createdAt?: string
  dueAt?: string
  sessionTitle?: string
  assignmentTitle?: string
  submissions?: Array<{ reviews?: unknown[] }>
  summary?: string
  publishedAt?: string
  session?: { title?: string; startTime?: string }
  expressions?: Array<{ expression?: string; meaning?: string | null; category?: string | null }>
  mistakes?: Array<{ original?: string; correction?: string; explanation?: string | null }>
  pronunciation?: Array<{ target?: string; guidance?: string | null; phonetic?: string | null }>
  ebi?: Array<{ betterExpression?: string; explanation?: string | null }>
}
type ApiEnvelope = { error?: { code?: string; message?: string }; code?: string; items?: Item[]; configured?: boolean; status?: string }

const config = {
  admin: {
    feedback: { endpoint: '/api/admin/feedback', title: 'Session Feedback', subtitle: 'A clear operating view for completed sessions and approved learning libraries.', tabs: ['Session Feedback', 'EBI Library', 'Mistake Library'] },
    homework: { endpoint: '/api/admin/homework', title: 'Homework', subtitle: 'Assignments, submissions, and review readiness in one place.', tabs: ['Assignments', 'Submissions', 'Reviews'] },
  },
  teacher: {
    feedback: { endpoint: '/api/teacher/feedback', title: 'Session Feedback', subtitle: 'Turn completed classes into thoughtful feedback, then share what is approved.', tabs: ['Completed sessions', 'EBI Library', 'Mistake Library'] },
    homework: { endpoint: '/api/teacher/homework', title: 'Homework', subtitle: 'Set focused work and keep review moving without losing context.', tabs: ['Assignments', 'Review queue'] },
  },
  student: {
    feedback: { endpoint: '/api/student/feedback', title: 'My feedback', subtitle: 'Published notes from your completed classes, ready to revisit.', tabs: ['Published feedback'] },
    homework: { endpoint: '/api/student/homework', title: 'My homework', subtitle: 'See what is assigned, what is submitted, and what your teacher reviewed.', tabs: ['Assigned work', 'My reviews'] },
  },
} as const

function unwrap(body: unknown): Item[] {
  if (Array.isArray(body)) return body as Item[]
  if (body && typeof body === 'object' && Array.isArray((body as { items?: unknown }).items)) return (body as { items: Item[] }).items
  return []
}
function label(item: Item) { return String(item.title || item.name || item.session?.title || item.sessionTitle || item.assignmentTitle || 'Learning record') }
function detail(item: Item) {
  const date = item.dueAt || item.publishedAt || item.session?.startTime || item.createdAt
  return [item.status || item.state, date ? new Date(String(date)).toLocaleDateString() : ''].filter(Boolean).join(' · ')
}

export default function LearningClient({ role, kind }: { role: Role; kind: Kind }) {
  const view = config[role][kind]
  const [tab, setTab] = useState<string>(view.tabs[0])
  const [items, setItems] = useState<Item[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [message, setMessage] = useState('')
  const [storage, setStorage] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading')
  const endpoint = useMemo(() => {
    if (kind !== 'feedback' || tab === String(view.tabs[0]) || role === 'student') return view.endpoint
    const prefix = role === 'admin' ? '/api/admin' : '/api/teacher'
    return tab === 'EBI Library' ? `${prefix}/ebi-library` : `${prefix}/mistake-library`
  }, [kind, role, tab, view.endpoint, view.tabs])
  const load = useCallback(async () => {
    setState('loading'); setMessage('')
    try {
      const response = await fetch(endpoint, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      const envelope = body as ApiEnvelope
      const code = String(envelope.error?.code || envelope.code || '')
      if (!response.ok) { setState(response.status === 503 && code === 'DATABASE_UNAVAILABLE' ? 'database' : 'error'); setMessage(String(envelope.error?.message || 'This learning service could not be reached.')); return }
      const next = unwrap(body); setItems(next); setState(next.length ? 'ready' : 'empty')
    } catch { setState('error'); setMessage('This learning service could not be reached. Please try again.') }
  }, [endpoint])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  useEffect(() => {
    if (kind !== 'homework') return
    fetch('/api/storage/status', { cache: 'no-store' }).then(async (r) => {
      const body = await r.json().catch(() => ({}))
       setStorage(r.ok && body.configured === true && body.status === 'AVAILABLE' ? 'ready' : 'unavailable')
    }).catch(() => setStorage('error'))
  }, [kind])
  const visible = useMemo(() => {
    if (kind !== 'homework' || tab === String(view.tabs[0])) return items
    if (tab === 'Submissions') return items.filter((item) => item.submissions?.length)
    if (tab === 'Reviews' || tab === 'My reviews') return items.filter((item) => item.submissions?.some((submission) => submission.reviews?.length))
    if (tab === 'Review queue') return items.filter((item) => item.submissions?.some((submission) => !submission.reviews?.length))
    return items
  }, [items, kind, tab, view.tabs])
  return <section>
    <div className={base.sectionNav} role="tablist" aria-label={`${kind} views`}>
      {view.tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} data-testid={`tab-${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setTab(item)}>{item}</button>)}
    </div>
    {kind === 'homework' && <div className={base.notice} data-testid="storage-status"><strong>File storage</strong><p>{storage === 'loading' ? 'Checking storage availability…' : storage === 'ready' ? 'Storage provider is available.' : storage === 'unavailable' ? 'Storage provider is unavailable. Uploads are not enabled.' : 'Storage status could not be confirmed.'}</p></div>}
    {state === 'loading' && <div className={base.grid} data-testid="state-loading" aria-live="polite">{[1, 2, 3].map((n) => <div className={base.skeleton} key={n} />)}</div>}
    {state === 'database' && <div className={`${base.notice} ${base.blocked}`} data-testid="state-database-unavailable"><strong>Database unavailable</strong><p>{message || 'Records cannot be loaded. Controls remain unavailable and nothing will be persisted.'}</p></div>}
    {state === 'error' && <div className={base.error} role="alert" data-testid="state-error">{message}<button className={base.button} data-testid="button-retry" onClick={() => void load()}>Retry</button></div>}
    {(state === 'empty' || (state === 'ready' && visible.length === 0)) && <div className={base.empty} data-testid="state-empty"><strong>Nothing here yet</strong><br />When records are available, they will appear in this view.</div>}
    {state === 'ready' && visible.length > 0 && <div className={base.grid} data-testid="learning-list">{visible.map((item, index) => <article className={base.card} key={String(item.id || index)} data-testid={`learning-card-${item.id || index}`}><div className={base.eyebrow}>{detail(item) || (kind === 'feedback' ? 'Feedback record' : 'Assignment')}</div><h2>{label(item)}</h2><p className={base.muted}>{String(item.summary || item.description || item.feedback || item.notes || 'Details are available when this record is opened.')}</p>{kind === 'feedback' && role === 'student' && <div data-testid={`feedback-content-${item.id || index}`}>{item.expressions?.map((entry, entryIndex) => <p key={`expression-${entryIndex}`}><strong>{entry.expression}</strong>{entry.meaning ? ` — ${entry.meaning}` : ''}</p>)}{item.mistakes?.map((entry, entryIndex) => <p key={`mistake-${entryIndex}`}><strong>{entry.original}</strong>{entry.correction ? ` → ${entry.correction}` : ''}</p>)}{item.pronunciation?.map((entry, entryIndex) => <p key={`pronunciation-${entryIndex}`}><strong>{entry.target}</strong>{entry.guidance ? ` — ${entry.guidance}` : ''}{entry.phonetic ? ` (${entry.phonetic})` : ''}</p>)}{item.ebi?.map((entry, entryIndex) => <p key={`ebi-${entryIndex}`}><strong>EBI:</strong> {entry.betterExpression}{entry.explanation ? ` — ${entry.explanation}` : ''}</p>)}</div>}</article>)}</div>}
  </section>
}