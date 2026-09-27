'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'
import { useCallback } from 'react'

type Profile = { name: string; email: string; phone?: string | null; status: string; StudentProfile?: { goal?: string | null; officialLevel?: { code: string; name: string } | null; officialStage?: { code: string; name: string } | null; learningProfile?: { goalsJson?: string | null; strengthsJson?: string | null; weaknessesJson?: string | null } | null } | null }
type LoadState = 'loading' | 'ready' | 'error' | 'database'

export default function StudentProfileClient() {
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
  if (state === 'loading') return <div className={styles.empty} aria-live="polite" aria-busy="true">Loading profile…</div>
  if (state === 'database') return <div className={`${styles.notice} ${styles.blocked}`} role="status">Profile records are temporarily unavailable. Please try again later.</div>
  if (state === 'error') return <div className={styles.error} role="alert">We could not load your profile. <button type="button" className={styles.button} onClick={() => { setState('loading'); setRetryKey((key) => key + 1); }}>Retry</button></div>
  if (!profile) return <div className={styles.empty}>No profile information is available.</div>
  const student = profile.StudentProfile
  return <div className={styles.grid}>
    <section className={styles.card}><h2>Profile</h2><p><strong>{profile.name}</strong></p><p>{profile.email}</p><p>{profile.phone || 'Phone not added'}</p><span className={styles.badge}>{profile.status}</span></section>
    <section className={styles.card}><h2>Level and stage</h2><p>{student?.officialLevel ? `${student.officialLevel.code} · ${student.officialLevel.name}` : 'Not assigned yet'}</p><p className={styles.muted}>{student?.officialStage ? `${student.officialStage.code} · ${student.officialStage.name}` : 'Stage not assigned yet'}</p></section>
    <section className={styles.card}><h2>Goals</h2><p>{student?.goal || 'No goals saved yet.'}</p></section>
    <section className={styles.card}><h2>Learning profile</h2><p className={styles.muted}>Strengths, weaknesses, and focus areas will appear here when recorded. No learning data is fabricated.</p></section>
  </div>
}