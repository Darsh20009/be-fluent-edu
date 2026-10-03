'use client'

import { useCallback, useEffect, useState } from 'react'
import base from '@/app/phase4/phase4.module.css'
import styles from './commerce.module.css'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

const sections = [
  { id: 'subscriptions', label: 'Subscriptions', endpoint: '/api/admin/commerce/subscriptions' },
  { id: 'packages', label: 'Packages', endpoint: '/api/admin/commerce/packages' },
  { id: 'enrollments', label: 'Enrollments', endpoint: '/api/admin/enrollments' },
  { id: 'groups', label: 'Groups', endpoint: '/api/admin/groups' },
  { id: 'schedules', label: 'Schedules', endpoint: '/api/admin/groups' },
] as const

type Section = (typeof sections)[number]['id']
type ApiItem = Record<string, unknown> & { id: string }
type MatchCandidate = {
  groupId: string
  score: number
  remainingCapacity: number | null
  availabilityMatch: boolean
  name: string
  nameAr: string | null
  teacherName: string | null
  schedules: Array<{ dayOfWeek: number; startMinute: number; durationMinutes: number; timezone: string }>
}
type DuoPartnerCandidate = {
  subscriptionId: string
  studentId: string
  studentName: string
  sharedMinutes: number
  sharedSlots: Array<{ dayOfWeek: number; startMinute: number; durationMinutes: number }>
}
type MatchState = { loading: boolean; candidates: MatchCandidate[]; partners: DuoPartnerCandidate[]; message: string }

function displayName(item: ApiItem, section: Section) {
  if (section === 'packages') return String(item.title || item.titleAr || item.id)
  if (section === 'groups' || section === 'schedules') return String(item.name || item.nameAr || item.id)
  if (section === 'subscriptions') {
    const student = item.User as ApiItem | undefined
    return String(student?.name || item.studentId || item.id)
  }
  if (section === 'enrollments') {
    const student = item.student as ApiItem | undefined
    return String(student?.name || item.studentId || item.id)
  }
  return String(item.id)
}

function getSubscriptionType(item: ApiItem) {
  const pkg = item.Package as ApiItem | undefined
  const type = String(item.subscriptionType || pkg?.subscriptionType || '')
  return ['GROUP', 'DUO', 'PRIVATE', 'SMALL_GROUP'].includes(type) ? type : null
}

function timeLabel(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

export default function CommerceClient() {
  const { language } = useTheme()
  const t = useCallback((ar: string, en: string) => localeText(language, ar, en), [language])
  const [section, setSection] = useState<Section>('subscriptions')
  const [items, setItems] = useState<ApiItem[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'blocked' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [lessonsPerWeek, setLessonsPerWeek] = useState('')
  const [importingPhotoPricing, setImportingPhotoPricing] = useState(false)
  const [photoPricingMessage, setPhotoPricingMessage] = useState('')
  const [matchStates, setMatchStates] = useState<Record<string, MatchState>>({})
  const [approvingEnrollmentId, setApprovingEnrollmentId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setMessage('')
    const selected = sections.find((item) => item.id === section)!
    try {
      const response = await fetch(selected.endpoint, { cache: 'no-store' })
      const body = await response.json()
      if (response.status === 503 && body?.error?.code === 'DATABASE_UNAVAILABLE') {
        setItems([])
        setState('blocked')
        setMessage(t('السجلات غير متاحة مؤقتًا. لن تظهر السجلات ولا يمكن إرسال أي تغييرات.', 'Records are temporarily unavailable. No records are shown and no changes can be submitted.'))
        return
      }
      if (!response.ok) throw new Error('Unable to load this section')
      const nextItems = Array.isArray(body) ? body : body.items || []
      setItems(nextItems)
      setState('ready')
    } catch {
      setItems([])
      setState('error')
      setMessage(t('تعذر تحميل هذا القسم. يرجى المحاولة مجددًا.', 'This section could not be loaded. Please try again.'))
    }
  }, [section, t])

  const importPhotoPricing = async () => {
    const frequency = Number(lessonsPerWeek)
    if (!Number.isInteger(frequency) || frequency < 1 || frequency > 7) {
      setPhotoPricingMessage(t('أدخل عدد حصص أسبوعيًا من ١ إلى ٧.', 'Enter 1 to 7 lessons per week.'))
      return
    }
    setImportingPhotoPricing(true)
    setPhotoPricingMessage('')
    try {
      const response = await fetch('/api/admin/commerce/photo-pricing', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonsPerWeek: frequency }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const existing = Array.isArray(payload?.existing)
          ? payload.existing.map((item: ApiItem) => String(item.title || item.id)).join(', ')
          : ''
        throw new Error(existing
          ? t(`توجد باقات بالأسماء نفسها: ${existing}. لم يتم تغيير أي باقة.`, `Packages already exist with these titles: ${existing}. Nothing was changed.`)
          : t('تعذر إنشاء باقات الأسعار. لم يتم تغيير الباقات الموجودة.', 'Could not create the pricing packages. Existing packages were not changed.'))
      }
      const created = Array.isArray(payload?.items) ? payload.items.length : 0
      await load()
      setPhotoPricingMessage(t(`تم إنشاء ${created} باقات بالجنيه المصري.`, `${created} packages were created in EGP.`))
    } catch (error) {
      setPhotoPricingMessage(error instanceof Error ? error.message : t('تعذر إنشاء باقات الأسعار.', 'Could not create the pricing packages.'))
    } finally {
      setImportingPhotoPricing(false)
    }
  }

  const findMatches = async (item: ApiItem) => {
    const subscriptionType = getSubscriptionType(item)
    const studentId = String(item.studentId || '')
    if (!subscriptionType || !studentId) {
      setMatchStates((current) => ({ ...current, [item.id]: { loading: false, candidates: [], partners: [], message: t('بيانات الاشتراك أو الطالب غير مكتملة.', 'Subscription or student details are missing.') } }))
      return
    }
    setMatchStates((current) => ({ ...current, [item.id]: { loading: true, candidates: [], partners: [], message: '' } }))
    try {
      const response = await fetch('/api/admin/groups/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subscriptionId: item.id, subscriptionType }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const unavailable = response.status === 503
        throw new Error(unavailable
          ? t('المطابقة غير متاحة حتى تفعيل بيانات المرحلة الخامسة.', 'Matching is unavailable until Phase 5 data is enabled.')
          : t('تعذر العثور على المجموعات المناسبة.', 'Could not find compatible groups.'))
      }
      setMatchStates((current) => ({
        ...current,
        [item.id]: {
          loading: false,
          candidates: Array.isArray(payload?.candidates) ? payload.candidates : [],
          partners: Array.isArray(payload?.duoPartnerCandidates) ? payload.duoPartnerCandidates : [],
          message: '',
        },
      }))
    } catch (error) {
      setMatchStates((current) => ({ ...current, [item.id]: { loading: false, candidates: [], partners: [], message: error instanceof Error ? error.message : t('تعذر إكمال المطابقة.', 'Matching failed.') } }))
    }
  }

  const proposeGroup = async (item: ApiItem, groupId: string) => {
    const subscriptionType = getSubscriptionType(item)
    const studentId = String(item.studentId || '')
    if (!subscriptionType || !studentId) return
    setMatchStates((current) => ({ ...current, [item.id]: { ...(current[item.id] || { candidates: [], partners: [] }), loading: true, message: '' } }))
    try {
      const response = await fetch('/api/admin/groups/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subscriptionId: item.id, subscriptionType, proposeGroupId: groupId }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(t('تعذر إرسال الاقتراح. تحقق من حالة الاشتراك وسعة المجموعة.', 'Could not send the suggestion. Check the subscription status and group capacity.'))
      setMatchStates((current) => ({ ...current, [item.id]: { ...(current[item.id] || { candidates: [], partners: [] }), loading: false, message: t('أُرسل الاقتراح للطالب. لن يُفعّل التعيين قبل موافقته واعتماد الإدارة.', 'The suggestion was sent. Assignment will not activate until the student accepts and an administrator approves.') } }))
      await load()
      return payload?.proposedEnrollment
    } catch (error) {
      setMatchStates((current) => ({ ...current, [item.id]: { ...(current[item.id] || { candidates: [], partners: [] }), loading: false, message: error instanceof Error ? error.message : t('تعذر إرسال الاقتراح.', 'Could not send the suggestion.') } }))
    }
  }

  const approveProposal = async (enrollmentId: string) => {
    setApprovingEnrollmentId(enrollmentId)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/enrollments/${encodeURIComponent(enrollmentId)}/approve-proposal`, { method: 'POST' })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const code = String(payload?.error?.code || '')
        throw new Error(code === 'GROUP_FULL'
          ? t('امتلأت المجموعة قبل الاعتماد؛ ابحث عن خيار آخر.', 'The group filled before approval. Find another match.')
          : t('تعذر اعتماد التعيين. تأكد من موافقة الطالب وصلاحية الاشتراك.', 'Could not confirm assignment. Check student acceptance and subscription status.'))
      }
      setMessage(t('تم اعتماد التعيين وإضافة الطالب إلى المجموعة.', 'The assignment was approved and the student was added to the group.'))
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('تعذر اعتماد التعيين.', 'Could not confirm the assignment.'))
    } finally {
      setApprovingEnrollmentId(null)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const names: Record<Section, string> = {
    subscriptions: t('الاشتراكات', 'Subscriptions'),
    packages: t('الباقات', 'Packages'),
    enrollments: t('التسجيلات', 'Enrollments'),
    groups: t('المجموعات', 'Groups'),
    schedules: t('الجداول', 'Schedules'),
  }
  const dayNames = language === 'ar'
    ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return <section dir={localeDirection(language)}>
    <div className={styles.tabs} role="tablist" aria-label={t('العمليات التجارية', 'Commercial operations')}>
      {sections.map((item) => <button
        className={item.id === section ? styles.activeTab : styles.tab}
        key={item.id}
        onClick={() => { setItems([]); setState('loading'); setSection(item.id) }}
        role="tab"
        aria-selected={item.id === section}
      >{names[item.id]}</button>)}
    </div>

    {section === 'packages' && <div className={base.card}>
      <h2>{t('إضافة باقات الأسعار من الصور', 'Add the photo-based packages')}</h2>
      <p className={base.muted}>{t('الأسعار لكل طالب وبالجنيه المصري. حدّد الحصص الأسبوعية؛ يُحسب الشهر على أربعة أسابيع. لن تُستبدل أي باقات موجودة.', 'Prices are per student in EGP. Set weekly lessons; each month uses four weeks. Existing packages will not be overwritten.')}</p>
      <div className={base.toolbar}>
        <label className="grid gap-1 text-sm">
          {t('الحصص في الأسبوع', 'Lessons per week')}
          <input className={base.input} type="number" min={1} max={7} step={1} inputMode="numeric" value={lessonsPerWeek} onChange={(event) => setLessonsPerWeek(event.target.value)} data-testid="input-photo-pricing-frequency" />
        </label>
        <button className={base.button} type="button" disabled={importingPhotoPricing} onClick={() => void importPhotoPricing()} data-testid="button-import-photo-pricing">
          {importingPhotoPricing ? t('جارٍ الإنشاء…', 'Creating…') : t('إنشاء الباقات الست', 'Create six packages')}
        </button>
      </div>
      {photoPricingMessage && <p className={base.muted} role="status" data-testid="status-photo-pricing">{photoPricingMessage}</p>}
    </div>}

    {state === 'loading' && <div className={styles.status} aria-live="polite">{t('جارٍ تحميل', 'Loading')} {names[section]}…</div>}
    {state === 'blocked' && <div className={styles.blocked} role="status">
       <strong>{t('قاعدة البيانات غير متاحة', 'Database unavailable')}</strong>
      <p>{message}</p>
       <p className={base.muted}>{t('تظل المرحلة الخامسة محظورة القراءة والكتابة حتى استعادة الاتصال وتفعيلها صراحةً.', 'Phase 5 remains read/write blocked until connectivity is restored and explicitly enabled.')}</p>
    </div>}
    {state === 'error' && <div className={base.error} role="alert">{message} <button className={base.button} onClick={() => void load()}>{t('إعادة المحاولة', 'Retry')}</button></div>}
    {message && section === 'enrollments' && <p role="status" className={base.muted}>{message}</p>}
    {state === 'ready' && items.length === 0 && <div className={base.empty}>{t('لم يتم العثور على', 'No')} {names[section]}.</div>}
    {state === 'ready' && items.length > 0 && <div className={base.grid}>
      {items.map((item) => <article className={base.card} key={item.id}>
        <h2>{displayName(item, section)}</h2>
        <p className={base.muted}>{String(item.status || item.subscriptionType || t('مهيأ', 'Configured'))}</p>
         {section === 'schedules' && Array.isArray(item.schedules) && <p>{item.schedules.length} {t('مواعيد', 'schedule entries')}</p>}
        {section === 'subscriptions' && item.status === 'APPROVED' && !item.groupId && <div className="mt-4">
          <button type="button" className={base.button} disabled={matchStates[item.id]?.loading} onClick={() => void findMatches(item)} data-testid={`button-match-${item.id}`}>
            {matchStates[item.id]?.loading ? t('جارٍ البحث…', 'Finding matches…') : t('ابحث عن مجموعة', 'Find a group')}
          </button>
          {matchStates[item.id]?.message && <p role="status" className={`${base.muted} mt-2`}>{matchStates[item.id].message}</p>}
          {matchStates[item.id]?.candidates.map((candidate) => <div key={candidate.groupId} className="mt-3 rounded-lg border border-[#dce5dd] p-3">
            <h3 className="font-semibold text-[#26332e]">{language === 'ar' ? candidate.nameAr || candidate.name : candidate.name}</h3>
            <p className="mt-1 text-xs text-[#68756e]">{candidate.teacherName ? `${t('المعلم', 'Teacher')}: ${candidate.teacherName}` : ''}{candidate.remainingCapacity != null ? ` · ${t('الأماكن المتبقية', 'Seats left')}: ${candidate.remainingCapacity}` : ''}</p>
            {candidate.schedules.slice(0, 3).map((schedule, index) => <p key={`${schedule.dayOfWeek}-${schedule.startMinute}-${index}`} className="mt-1 text-xs text-[#68756e]">
              {schedule.dayOfWeek} · {timeLabel(schedule.startMinute)} · {schedule.timezone}
            </p>)}
            {candidate.availabilityMatch && <p className="mt-1 text-xs font-semibold text-[#286547]">{t('يتوافق مع أوقات الطالب المحفوظة', 'Matches the student’s saved availability')}</p>}
            <button type="button" className={`${base.button} mt-3`} disabled={matchStates[item.id]?.loading} onClick={() => void proposeGroup(item, candidate.groupId)}>
              {t('إرسال اقتراح للطالب', 'Send suggestion to student')}
            </button>
          </div>)}
          {getSubscriptionType(item) === 'DUO' && matchStates[item.id]?.partners.length > 0 && <div className="mt-4 rounded-lg bg-[#f5f8f5] p-3">
            <h3 className="font-semibold text-[#26332e]">{t('طلاب متوافقون محتملون لباقة الثنائي', 'Potential Duo plan partners')}</h3>
            <p className="mt-1 text-xs text-[#68756e]">{t('هذه مطابقة مبدئية للتوفر والمستوى، وليست تعيينًا أو موافقة من الطالب الآخر.', 'This is a preliminary availability and level match, not an assignment or the other student’s acceptance.')}</p>
            <ul className="mt-3 grid gap-2">
              {matchStates[item.id].partners.map((partner) => <li key={partner.subscriptionId} className="rounded-lg border border-[#dce5dd] bg-white p-3">
                <p className="font-semibold text-[#26332e]">{partner.studentName}</p>
                <p className="mt-1 text-xs text-[#68756e]">{t('وقت مشترك', 'Shared availability')}: {partner.sharedMinutes} {t('دقيقة أسبوعيًا', 'minutes per week')}</p>
                {partner.sharedSlots.slice(0, 4).map((slot, index) => <p key={`${slot.dayOfWeek}-${slot.startMinute}-${index}`} className="mt-1 text-xs text-[#68756e]">
                  {dayNames[slot.dayOfWeek]} · {timeLabel(slot.startMinute)}–{timeLabel(slot.startMinute + slot.durationMinutes)}
                </p>)}
              </li>)}
            </ul>
          </div>}
        </div>}
        {section === 'enrollments' && item.status === 'STUDENT_ACCEPTED' && <button type="button" className={`${base.button} mt-4`} disabled={approvingEnrollmentId === item.id} onClick={() => void approveProposal(item.id)} data-testid={`button-approve-proposal-${item.id}`}>
          {approvingEnrollmentId === item.id ? t('جارٍ الاعتماد…', 'Approving…') : t('اعتماد التعيين', 'Approve assignment')}
        </button>}
      </article>)}
    </div>}
  </section>
}