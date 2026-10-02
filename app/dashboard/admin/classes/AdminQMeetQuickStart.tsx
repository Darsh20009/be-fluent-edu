'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

type GroupMember = {
  userId?: string
  user?: { id?: string; name?: string | null; email?: string | null } | null
}

type ActiveGroup = {
  id: string
  name?: string | null
  nameAr?: string | null
  levelId?: string | null
  stageId?: string | null
  teacherProfileId?: string | null
  teacher?: { User?: { name?: string | null; isActive?: boolean } | null } | null
  members?: GroupMember[] | null
  enrollments?: { studentId: string }[] | null
}

type MeetingResult = {
  title: string
  sessionId: string
  url: string
  live: boolean
}

function studentsInGroup(group: ActiveGroup) {
  const activeEnrollmentIds = new Set((group.enrollments || []).map((enrollment) => enrollment.studentId))
  const students = new Map<string, { id: string; name: string; email?: string }>()
  for (const member of group.members || []) {
    const id = member.userId || member.user?.id
    if (typeof id !== 'string' || !id || students.has(id) || !activeEnrollmentIds.has(id)) continue
    students.set(id, {
      id,
      name: member.user?.name || member.user?.email || id,
      email: member.user?.email || undefined,
    })
  }
  return [...students.values()]
}

function memberIds(group: ActiveGroup) {
  return studentsInGroup(group).map((student) => student.id)
}

function errorMessage(body: unknown, fallback: string) {
  const error = (body as { error?: { message?: unknown; missing?: unknown } } | null)?.error
  const message = typeof error?.message === 'string' ? error.message : fallback
  const missing = Array.isArray(error?.missing)
    ? error.missing.filter((value: unknown): value is string => typeof value === 'string')
    : []
  return missing.length ? `${message}: ${missing.join(', ')}` : message
}

function getImmediateSchedule(durationMinutes: number) {
  // A short lead time prevents the provider receiving a scheduled time already in the past.
  const startTime = new Date(Date.now() + 60_000)
  return {
    startTime,
    endTime: new Date(startTime.getTime() + durationMinutes * 60_000),
  }
}

export default function AdminQMeetQuickStart({ onCreated }: { onCreated: () => void }) {
  const { language } = useTheme()
  const tr = useCallback((arabic: string, english: string) => localeText(language, arabic, english), [language])
  const isArabic = language === 'ar'
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<ActiveGroup[]>([])
  const [groupsState, setGroupsState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [providerState, setProviderState] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle')
  const [providerMissing, setProviderMissing] = useState<string[]>([])
  const [groupId, setGroupId] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [retrySessionId, setRetrySessionId] = useState('')
  const [retryTitle, setRetryTitle] = useState('')
  const [result, setResult] = useState<MeetingResult | null>(null)

  useEffect(() => {
    if (!open) return
    let active = true
    const controller = new AbortController()
    void fetch('/api/admin/classes/qmeet/status', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!active) return
        const missing = Array.isArray(body.missing)
          ? body.missing.filter((value: unknown): value is string => typeof value === 'string')
          : []
        setProviderMissing(missing)
        setProviderState(!response.ok ? 'error' : body.configured === true ? 'ready' : 'unavailable')
      })
      .catch((loadError: unknown) => {
        if (!active || (loadError instanceof DOMException && loadError.name === 'AbortError')) return
        setProviderState('error')
      })
    const timer = window.setTimeout(() => {
      void fetch('/api/admin/groups?status=ACTIVE', { cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
          const body = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(typeof body?.error?.message === 'string' ? body.error.message : tr('تعذر تحميل الفصول النشطة.', 'Could not load active classes.'))
          const available = Array.isArray(body.items)
            ? (body.items as ActiveGroup[]).filter((group) => Boolean(group.teacherProfileId) && group.teacher?.User?.isActive === true)
            : []
          if (!active) return
          setGroups(available)
          setGroupId((current) => current && available.some((group) => group.id === current) ? current : '')
          setGroupsState('ready')
        })
        .catch((loadError: unknown) => {
          if (!active || (loadError instanceof DOMException && loadError.name === 'AbortError')) return
          setGroups([])
          setGroupsState('error')
          setError(loadError instanceof Error ? loadError.message : tr('تعذر تحميل الفصول النشطة.', 'Could not load active classes.'))
        })
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [open, tr])

  const selectedGroup = groups.find((group) => group.id === groupId) || null

  async function activateSession(sessionId: string, initialStatus?: string) {
    let status = initialStatus
    if (!status) {
      const response = await fetch(`/api/admin/classes/sessions/${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(errorMessage(body, tr('تعذر التحقق من حالة الحصة.', 'Could not check the class status.')))
      const session = body.session || body.item || body
      status = typeof session.status === 'string' ? session.status : ''
    }

    for (const nextStatus of ['READY', 'LIVE'] as const) {
      if (status === 'LIVE') return
      if (status === 'READY' && nextStatus === 'READY') continue
      if (status !== 'SCHEDULED' && status !== 'READY') {
        throw new Error(tr('تم حفظ الاجتماع لكن حالة الحصة لا تسمح ببدئه الآن.', 'The meeting was created, but this class cannot be started from its current status.'))
      }
      const response = await fetch(`/api/admin/classes/sessions/${encodeURIComponent(sessionId)}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(errorMessage(body, tr('تم حفظ الاجتماع لكن تعذر تفعيل الحصة.', 'The meeting was created, but the class could not be activated.')))
      }
      status = nextStatus
    }
  }

  async function createMeeting(sessionId: string, initialStatus?: string, meetingTitle = retryTitle || title.trim()) {
    const response = await fetch(`/api/admin/classes/sessions/${encodeURIComponent(sessionId)}/qmeet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(errorMessage(body, tr('تعذر إنشاء اجتماع QMeet.', 'Could not create the QMeet meeting.')))
    }
    const meeting = body.meeting
    const url = typeof meeting?.hostUrl === 'string' ? meeting.hostUrl : meeting?.joinUrl
    if (typeof url !== 'string') {
      throw new Error(tr('لم يُرجع QMeet رابطًا للاجتماع.', 'QMeet did not return a meeting link.'))
    }
    setResult({ title: meetingTitle, sessionId, url, live: false })
    await activateSession(sessionId, initialStatus)
    setResult({ title: meetingTitle, sessionId, url, live: true })
    setRetrySessionId('')
    setRetryTitle('')
    setOpen(false)
    setError('')
    onCreated()
  }

  async function startNow() {
    if (providerState !== 'ready') {
      setError(tr('تحقق من جاهزية QMeet وإعداده قبل إنشاء الحصة.', 'Confirm QMeet is configured before creating the class.'))
      return
    }
    if (!selectedGroup?.teacherProfileId) {
      setError(tr('اختر فصلًا مرتبطًا بمعلم أولاً.', 'Choose a class assigned to a teacher first.'))
      return
    }
    if (!title.trim()) {
      setError(tr('اكتب عنوان الحصة.', 'Enter a class title.'))
      return
    }
    if (durationMinutes === '') {
      setError(tr('اختر مدة الاجتماع.', 'Choose a meeting duration.'))
      return
    }
    const eligibleStudents = new Set(memberIds(selectedGroup))
    const participants = selectedStudentIds.filter((id) => eligibleStudents.has(id))
    if (!participants.length) {
      setError(tr('اختر طالبًا واحدًا على الأقل لبدء الحصة.', 'Select at least one student to start the class.'))
      return
    }
    if (participants.length > 100) {
      setError(tr('يتجاوز عدد الطلاب الحد الأقصى البالغ 100 طالب للحصة.', 'This class exceeds the 100-student limit for one session.'))
      return
    }

    setSubmitting(true)
    setError('')
    setResult(null)
    const { startTime, endTime } = getImmediateSchedule(durationMinutes)
    let sessionId = ''
    try {
      const response = await fetch('/api/admin/classes/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          teacherProfileId: selectedGroup.teacherProfileId,
          groupId: selectedGroup.id,
          levelId: selectedGroup.levelId || null,
          stageId: selectedGroup.stageId || null,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: 'SCHEDULED',
          participantIds: participants,
        }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok || typeof body.id !== 'string') {
        throw new Error(errorMessage(body, tr('تعذر إنشاء الحصة.', 'Could not create the class.')))
      }
      sessionId = body.id
      setRetrySessionId(sessionId)
      setRetryTitle(title.trim())
      onCreated()
      await createMeeting(sessionId, 'SCHEDULED', title.trim())
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : tr('تعذر بدء اجتماع QMeet.', 'Could not start the QMeet meeting.'))
      if (sessionId) onCreated()
    } finally {
      setSubmitting(false)
    }
  }

  async function retryMeeting() {
    if (!retrySessionId || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await createMeeting(retrySessionId)
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : tr('تعذرت إعادة المحاولة.', 'Retry failed.'))
    } finally {
      setSubmitting(false)
    }
  }

  function openForm() {
    setError('')
    setGroupsState('loading')
    setProviderState('loading')
    setProviderMissing([])
    setGroupId('')
    setSelectedStudentIds([])
    setOpen(true)
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={openForm}
        className="inline-flex min-h-11 items-center justify-center bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:opacity-60"
        data-testid="button-admin-qmeet-start"
      >
        {tr('إنشاء وبدء اجتماع QMeet الآن', 'Create and start a QMeet meeting now')}
      </button>

      {retrySessionId && (
        <div className="flex flex-wrap items-center gap-3 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="status">
          <span>{tr('حُفظت الحصة، لكن إنشاء الاجتماع أو تفعيله لم يكتمل.', 'The class was saved, but meeting creation or activation did not finish.')}</span>
          <button type="button" onClick={() => void retryMeeting()} disabled={submitting} className="font-semibold underline disabled:opacity-60">
            {submitting ? tr('جارٍ إعادة المحاولة…', 'Retrying…') : tr('أعد المحاولة دون إنشاء حصة مكررة', 'Retry without creating a duplicate class')}
          </button>
        </div>
      )}

      {error && !open && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</div>}

      {result && (
        <div className="flex flex-wrap items-center gap-3 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950" role="status">
          <span>{result.live
            ? tr(`بدأت الحصة: ${result.title}`, `Class is live: ${result.title}`)
            : tr(`أُنشئ اجتماع QMeet للحصة ${result.title}، لكن التفعيل لم يكتمل.`, `QMeet was created for ${result.title}, but activation is incomplete.`)}</span>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            {tr('فتح اجتماع QMeet', 'Open QMeet')}
          </a>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !submitting) setOpen(false)
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-qmeet-title"
            dir={isArabic ? 'rtl' : 'ltr'}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[#dce4dc] bg-white p-5 shadow-md dark:border-neutral-700 dark:bg-neutral-900"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="admin-qmeet-title" className="text-lg font-bold text-[#25362c] dark:text-white">
                  {tr('بدء حصة مباشرة الآن', 'Start a live class now')}
                </h2>
                <p className="mt-1 text-sm text-[#68756e]">
                  {tr('سيُنشأ اجتماع QMeet ويُفعّل للطلاب فورًا.', 'A QMeet meeting will be created and activated for students immediately.')}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} disabled={submitting} className="rounded px-2 py-1 text-xl text-[#68756e] disabled:opacity-50" aria-label={tr('إغلاق', 'Close')}>×</button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5 text-sm font-medium text-[#34443a] dark:text-neutral-200">
                <span>{tr('الفصل والمعلم', 'Class and teacher')}</span>
                <select
                  value={groupId}
                  onChange={(event) => {
                    setGroupId(event.target.value)
                    setSelectedStudentIds([])
                  }}
                  disabled={groupsState !== 'ready' || submitting}
                  className="min-h-11 w-full rounded border border-[#dce4dc] bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <option value="">
                    {groupsState === 'loading' ? tr('جارٍ تحميل الفصول…', 'Loading classes…') : tr('اختر فصلًا نشطًا', 'Select an active class')}
                  </option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {(isArabic ? group.nameAr || group.name : group.name || group.nameAr) || tr('فصل بلا اسم', 'Unnamed class')}
                      {` · ${group.teacher?.User?.name || tr('معلم معيّن', 'Assigned teacher')} · ${memberIds(group).length} ${tr('طلاب', 'students')}`}
                    </option>
                  ))}
                </select>
              </label>

              {groupsState === 'error' && <p className="text-sm text-red-700" role="alert">{error}</p>}
              {groupsState === 'ready' && groups.length === 0 && (
                <p className="border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                  {tr('لا توجد فصول نشطة مرتبطة بمعلم. عيّن معلمًا لفصل نشط أولًا.', 'No active class has an assigned teacher. Assign a teacher to an active class first.')}
                </p>
              )}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-[#34443a] dark:text-neutral-200">{tr('اختر الطلاب', 'Select students')}</legend>
                {!selectedGroup || studentsInGroup(selectedGroup).length === 0
                  ? <p className="text-sm text-[#68756e]">{tr('لا يوجد طلاب مسجلون ونشطون في هذا الفصل.', 'This class has no active enrolled students.')}</p>
                  : <div className="max-h-44 space-y-1 overflow-y-auto rounded border border-[#dce4dc] p-2 dark:border-neutral-700">
                    {studentsInGroup(selectedGroup).map((student) => (
                      <label key={student.id} className="flex min-h-10 items-center gap-2 rounded px-2 text-sm text-[#34443a] hover:bg-[#f5f8f5] dark:text-neutral-200 dark:hover:bg-neutral-800">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          disabled={submitting}
                          onChange={(event) => setSelectedStudentIds((current) => event.target.checked
                            ? [...current, student.id]
                            : current.filter((id) => id !== student.id))}
                          className="h-4 w-4 accent-[#24714f]"
                        />
                        <span>{student.name}{student.email && student.email !== student.name ? ` · ${student.email}` : ''}</span>
                      </label>
                    ))}
                  </div>}
                <p className="text-xs text-[#68756e]">{selectedStudentIds.length} {tr('طلاب محددون', 'students selected')}</p>
              </fieldset>
              {providerState === 'loading' && <p className="text-sm text-[#68756e]" role="status">{tr('جارٍ التحقق من جاهزية QMeet…', 'Checking QMeet readiness…')}</p>}
              {providerState === 'unavailable' && (
                <p className="border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                  {tr('إعداد QMeet غير مكتمل. لم تُنشأ الحصة.', 'QMeet is not configured. No class has been created.')}
                  {providerMissing.length > 0 && ` ${tr('الإعدادات الناقصة:', 'Missing settings:')} ${providerMissing.join(', ')}.`}
                </p>
              )}
              {providerState === 'error' && <p className="text-sm text-red-700" role="alert">{tr('تعذر التحقق من جاهزية QMeet؛ لم تُنشأ الحصة.', 'Could not confirm QMeet readiness; no class has been created.')}</p>}

              <label className="block space-y-1.5 text-sm font-medium text-[#34443a] dark:text-neutral-200">
                <span>{tr('عنوان الحصة', 'Class title')}</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={200}
                  className="min-h-11 w-full rounded border border-[#dce4dc] bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  placeholder={tr('مثال: محادثة مباشرة', 'Example: Live conversation')}
                  disabled={submitting}
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-[#34443a] dark:text-neutral-200">
                <span>{tr('مدة الاجتماع', 'Meeting duration')}</span>
                <select
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value ? Number(event.target.value) : '')}
                  disabled={submitting}
                  className="min-h-11 w-full rounded border border-[#dce4dc] bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <option value="">{tr('اختر المدة', 'Choose duration')}</option>
                  {[15, 30, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} {tr('دقيقة', 'minutes')}</option>)}
                </select>
              </label>

              <p className="text-xs leading-5 text-[#68756e]">
                {selectedGroup
                  ? tr(`سيبدأ الآن للطلاب المحددين (${selectedStudentIds.length}).`, `Starts now for the selected students (${selectedStudentIds.length}).`)
                  : tr('يجب اختيار فصل نشط له معلم وطلاب.', 'Choose an active class with an assigned teacher and students.')}
              </p>

              {error && open && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void startNow()}
                  disabled={submitting || groupsState !== 'ready' || providerState !== 'ready' || !selectedGroup || !selectedStudentIds.length || !title.trim() || durationMinutes === ''}
                  className="min-h-11 flex-1 rounded bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {submitting ? tr('جارٍ إنشاء الحصة وQMeet…', 'Creating class and QMeet…') : tr('إنشاء وبدء الآن', 'Create and start now')}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="min-h-11 rounded border border-[#cbd5cd] px-4 text-sm font-semibold text-[#34443a] disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
                >
                  {tr('إلغاء', 'Cancel')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}