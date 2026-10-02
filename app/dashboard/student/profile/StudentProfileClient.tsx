'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'
import { useCallback } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

type Profile = { name: string; email: string; phone?: string | null; status: string; StudentProfile?: { goal?: string | null; officialLevel?: { code: string; name: string } | null; officialStage?: { code: string; name: string } | null; learningProfile?: { goalsJson?: string | null; strengthsJson?: string | null; weaknessesJson?: string | null } | null } | null }
type LoadState = 'loading' | 'ready' | 'error' | 'database'

export default function StudentProfileClient() {
  const { language } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [retryKey, setRetryKey] = useState(0)
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
  return <div className={styles.grid}>
    <section className={styles.card}><h2>{localeText(language, 'الملف الشخصي', 'Profile')}</h2><p><strong>{profile.name}</strong></p><p>{profile.email}</p><p>{profile.phone || localeText(language, 'لم تتم إضافة رقم الهاتف', 'Phone not added')}</p><span className={styles.badge}>{profile.status}</span></section>
    <section className={styles.card}><h2>{localeText(language, 'المستوى والمرحلة', 'Level and stage')}</h2><p>{student?.officialLevel ? `${student.officialLevel.code} · ${student.officialLevel.name}` : localeText(language, 'لم يتم التعيين بعد', 'Not assigned yet')}</p><p className={styles.muted}>{student?.officialStage ? `${student.officialStage.code} · ${student.officialStage.name}` : localeText(language, 'لم يتم تعيين المرحلة بعد', 'Stage not assigned yet')}</p></section>
    <section className={styles.card}><h2>{localeText(language, 'الأهداف', 'Goals')}</h2><p>{student?.goal || localeText(language, 'لا توجد أهداف محفوظة حتى الآن.', 'No goals saved yet.')}</p></section>
    <section className={styles.card}><h2>{localeText(language, 'الملف التعليمي', 'Learning profile')}</h2><p className={styles.muted}>{localeText(language, 'ستظهر نقاط القوة والضعف ومجالات التركيز هنا عند تسجيلها. لا يتم إنشاء بيانات تعليمية غير حقيقية.', 'Strengths, weaknesses, and focus areas will appear here when recorded. No learning data is fabricated.')}</p></section>
  </div>
}