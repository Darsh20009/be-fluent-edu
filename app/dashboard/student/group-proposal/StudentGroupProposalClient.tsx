'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import styles from '@/app/phase4/phase4.module.css'

type Schedule = { dayOfWeek: number; startMinute: number; durationMinutes: number; timezone: string }
type ProposalData = {
  status: 'NONE' | 'WAITING' | 'PROPOSED' | 'STUDENT_ACCEPTED' | 'STUDENT_DECLINED' | 'blocked' | 'error' | 'loading'
  proposal?: {
    id: string
    group?: {
      name: string
      nameAr: string | null
      level: { code: string; name: string } | null
      stage: { code: string; name: string } | null
      teacherName: string | null
      schedules: Schedule[]
    } | null
  } | null
  waitlist?: { createdAt: string } | null
}

function timeLabel(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

export default function StudentGroupProposalClient() {
  const { language } = useTheme()
  const [data, setData] = useState<ProposalData>({ status: 'loading' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const t = (ar: string, en: string) => localeText(language, ar, en)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('/api/student/group-proposal', { cache: 'no-store' })
        const result = await response.json().catch(() => null)
        if (!active) return
        if (response.status === 503 && result?.error?.code === 'DATABASE_UNAVAILABLE') {
          setData({ status: 'blocked' })
          return
        }
        if (!response.ok) throw new Error('Unable to load group suggestion')
        setData(result)
      } catch {
        if (active) setData({ status: 'error' })
      }
    }
    void load()
    return () => { active = false }
  }, [retryKey])

  async function decide(decision: 'ACCEPT' | 'DECLINE') {
    if (!data.proposal?.id) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/student/group-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: data.proposal.id, decision }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error('Could not save your decision')
      setData((current) => ({ ...current, status: result.status }))
      setMessage(decision === 'ACCEPT'
        ? t('أُرسل قبولك للإدارة. لن يُفعّل التعيين قبل اعتماد الإدارة.', 'Your acceptance was sent to the administrator. The assignment will not activate until it is approved.')
        : t('تم تسجيل اعتذارك عن هذا الاقتراح. ستبقى مجموعتك دون تعيين حتى مراجعة خيار آخر.', 'Your decline was recorded. No group will be assigned until another option is reviewed.'))
    } catch {
      setMessage(t('تعذر حفظ قرارك. حاول مرة أخرى.', 'Your decision could not be saved. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  if (data.status === 'loading') return <div className={styles.empty} aria-live="polite" aria-busy="true">{t('جارٍ تحميل اقتراح المجموعة…', 'Loading group suggestion…')}</div>
  if (data.status === 'blocked') return <div className={`${styles.notice} ${styles.blocked}`} role="status">{t('خدمة المجموعات غير متاحة مؤقتًا. لم يتم تغيير أي تعيين.', 'Group matching is temporarily unavailable. No assignment was changed.')}</div>
  if (data.status === 'error') return <div className={styles.error} role="alert">{t('تعذر تحميل اقتراح المجموعة.', 'The group suggestion could not be loaded.')} <button type="button" className={styles.button} onClick={() => { setData({ status: 'loading' }); setRetryKey((value) => value + 1) }}>{t('إعادة المحاولة', 'Retry')}</button></div>

  const dayNames = language === 'ar'
    ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const group = data.proposal?.group

  return <section className={styles.grid}>
    {data.status === 'WAITING' && <article className={styles.card}>
      <h2>{t('طلبك في قائمة انتظار المطابقة', 'Your request is waiting for a match')}</h2>
      <p className={styles.muted}>{t('لم نعثر على مجموعة مناسبة بعد. سيظهر اقتراح هنا عند توفر خيار متوافق، ولن يتم تعيينك تلقائيًا.', 'No suitable group is available yet. A compatible suggestion will appear here; you will not be assigned automatically.')}</p>
      {data.waitlist?.createdAt && <p className="mt-3 text-sm text-[#718078]">{t(`تاريخ اعتماد الاشتراك: ${new Date(data.waitlist.createdAt).toLocaleDateString('ar-SA-u-ca-gregory')}`, `Subscription approved: ${new Date(data.waitlist.createdAt).toLocaleDateString('en-US')}`)}</p>}
    </article>}
    {data.status === 'NONE' && <article className={styles.card}>
      <h2>{t('لا يوجد اقتراح مجموعة حاليًا', 'No group suggestion yet')}</h2>
      <p className={styles.muted}>{t('ستظهر هنا أي مجموعة يقترحها فريق الإدارة لمراجعتك قبل تأكيد التعيين.', 'Any group suggested by the administration will appear here for your review before assignment is confirmed.')}</p>
    </article>}
    {data.proposal && <article className={styles.card}>
      <h2>{t('اقتراح مجموعة', 'Suggested group')}</h2>
      {group ? <>
        <p className="mt-2 text-lg font-bold text-[#26332e]">{language === 'ar' ? group.nameAr || group.name : group.name}</p>
        <p className="mt-2 text-sm text-[#5c6961]">{[group.level && `${group.level.code} · ${group.level.name}`, group.stage && `${group.stage.code} · ${group.stage.name}`].filter(Boolean).join(' / ')}</p>
        {group.teacherName && <p className="mt-2 text-sm text-[#5c6961]">{t('المعلم', 'Teacher')}: {group.teacherName}</p>}
        {group.schedules.length > 0 && <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {group.schedules.map((schedule, index) => <li key={`${schedule.dayOfWeek}-${schedule.startMinute}-${index}`} className="rounded-lg bg-[#f5f8f5] px-3 py-2 text-sm text-[#34453b]">
            {dayNames[schedule.dayOfWeek]} · {timeLabel(schedule.startMinute)} · {t(`${schedule.durationMinutes} دقيقة`, `${schedule.durationMinutes} min`)} · {schedule.timezone}
          </li>)}
        </ul>}
      </> : <p className={styles.muted}>{t('تفاصيل المجموعة غير متاحة الآن.', 'Group details are not available right now.')}</p>}
      {data.status === 'PROPOSED' ? <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void decide('ACCEPT')} className="min-h-11 rounded-lg bg-[#286547] px-5 text-sm font-semibold text-white disabled:opacity-50">{t('أوافق على الاقتراح', 'Accept suggestion')}</button>
        <button type="button" disabled={busy} onClick={() => void decide('DECLINE')} className="min-h-11 rounded-lg border border-[#d7e1d8] px-5 text-sm font-semibold text-[#80534b] disabled:opacity-50">{t('لا يناسبني', 'Decline')}</button>
      </div> : <p className="mt-4 text-sm font-semibold text-[#286547]">{t('وافقت على هذا الاقتراح. ينتظر التعيين اعتماد الإدارة.', 'You accepted this suggestion. The assignment is waiting for administrator approval.')}</p>}
      {message && <p role="status" className="mt-3 text-sm text-[#286547]">{message}</p>}
    </article>}
    {data.status === 'STUDENT_DECLINED' && <article className={styles.card}>
      <h2>{t('تم تسجيل اعتذارك', 'Your decline was recorded')}</h2>
      <p className={styles.muted}>{t('لم يتم تعيينك في هذه المجموعة. يمكنك الانتظار حتى يراجع الفريق خيارًا آخر.', 'You were not assigned to this group. You can wait while the team reviews another option.')}</p>
    </article>}
  </section>
}