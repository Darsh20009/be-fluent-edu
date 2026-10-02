'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Clock3,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react'

type Participant = {
  userId?: string
  status?: string
  role?: string
  user?: { id?: string; name?: string | null; role?: string }
}
type Session = {
  id: string
  title?: string
  status?: string
  startTime?: string
  endTime?: string
  group?: { name?: string | null; nameAr?: string | null } | null
  participants?: Participant[]
}
type Expression = { expression: string; meaning: string; example: string; category: string }
type Mistake = { original: string; correction: string; explanation: string }
type Pronunciation = { target: string; actual: string; guidance: string; phonetic: string; teacherNote: string }
type Ebi = { betterExpression: string; explanation: string; priority: 'LOW' | 'NORMAL' | 'HIGH' }
type Draft = {
  summary: string
  teacherNotes: string
  expressions: Expression[]
  idioms: Expression[]
  mistakes: Mistake[]
  pronunciation: Pronunciation[]
  ebi: Ebi[]
}
type FeedbackRecord = {
  id: string
  sessionId: string
  studentId: string
  summary?: string | null
  teacherNotes?: string | null
  status: string
  updatedAt?: string
  expressions?: Array<Partial<Expression>>
  mistakes?: Array<Partial<Mistake>>
  pronunciation?: Array<Partial<Pronunciation>>
  ebi?: Array<Partial<Ebi>>
}
type StudentSession = { session: Session; studentId: string; studentName: string }
type RequestState = 'loading' | 'ready' | 'error'

const emptyDraft = (): Draft => ({
  summary: '',
  teacherNotes: '',
  expressions: [],
  idioms: [],
  mistakes: [],
  pronunciation: [],
  ebi: [],
})

function getItems<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === 'object' && Array.isArray((body as { items?: unknown }).items)) {
    return (body as { items: T[] }).items
  }
  return []
}

function makeKey(sessionId: string, studentId: string) {
  return `${sessionId}:${studentId}`
}

function formatDate(value: string | undefined, language: 'ar' | 'en') {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function statusText(status: string | undefined, language: 'ar' | 'en') {
  if (status === 'PUBLISHED') return localeText(language, 'منشور', 'Published')
  if (status === 'READY_TO_PUBLISH') return localeText(language, 'جاهز للمراجعة', 'Ready for review')
  if (status === 'DRAFT') return localeText(language, 'مسودة', 'Draft')
  return localeText(language, 'لم يبدأ', 'Not started')
}

function recordToDraft(record?: FeedbackRecord): Draft {
  if (!record) return emptyDraft()
  const allExpressions = (record.expressions || []).map((item) => ({
    expression: String(item.expression || ''),
    meaning: String(item.meaning || ''),
    example: String(item.example || ''),
    category: String(item.category || 'VOCABULARY'),
  }))
  return {
    summary: record.summary || '',
    teacherNotes: record.teacherNotes || '',
    expressions: allExpressions.filter((item) => item.category !== 'IDIOM'),
    idioms: allExpressions.filter((item) => item.category === 'IDIOM'),
    mistakes: (record.mistakes || []).map((item) => ({
      original: String(item.original || ''),
      correction: String(item.correction || ''),
      explanation: String(item.explanation || ''),
    })),
    pronunciation: (record.pronunciation || []).map((item) => ({
      target: String(item.target || ''),
      actual: String(item.actual || ''),
      guidance: String(item.guidance || ''),
      phonetic: String(item.phonetic || ''),
      teacherNote: String(item.teacherNote || ''),
    })),
    ebi: (record.ebi || []).map((item) => ({
      betterExpression: String(item.betterExpression || ''),
      explanation: String(item.explanation || ''),
      priority: item.priority === 'LOW' || item.priority === 'HIGH' ? item.priority : 'NORMAL',
    })),
  }
}

async function readRequest(url: string) {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    const body: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const envelope = body && typeof body === 'object' ? body as { error?: { message?: string }; message?: string } : undefined
      return { ok: false as const, message: envelope?.error?.message || envelope?.message || 'تعذر تحميل البيانات.' }
    }
    return { ok: true as const, body }
  } catch {
    return { ok: false as const, message: 'تعذر الاتصال بالخدمة. تحقق من الاتصال ثم أعد المحاولة.' }
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  disabled?: boolean
}) {
  const fieldClass = 'mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-60'
  return (
    <label className="block min-w-0 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
      {label}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={fieldClass}
          style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={fieldClass}
          style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
        />
      )}
    </label>
  )
}

function Section({
  title,
  note,
  count,
  onAdd,
  disabled,
  children,
}: {
  title: string
  note: string
  count: number
  onAdd: () => void
  disabled: boolean
  children: ReactNode
}) {
  const { language } = useTheme()
  return (
    <section className="rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{title}</h3>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums" style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}>{count}</span>
          </div>
          <p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>{note}</p>
        </div>
         {!disabled && <button type="button" onClick={onAdd} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-bold" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}><Plus size={15} aria-hidden="true" />{localeText(language, 'إضافة', 'Add')}</button>}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

function EmptyRows({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>{children}</p>
}

export default function TeacherFeedbackWorkspace() {
  const { language } = useTheme()
  const [sessions, setSessions] = useState<Session[]>([])
  const [records, setRecords] = useState<FeedbackRecord[]>([])
  const [sessionsState, setSessionsState] = useState<RequestState>('loading')
  const [recordsState, setRecordsState] = useState<RequestState>('loading')
  const [selectedKey, setSelectedKey] = useState('')
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const load = useCallback(async () => {
    setSessionsState('loading')
    setRecordsState('loading')
    const [sessionResult, feedbackResult] = await Promise.all([
      readRequest('/api/teacher/classes/sessions'),
      readRequest('/api/teacher/feedback'),
    ])
    if (sessionResult.ok) {
      setSessions(getItems<Session>(sessionResult.body))
      setSessionsState('ready')
    } else {
      setSessions([])
      setSessionsState('error')
    }
    if (feedbackResult.ok) {
      setRecords(getItems<FeedbackRecord>(feedbackResult.body))
      setRecordsState('ready')
    } else {
      setRecords([])
      setRecordsState('error')
    }
  }, [])

  useEffect(() => { void load() }, [load, retryKey])

  const sessionStudents = useMemo<StudentSession[]>(() => sessions
    .filter((session) => ['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'].includes(String(session.status || '').toUpperCase()))
    .flatMap((session) => (session.participants || [])
      .filter((participant) => participant.status !== 'CANCELLED' && participant.role !== 'TEACHER')
      .map((participant) => {
        const studentId = String(participant.userId || participant.user?.id || '')
        if (!studentId) return null
        return {
          session,
          studentId,
          studentName: participant.user?.name || localeText(language, 'طالب', 'Student'),
        }
      })
      .filter((item): item is StudentSession => Boolean(item)))
    .sort((left, right) => new Date(right.session.startTime || 0).valueOf() - new Date(left.session.startTime || 0).valueOf()), [language, sessions])

  useEffect(() => {
    if (!sessionStudents.length) return
    if (!selectedKey || !sessionStudents.some((item) => makeKey(item.session.id, item.studentId) === selectedKey)) {
      const first = sessionStudents[0]
      setSelectedKey(makeKey(first.session.id, first.studentId))
    }
  }, [sessionStudents, selectedKey])

  useEffect(() => {
    if (!selectedKey) return
    const record = records.find((item) => makeKey(item.sessionId, item.studentId) === selectedKey)
    setDraft(recordToDraft(record))
    setNotice(null)
  }, [selectedKey])

  const selected = sessionStudents.find((item) => makeKey(item.session.id, item.studentId) === selectedKey)
  const existing = records.find((item) => makeKey(item.sessionId, item.studentId) === selectedKey)
  const published = existing?.status === 'PUBLISHED'
  const filteredStudents = sessionStudents.filter((item) => {
    const text = `${item.studentName} ${item.session.title || ''} ${item.session.group?.nameAr || item.session.group?.name || ''}`.toLocaleLowerCase()
    return text.includes(search.trim().toLocaleLowerCase())
  })
  const isEducationalContentPresent = Boolean(
    draft.summary.trim() || draft.expressions.some((item) => item.expression.trim()) || draft.idioms.some((item) => item.expression.trim())
    || draft.mistakes.some((item) => item.original.trim() || item.correction.trim())
    || draft.pronunciation.some((item) => item.target.trim())
    || draft.ebi.some((item) => item.betterExpression.trim()),
  )

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const updateRow = <T extends object, K extends keyof Draft>(
    key: K,
    index: number,
    field: keyof T,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: (current[key] as T[]).map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  const deleteRow = <K extends keyof Draft>(key: K, index: number) => {
    setDraft((current) => ({ ...current, [key]: (current[key] as unknown[]).filter((_, itemIndex) => itemIndex !== index) }))
  }

  const saveBody = () => ({
    sessionId: selected?.session.id,
    studentId: selected?.studentId,
    summary: draft.summary.trim() || null,
    teacherNotes: draft.teacherNotes.trim() || null,
    expressions: [
      ...draft.expressions.filter((item) => item.expression.trim()).map((item) => ({
        expression: item.expression.trim(),
        meaning: item.meaning.trim() || null,
        example: item.example.trim() || null,
        category: item.category || 'VOCABULARY',
      })),
      ...draft.idioms.filter((item) => item.expression.trim()).map((item) => ({
        expression: item.expression.trim(),
        meaning: item.meaning.trim() || null,
        example: item.example.trim() || null,
        category: 'IDIOM',
      })),
    ],
    mistakes: draft.mistakes.filter((item) => item.original.trim() && item.correction.trim()).map((item) => ({
      original: item.original.trim(),
      correction: item.correction.trim(),
      explanation: item.explanation.trim() || null,
    })),
    pronunciation: draft.pronunciation.filter((item) => item.target.trim() && item.guidance.trim()).map((item) => ({
      target: item.target.trim(),
      actual: item.actual.trim() || null,
      guidance: item.guidance.trim(),
      phonetic: item.phonetic.trim() || null,
      teacherNote: item.teacherNote.trim() || null,
    })),
    ebi: draft.ebi.filter((item) => item.betterExpression.trim()).map((item) => ({
      betterExpression: item.betterExpression.trim(),
      explanation: item.explanation.trim() || null,
      priority: item.priority,
    })),
  })

  const transition = async (id: string, status: 'DRAFT' | 'READY_TO_PUBLISH' | 'PUBLISHED') => {
    const response = await fetch(`/api/teacher/feedback/${encodeURIComponent(id)}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      const envelope = body && typeof body === 'object' ? body as { error?: { message?: string } } : undefined
      throw new Error(envelope?.error?.message || localeText(language, `تعذر تحديث حالة الملاحظة (${response.status}).`, `Could not update feedback status (${response.status}).`))
    }
    return body as Partial<FeedbackRecord>
  }

  const saveUpsert = async () => {
    if (!selected) throw new Error(localeText(language, 'اختر حصة وطالباً أولاً.', 'Choose a session and student first.'))
    const response = await fetch('/api/teacher/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveBody()),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      const envelope = body && typeof body === 'object' ? body as { error?: { message?: string } } : undefined
      throw new Error(envelope?.error?.message || localeText(language, `تعذر حفظ الملاحظة (${response.status}).`, `Could not save feedback (${response.status}).`))
    }
    return body as FeedbackRecord
  }

  const replaceRecord = (record: FeedbackRecord) => {
    setRecords((current) => {
      const index = current.findIndex((item) => item.id === record.id || makeKey(item.sessionId, item.studentId) === makeKey(record.sessionId, record.studentId))
      if (index < 0) return [record, ...current]
      return current.map((item, itemIndex) => itemIndex === index ? { ...item, ...record } : item)
    })
  }

  const saveDraft = async () => {
    if (!selected || published) return
    setBusy(true)
    setNotice(null)
    try {
      if (existing?.status === 'READY_TO_PUBLISH') await transition(existing.id, 'DRAFT')
      const saved = await saveUpsert()
      const local = { ...saved, status: 'DRAFT' }
      replaceRecord(local)
      setNotice({ kind: 'success', text: localeText(language, 'حُفظت المسودة.', 'Draft saved.') })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : localeText(language, 'تعذر حفظ المسودة.', 'Could not save the draft.') })
    } finally {
      setBusy(false)
    }
  }

  const prepareToPublish = async () => {
    if (!selected || published) return
    if (!isEducationalContentPresent) {
      setNotice({ kind: 'error', text: localeText(language, 'أضف ملاحظة تعليمية واحدة على الأقل قبل الإرسال للمراجعة.', 'Add at least one learning note before submitting for review.') })
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      if (existing?.status === 'READY_TO_PUBLISH') await transition(existing.id, 'DRAFT')
      const saved = await saveUpsert()
      const ready = await transition(saved.id, 'READY_TO_PUBLISH')
      const next = { ...saved, ...ready, status: 'READY_TO_PUBLISH' }
      replaceRecord(next as FeedbackRecord)
      setNotice({ kind: 'success', text: localeText(language, 'أُرسلت الملاحظة للمراجعة قبل النشر.', 'Feedback submitted for review before publishing.') })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : localeText(language, 'تعذر تجهيز الملاحظة للنشر.', 'Could not prepare feedback for publishing.') })
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    if (!existing || existing.status !== 'READY_TO_PUBLISH') return
    if (!window.confirm(localeText(language, 'هل تريد نشر هذه الملاحظة للطالب؟', 'Publish this feedback for the student?'))) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await transition(existing.id, 'PUBLISHED')
      replaceRecord({ ...existing, ...result, status: 'PUBLISHED' })
      setNotice({ kind: 'success', text: localeText(language, 'نُشرت الملاحظة للطالب.', 'Feedback published for the student.') })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : localeText(language, 'تعذر نشر الملاحظة.', 'Could not publish feedback.') })
    } finally {
      setBusy(false)
    }
  }

  const editorUnavailable = published || !selected || recordsState !== 'ready'
  const cardStyle = { background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }

  return (
    <div className="space-y-5" dir={localeDirection(language)}>
      <section className="grid gap-4 xl:grid-cols-[minmax(280px,.78fr)_minmax(0,1.22fr)]">
        <aside className="overflow-hidden rounded-2xl border" style={cardStyle}>
          <div className="border-b p-4 sm:p-5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{localeText(language, 'الحصص المكتملة', 'Completed sessions')}</h2>
                <p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>{localeText(language, 'اختر طالباً لكتابة ملاحظته التعليمية.', 'Choose a student to write their learning feedback.')}</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold tabular-nums" style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}>{sessionStudents.length}</span>
            </div>
            <label className="mt-4 block">
               <span className="sr-only">{localeText(language, 'ابحث عن طالب أو حصة', 'Search students or sessions')}</span>
               <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={localeText(language, 'ابحث عن طالب أو حصة', 'Search students or sessions')} className="min-h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }} />
            </label>
          </div>
          <div className="max-h-[620px] space-y-1 overflow-y-auto p-2">
            {sessionsState === 'loading' && <div className="space-y-2 p-2" aria-busy="true">{[0, 1, 2].map((item) => <div key={item} className="h-[82px] animate-pulse rounded-xl" style={{ background: 'var(--surface-muted)' }} />)}</div>}
            {sessionsState === 'error' && <div className="p-4 text-sm leading-6" role="alert" style={{ color: 'var(--muted)' }}>{localeText(language, 'تعذر تحميل الحصص.', 'Could not load sessions.')} <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="font-bold underline" style={{ color: 'var(--primary)' }}>{localeText(language, 'إعادة المحاولة', 'Retry')}</button></div>}
            {sessionsState === 'ready' && filteredStudents.length === 0 && (
              <div className="p-6 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}><CheckCircle2 size={19} aria-hidden="true" /></span>
                <p className="mt-3 text-sm font-bold">{sessionStudents.length ? localeText(language, 'لا توجد نتائج مطابقة', 'No matching results') : localeText(language, 'لا توجد حصة مكتملة', 'No completed sessions')}</p>
                <p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>{sessionStudents.length ? localeText(language, 'جرّب اسماً أو عنواناً آخر.', 'Try another name or title.') : localeText(language, 'ستظهر هنا الحصص المؤهلة بعد انتهائها.', 'Eligible sessions will appear here when they end.')}</p>
                {!sessionStudents.length && <Link href="/dashboard/teacher/classes" className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-bold" style={{ color: 'var(--primary)' }}>{localeText(language, 'إدارة الحصص', 'Manage sessions')} <ArrowLeft size={14} aria-hidden="true" /></Link>}
              </div>
            )}
            {filteredStudents.map((item) => {
              const key = makeKey(item.session.id, item.studentId)
              const record = records.find((entry) => makeKey(entry.sessionId, entry.studentId) === key)
              const active = key === selectedKey
              return (
                <button key={key} type="button" onClick={() => setSelectedKey(key)} aria-pressed={active} className="w-full rounded-xl border p-3 text-start transition-colors" style={{ background: active ? 'var(--bf-green-soft)' : 'transparent', color: 'var(--foreground)', borderColor: active ? 'var(--primary)' : 'transparent' }}>
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.studentName}</span>
                       <span className="mt-1 block truncate text-xs" style={{ color: 'var(--muted)' }}>{item.session.title || localeText(language, 'حصة تعليمية', 'Class session')}</span>
                    </span>
                     <span className="mt-0.5 shrink-0 text-[10px] font-semibold" style={{ color: record?.status === 'PUBLISHED' ? 'var(--primary)' : 'var(--muted)' }}>{statusText(record?.status, language)}</span>
                  </span>
                     <span className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}><Clock3 size={13} aria-hidden="true" />{formatDate(item.session.startTime, language)}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border" style={cardStyle}>
          {!selected ? (
            <div className="grid min-h-[420px] place-items-center p-6 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}><BookOpen size={22} aria-hidden="true" /></span>
                 <h2 className="mt-4 font-bold">{localeText(language, 'اختر حصة من القائمة', 'Choose a session from the list')}</h2>
                 <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{localeText(language, 'ستظهر تفاصيل الطالب ومحرر الملاحظات هنا.', 'Student details and the feedback editor will appear here.')}</p>
              </div>
            </div>
          ) : (
            <>
              <header className="border-b p-4 sm:p-6" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                     <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{localeText(language, 'ملاحظة الحصة', 'Session feedback')}</p>
                    <h2 className="mt-1 truncate text-xl font-bold">{selected.studentName}</h2>
                     <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{selected.session.title || localeText(language, 'حصة تعليمية', 'Class session')}{selected.session.group?.nameAr || selected.session.group?.name ? ` · ${selected.session.group.nameAr || selected.session.group.name}` : ''}</p>
                     <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{formatDate(selected.session.startTime, language)}</p>
                  </div>
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-bold" style={{ background: existing?.status === 'PUBLISHED' ? 'var(--bf-green-soft)' : 'var(--surface-muted)', color: existing?.status === 'PUBLISHED' ? 'var(--primary)' : 'var(--muted)' }}>
                    {existing?.status === 'PUBLISHED' ? <CheckCircle2 size={15} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
                     {statusText(existing?.status, language)}
                  </span>
                </div>
              </header>

              <div className="space-y-4 p-4 sm:p-6">
                {recordsState === 'error' && <p role="alert" className="rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>{localeText(language, 'تعذر تحميل الملاحظات المحفوظة. لن نستبدلها بمحتوى غير مؤكد.', 'Saved feedback could not be loaded. It will not be replaced with unverified content.')} <button type="button" className="font-bold underline" style={{ color: 'var(--primary)' }} onClick={() => setRetryKey((key) => key + 1)}>{localeText(language, 'إعادة المحاولة', 'Retry')}</button></p>}
                {recordsState === 'loading' && <p className="rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>{localeText(language, 'جارٍ تحميل الملاحظات المحفوظة…', 'Loading saved feedback…')}</p>}
                {published && <p className="rounded-xl border px-4 py-3 text-sm leading-6" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)', color: 'var(--muted)' }}>{localeText(language, 'هذه الملاحظة منشورة ولا تسمح حالتها الحالية بالتعديل.', 'This feedback is published and cannot be edited in its current state.')}</p>}
                {notice && <p role={notice.kind === 'error' ? 'alert' : 'status'} className="rounded-xl border px-4 py-3 text-sm leading-6" style={{ borderColor: 'var(--border)', background: notice.kind === 'error' ? 'var(--surface-muted)' : 'var(--bf-green-soft)', color: notice.kind === 'error' ? 'var(--muted)' : 'var(--primary)' }}>{notice.text}</p>}
                <section className="rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}><Check size={16} aria-hidden="true" /></span>
                    <div>
                       <h3 className="text-sm font-bold">{localeText(language, 'ملخص الحصة', 'Session summary')}</h3>
                       <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{localeText(language, 'ملاحظة موجزة تساعد الطالب على معرفة ما أتقنه.', 'A brief note to help the student understand what they have mastered.')}</p>
                    </div>
                  </div>
                   <Field label={localeText(language, 'ملخص تعليمي', 'Learning summary')} value={draft.summary} onChange={(value) => setField('summary', value)} placeholder={localeText(language, 'اكتب ملاحظة عملية ومحددة...', 'Write a practical, specific note...')} multiline rows={4} disabled={editorUnavailable} />
                </section>

                <Section title={localeText(language, 'مفردات وتعبيرات', 'Vocabulary and expressions')} note={localeText(language, 'عبارات جديدة ومعناها ومثال على استخدامها.', 'New expressions, their meanings, and an example of how to use them.')} count={draft.expressions.length} disabled={editorUnavailable} onAdd={() => setField('expressions', [...draft.expressions, { expression: '', meaning: '', example: '', category: 'VOCABULARY' }])}>
                  {draft.expressions.map((item, index) => <div key={`expression-${index}`} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                     <div className="mb-2 flex justify-end"><button type="button" disabled={editorUnavailable} onClick={() => deleteRow('expressions', index)} className="grid h-9 w-9 place-items-center rounded-lg" aria-label={localeText(language, 'حذف التعبير', 'Delete expression')} style={{ color: 'var(--muted)' }}><Trash2 size={15} aria-hidden="true" /></button></div>
                     <div className="grid gap-3 sm:grid-cols-2">
                       <Field label={localeText(language, 'التعبير', 'Expression')} value={item.expression} onChange={(value) => updateRow<Expression, 'expressions'>('expressions', index, 'expression', value)} disabled={editorUnavailable} />
                        <label className="block text-xs font-semibold" style={{ color: 'var(--muted)' }}>{localeText(language, 'نوع التعبير', 'Expression type')}
                          <select aria-label={localeText(language, 'نوع التعبير', 'Expression type')} value={item.category || 'VOCABULARY'} onChange={(event) => updateRow<Expression, 'expressions'>('expressions', index, 'category', event.target.value)} disabled={editorUnavailable} className="mt-1.5 min-h-11 w-full rounded-xl border px-3 text-sm" style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                            <option value="VOCABULARY">{localeText(language, 'مفردات', 'Vocabulary')}</option>
                            <option value="IDIOM">{localeText(language, 'تعبير اصطلاحي', 'Idiom')}</option>
                            <option value="SLANG">{localeText(language, 'تعبير دارج', 'Slang')}</option>
                            <option value="CHUNK">{localeText(language, 'تركيب جاهز', 'Useful chunk')}</option>
                          </select>
                        </label>
                       <Field label={localeText(language, 'المعنى', 'Meaning')} value={item.meaning} onChange={(value) => updateRow<Expression, 'expressions'>('expressions', index, 'meaning', value)} disabled={editorUnavailable} />
                       <div className="sm:col-span-2"><Field label={localeText(language, 'مثال', 'Example')} value={item.example} onChange={(value) => updateRow<Expression, 'expressions'>('expressions', index, 'example', value)} disabled={editorUnavailable} /></div>
                    </div>
                  </div>)}
                   {!draft.expressions.length && <EmptyRows>{localeText(language, 'لم تُضف مفردات بعد.', 'No vocabulary has been added yet.')}</EmptyRows>}
                </Section>

                <Section title={localeText(language, 'تعابير اصطلاحية', 'Idioms')} note={localeText(language, 'تُحفظ ضمن مكتبة التعبيرات مع تصنيفها كتعابير اصطلاحية.', 'Saved in the expression library as idioms.')} count={draft.idioms.length} disabled={editorUnavailable} onAdd={() => setField('idioms', [...draft.idioms, { expression: '', meaning: '', example: '', category: 'IDIOM' }])}>
                  {draft.idioms.map((item, index) => <div key={`idiom-${index}`} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                       <div className="mb-2 flex justify-end"><button type="button" disabled={editorUnavailable} onClick={() => deleteRow('idioms', index)} className="grid h-9 w-9 place-items-center rounded-lg" aria-label={localeText(language, 'حذف التعبير الاصطلاحي', 'Delete idiom')} style={{ color: 'var(--muted)' }}><Trash2 size={15} aria-hidden="true" /></button></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                       <Field label={localeText(language, 'التعبير', 'Expression')} value={item.expression} onChange={(value) => updateRow<Expression, 'idioms'>('idioms', index, 'expression', value)} disabled={editorUnavailable} />
                       <Field label={localeText(language, 'المعنى', 'Meaning')} value={item.meaning} onChange={(value) => updateRow<Expression, 'idioms'>('idioms', index, 'meaning', value)} disabled={editorUnavailable} />
                       <div className="sm:col-span-2"><Field label={localeText(language, 'مثال', 'Example')} value={item.example} onChange={(value) => updateRow<Expression, 'idioms'>('idioms', index, 'example', value)} disabled={editorUnavailable} /></div>
                    </div>
                  </div>)}
                   {!draft.idioms.length && <EmptyRows>{localeText(language, 'لم تُضف تعابير اصطلاحية بعد.', 'No idioms have been added yet.')}</EmptyRows>}
                </Section>

                <Section title={localeText(language, 'تصحيحات لغوية', 'Language corrections')} note={localeText(language, 'اعرض العبارة الأصلية والتصحيح مع توضيح مختصر.', 'Show the original phrase, its correction, and a brief explanation.')} count={draft.mistakes.length} disabled={editorUnavailable} onAdd={() => setField('mistakes', [...draft.mistakes, { original: '', correction: '', explanation: '' }])}>
                  {draft.mistakes.map((item, index) => <div key={`mistake-${index}`} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                     <div className="mb-2 flex justify-end"><button type="button" disabled={editorUnavailable} onClick={() => deleteRow('mistakes', index)} className="grid h-9 w-9 place-items-center rounded-lg" aria-label={localeText(language, 'حذف التصحيح', 'Delete correction')} style={{ color: 'var(--muted)' }}><Trash2 size={15} aria-hidden="true" /></button></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                       <Field label={localeText(language, 'ما قيل', 'Original phrase')} value={item.original} onChange={(value) => updateRow<Mistake, 'mistakes'>('mistakes', index, 'original', value)} disabled={editorUnavailable} />
                       <Field label={localeText(language, 'التصحيح', 'Correction')} value={item.correction} onChange={(value) => updateRow<Mistake, 'mistakes'>('mistakes', index, 'correction', value)} disabled={editorUnavailable} />
                       <div className="sm:col-span-2"><Field label={localeText(language, 'التوضيح', 'Explanation')} value={item.explanation} onChange={(value) => updateRow<Mistake, 'mistakes'>('mistakes', index, 'explanation', value)} disabled={editorUnavailable} /></div>
                    </div>
                  </div>)}
                   {!draft.mistakes.length && <EmptyRows>{localeText(language, 'لم تُضف تصحيحات بعد.', 'No corrections have been added yet.')}</EmptyRows>}
                </Section>

                <Section title={localeText(language, 'النطق', 'Pronunciation')} note={localeText(language, 'وجّه الطالب إلى الصوت أو النبرة أو طريقة النطق المطلوبة.', 'Guide the student on the target sound, intonation, or pronunciation.')} count={draft.pronunciation.length} disabled={editorUnavailable} onAdd={() => setField('pronunciation', [...draft.pronunciation, { target: '', actual: '', guidance: '', phonetic: '', teacherNote: '' }])}>
                  {draft.pronunciation.map((item, index) => <div key={`pronunciation-${index}`} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                     <div className="mb-2 flex justify-end"><button type="button" disabled={editorUnavailable} onClick={() => deleteRow('pronunciation', index)} className="grid h-9 w-9 place-items-center rounded-lg" aria-label={localeText(language, 'حذف ملاحظة النطق', 'Delete pronunciation note')} style={{ color: 'var(--muted)' }}><Trash2 size={15} aria-hidden="true" /></button></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                       <Field label={localeText(language, 'الصوت أو الكلمة المستهدفة', 'Target sound or word')} value={item.target} onChange={(value) => updateRow<Pronunciation, 'pronunciation'>('pronunciation', index, 'target', value)} disabled={editorUnavailable} />
                       <Field label={localeText(language, 'ما نُطق فعلياً', 'What was actually pronounced')} value={item.actual} onChange={(value) => updateRow<Pronunciation, 'pronunciation'>('pronunciation', index, 'actual', value)} disabled={editorUnavailable} />
                        <Field label={localeText(language, 'طريقة النطق الصحيحة', 'Correct pronunciation guidance')} value={item.guidance} onChange={(value) => updateRow<Pronunciation, 'pronunciation'>('pronunciation', index, 'guidance', value)} placeholder={localeText(language, 'اشرح موضع اللسان أو الصوت أو النبرة المطلوبة...', 'Describe the target sound, mouth position, or intonation...')} disabled={editorUnavailable} />
                        <Field label={localeText(language, 'التهجئة الصوتية (اختياري)', 'Phonetic spelling (optional)')} value={item.phonetic} onChange={(value) => updateRow<Pronunciation, 'pronunciation'>('pronunciation', index, 'phonetic', value)} placeholder={localeText(language, 'مثال: /θ/ أو /ð/', 'Example: /θ/ or /ð/')} disabled={editorUnavailable} />
                        <div className="sm:col-span-2"><Field label={localeText(language, 'ملاحظة نطق للطالب', 'Pronunciation note for the student')} value={item.teacherNote} onChange={(value) => updateRow<Pronunciation, 'pronunciation'>('pronunciation', index, 'teacherNote', value)} disabled={editorUnavailable} /></div>
                    </div>
                  </div>)}
                   {!draft.pronunciation.length && <EmptyRows>{localeText(language, 'لم تُضف ملاحظات نطق بعد.', 'No pronunciation notes have been added yet.')}</EmptyRows>}
                </Section>

                <Section title={localeText(language, 'ما يمكن تحسينه', 'Areas to improve')} note={localeText(language, 'اقتراح تعبير بديل مع شرح يساعد على تطوير الصياغة.', 'Suggest an alternative expression and explain how it improves the phrasing.')} count={draft.ebi.length} disabled={editorUnavailable} onAdd={() => setField('ebi', [...draft.ebi, { betterExpression: '', explanation: '', priority: 'NORMAL' }])}>
                  {draft.ebi.map((item, index) => <div key={`ebi-${index}`} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                     <div className="mb-2 flex justify-end"><button type="button" disabled={editorUnavailable} onClick={() => deleteRow('ebi', index)} className="grid h-9 w-9 place-items-center rounded-lg" aria-label={localeText(language, 'حذف اقتراح التحسين', 'Delete improvement suggestion')} style={{ color: 'var(--muted)' }}><Trash2 size={15} aria-hidden="true" /></button></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                       <Field label={localeText(language, 'التعبير الأفضل', 'Improved expression')} value={item.betterExpression} onChange={(value) => updateRow<Ebi, 'ebi'>('ebi', index, 'betterExpression', value)} disabled={editorUnavailable} />
                       <label className="block text-xs font-semibold" style={{ color: 'var(--muted)' }}>{localeText(language, 'الأولوية', 'Priority')}
                        <select value={item.priority} onChange={(event) => setDraft((current) => ({ ...current, ebi: current.ebi.map((row, rowIndex) => rowIndex === index ? { ...row, priority: event.target.value as Ebi['priority'] } : row) }))} disabled={editorUnavailable} className="mt-1.5 min-h-11 w-full rounded-xl border px-3 text-sm" style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                           <option value="LOW">{localeText(language, 'عادية', 'Low')}</option><option value="NORMAL">{localeText(language, 'متوسطة', 'Medium')}</option><option value="HIGH">{localeText(language, 'مهمة', 'High')}</option>
                        </select>
                      </label>
                       <div className="sm:col-span-2"><Field label={localeText(language, 'الشرح', 'Explanation')} value={item.explanation} onChange={(value) => updateRow<Ebi, 'ebi'>('ebi', index, 'explanation', value)} disabled={editorUnavailable} /></div>
                    </div>
                  </div>)}
                   {!draft.ebi.length && <EmptyRows>{localeText(language, 'لم تُضف اقتراحات تحسين بعد.', 'No improvement suggestions have been added yet.')}</EmptyRows>}
                </Section>

                <section className="rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                   <h3 className="font-bold">{localeText(language, 'ملاحظة خاصة للمدرس', 'Private teacher note')}</h3>
                   <p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>{localeText(language, 'تبقى هذه الملاحظة ضمن سجل المدرس ولا تظهر للطالب.', 'This note stays in the teacher record and is not shown to the student.')}</p>
                   <Field label={localeText(language, 'ملاحظات داخلية', 'Internal notes')} value={draft.teacherNotes} onChange={(value) => setField('teacherNotes', value)} placeholder={localeText(language, 'ملاحظات للمتابعة لاحقاً...', 'Notes for later follow-up...')} multiline rows={3} disabled={editorUnavailable} />
                </section>

                <div className="sticky bottom-2 z-10 rounded-2xl border p-3 shadow-sm sm:p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <button type="button" onClick={() => void saveDraft()} disabled={busy || editorUnavailable} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold disabled:opacity-50" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <Save size={16} aria-hidden="true" />{busy ? localeText(language, 'جارٍ الحفظ…', 'Saving…') : localeText(language, 'حفظ المسودة', 'Save draft')}
                    </button>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={() => void prepareToPublish()} disabled={busy || editorUnavailable} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
                        <CheckCircle2 size={16} aria-hidden="true" />{localeText(language, 'إرسال للمراجعة', 'Submit for review')}
                      </button>
                      <button type="button" onClick={() => void publish()} disabled={busy || existing?.status !== 'READY_TO_PUBLISH'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold disabled:opacity-50" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        <Send size={15} aria-hidden="true" />{localeText(language, 'نشر للطالب', 'Publish to student')}
                      </button>
                    </div>
                  </div>
                  {existing?.status === 'READY_TO_PUBLISH' && <p className="mt-2 text-center text-[11px]" style={{ color: 'var(--muted)' }}>{localeText(language, 'الملاحظة جاهزة. راجع محتواها ثم انشرها للطالب.', 'Feedback is ready. Review it, then publish it for the student.')}</p>}
                </div>
              </div>
            </>
          )}
        </section>
      </section>
    </div>
  )
}