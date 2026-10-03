'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'
import { useCallback } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

type AvailabilitySlot = { dayOfWeek: number; startMinute: number; durationMinutes: number }
type Profile = { name: string; email: string; phone?: string | null; status: string; StudentProfile?: { goal?: string | null; availabilityMonth?: string | null; availabilityJson?: string | null; officialLevel?: { code: string; name: string } | null; officialStage?: { code: string; name: string } | null; learningProfile?: { goalsJson?: string | null; strengthsJson?: string | null; weaknessesJson?: string | null } | null } | null }
type LoadState = 'loading' | 'ready' | 'error' | 'database'
type AvailabilitySaveState = 'idle' | 'saved' | 'error'

function currentMonthValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function readAvailability(value?: string | null): { timezone: string | null; slots: AvailabilitySlot[] } {
  if (!value) return { timezone: null, slots: [] }
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { timezone: null, slots: [] }
    const data = parsed as { timezone?: unknown; slots?: unknown }
    const slots = Array.isArray(data.slots) ? data.slots.filter((slot): slot is AvailabilitySlot => {
      if (!slot || typeof slot !== 'object') return false
      const item = slot as Partial<AvailabilitySlot>
      return Number.isInteger(item.dayOfWeek) && item.dayOfWeek! >= 0 && item.dayOfWeek! <= 6
        && Number.isInteger(item.startMinute) && item.startMinute! >= 0 && item.startMinute! < 1440
        && Number.isInteger(item.durationMinutes) && item.durationMinutes! >= 30 && item.durationMinutes! <= 240
        && item.startMinute! + item.durationMinutes! <= 1440
    }) : []
    return { timezone: typeof data.timezone === 'string' ? data.timezone : null, slots }
  } catch {
    return { timezone: null, slots: [] }
  }
}

function minuteToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

export default function StudentProfileClient() {
  const { language } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [retryKey, setRetryKey] = useState(0)
  const [availabilityMonth, setAvailabilityMonth] = useState('')
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [availabilityTimezone, setAvailabilityTimezone] = useState('Asia/Riyadh')
  const [newDay, setNewDay] = useState(1)
  const [newTime, setNewTime] = useState('17:00')
  const [newDuration, setNewDuration] = useState(60)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [availabilitySaveState, setAvailabilitySaveState] = useState<AvailabilitySaveState>('idle')
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/student/profile', { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        const code = String(body?.error?.code || body?.code || '')
        setState(response.status === 503 && code === 'DATABASE_UNAVAILABLE' ? 'database' : 'error')
        return
      }
      setProfile(body)
      const availability = readAvailability(body?.StudentProfile?.availabilityJson)
      setAvailabilityMonth(body?.StudentProfile?.availabilityMonth || currentMonthValue())
      setAvailabilitySlots(availability.slots)
      setAvailabilityTimezone(availability.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh')
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load, retryKey])
  if (state === 'loading') return <div className={styles.empty} aria-live="polite" aria-busy="true">{localeText(language, 'جارٍ تحميل الملف الشخصي…', 'Loading profile…')}</div>
  if (state === 'database') return <div className={`${styles.notice} ${styles.blocked}`} role="status">{localeText(language, 'بيانات الملف الشخصي غير متاحة مؤقتًا. يُرجى المحاولة لاحقًا.', 'Profile records are temporarily unavailable. Please try again later.')}</div>
  if (state === 'error') return <div className={styles.error} role="alert">{localeText(language, 'تعذّر تحميل ملفك الشخصي.', 'We could not load your profile.')} <button type="button" className={styles.button} onClick={() => { setState('loading'); setRetryKey((key) => key + 1); }}>{localeText(language, 'إعادة المحاولة', 'Retry')}</button></div>
  if (!profile) return <div className={styles.empty}>{localeText(language, 'لا تتوفر معلومات للملف الشخصي.', 'No profile information is available.')}</div>
  const student = profile.StudentProfile
  const dayNames = language === 'ar'
    ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  function addAvailabilitySlot() {
    const [hours, minutes] = newTime.split(':').map(Number)
    const slot = { dayOfWeek: newDay, startMinute: hours * 60 + minutes, durationMinutes: newDuration }
    if (availabilitySlots.some((item) => item.dayOfWeek === slot.dayOfWeek && item.startMinute === slot.startMinute)) return
    setAvailabilitySlots((current) => [...current, slot].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startMinute - b.startMinute))
    setAvailabilitySaveState('idle')
  }

  async function saveAvailability() {
    setAvailabilitySaving(true)
    setAvailabilitySaveState('idle')
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilityMonth,
          availabilitySlots,
          availabilityTimezone,
        }),
      })
      if (!response.ok) throw new Error('Save failed')
      setAvailabilitySaveState('saved')
    } catch {
      setAvailabilitySaveState('error')
    } finally {
      setAvailabilitySaving(false)
    }
  }

  return <div className={styles.grid}>
    <section className={styles.card}><h2>{localeText(language, 'الملف الشخصي', 'Profile')}</h2><p><strong>{profile.name}</strong></p><p>{profile.email}</p><p>{profile.phone || localeText(language, 'لم تتم إضافة رقم الهاتف', 'Phone not added')}</p><span className={styles.badge}>{profile.status}</span></section>
    <section className={styles.card}><h2>{localeText(language, 'المستوى والمرحلة', 'Level and stage')}</h2><p>{student?.officialLevel ? `${student.officialLevel.code} · ${student.officialLevel.name}` : localeText(language, 'لم يتم التعيين بعد', 'Not assigned yet')}</p><p className={styles.muted}>{student?.officialStage ? `${student.officialStage.code} · ${student.officialStage.name}` : localeText(language, 'لم يتم تعيين المرحلة بعد', 'Stage not assigned yet')}</p></section>
    <section className={styles.card}><h2>{localeText(language, 'الأهداف', 'Goals')}</h2><p>{student?.goal || localeText(language, 'لا توجد أهداف محفوظة حتى الآن.', 'No goals saved yet.')}</p></section>
    <section className={styles.card}><h2>{localeText(language, 'الملف التعليمي', 'Learning profile')}</h2><p className={styles.muted}>{localeText(language, 'ستظهر نقاط القوة والضعف ومجالات التركيز هنا عند تسجيلها. لا يتم إنشاء بيانات تعليمية غير حقيقية.', 'Strengths, weaknesses, and focus areas will appear here when recorded. No learning data is fabricated.')}</p></section>
    <section className={`${styles.card} sm:col-span-2`}>
      <h2>{localeText(language, 'التوفر الشهري', 'Monthly availability')}</h2>
      <p className={`${styles.muted} mt-1`}>{localeText(language, 'أضف الأوقات المناسبة لك لمساعدتنا في اقتراح مجموعة ومعلم. حفظ التوفر لا يؤكد التعيين.', 'Add suitable times so we can suggest a group and teacher. Saving availability does not confirm an assignment.')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-[#34453b]">
          {localeText(language, 'الشهر', 'Month')}
          <input type="month" min={currentMonthValue()} value={availabilityMonth} onChange={(event) => { setAvailabilityMonth(event.target.value); setAvailabilitySaveState('idle') }} className="min-h-11 rounded-lg border border-[#d7e1d8] px-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#34453b]">
          {localeText(language, 'المنطقة الزمنية', 'Time zone')}
          <input value={availabilityTimezone} readOnly className="min-h-11 rounded-lg border border-[#d7e1d8] bg-[#f7f9f7] px-3 font-normal text-[#58685e]" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#34453b]">
          {localeText(language, 'اليوم', 'Day')}
          <select value={newDay} onChange={(event) => setNewDay(Number(event.target.value))} className="min-h-11 rounded-lg border border-[#d7e1d8] bg-white px-3 font-normal">
            {dayNames.map((day, index) => <option key={day} value={index}>{day}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-[#34453b]">
            {localeText(language, 'وقت البدء', 'Start time')}
            <input type="time" value={newTime} onChange={(event) => setNewTime(event.target.value)} className="min-h-11 rounded-lg border border-[#d7e1d8] px-3 font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-[#34453b]">
            {localeText(language, 'المدة', 'Duration')}
            <select value={newDuration} onChange={(event) => setNewDuration(Number(event.target.value))} className="min-h-11 rounded-lg border border-[#d7e1d8] bg-white px-3 font-normal">
              {[30, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{localeText(language, `${minutes} دقيقة`, `${minutes} min`)}</option>)}
            </select>
          </label>
        </div>
        <button type="button" onClick={addAvailabilitySlot} className="min-h-11 self-end rounded-lg border border-[#b9d2c0] px-4 text-sm font-semibold text-[#286547] hover:bg-[#f2f7f2]">
          {localeText(language, 'إضافة وقت', 'Add time')}
        </button>
      </div>
      {availabilitySlots.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {availabilitySlots.map((slot) => (
            <li key={`${slot.dayOfWeek}-${slot.startMinute}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-[#f5f8f5] px-3 text-sm text-[#34453b]">
              <span>{dayNames[slot.dayOfWeek]} · {minuteToTime(slot.startMinute)} · {localeText(language, `${slot.durationMinutes} دقيقة`, `${slot.durationMinutes} min`)}</span>
              <button type="button" onClick={() => { setAvailabilitySlots((current) => current.filter((item) => item !== slot)); setAvailabilitySaveState('idle') }} aria-label={localeText(language, `حذف وقت ${dayNames[slot.dayOfWeek]} ${minuteToTime(slot.startMinute)}`, `Remove ${dayNames[slot.dayOfWeek]} ${minuteToTime(slot.startMinute)}`)} className="min-h-9 rounded px-2 font-semibold text-[#80534b] hover:bg-white">
                {localeText(language, 'حذف', 'Remove')}
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-[#718078]">{localeText(language, 'لم تضف أوقاتًا بعد.', 'No times added yet.')}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={availabilitySaving || !availabilityMonth} onClick={() => void saveAvailability()} className="min-h-11 rounded-lg bg-[#286547] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {availabilitySaving ? localeText(language, 'جارٍ الحفظ…', 'Saving…') : localeText(language, 'حفظ التوفر', 'Save availability')}
        </button>
        {availabilitySaveState === 'saved' && <span role="status" className="text-sm text-[#286547]">{localeText(language, 'تم حفظ التوفر.', 'Availability saved.')}</span>}
        {availabilitySaveState === 'error' && <span role="alert" className="text-sm text-red-700">{localeText(language, 'تعذر حفظ التوفر. حاول مرة أخرى.', 'Availability could not be saved. Try again.')}</span>}
      </div>
    </section>
  </div>
}