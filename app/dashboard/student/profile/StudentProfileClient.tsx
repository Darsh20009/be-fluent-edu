'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'

type Profile = { name: string; email: string; phone?: string | null; status: string; StudentProfile?: { goal?: string | null; officialLevel?: { code: string; name: string } | null; officialStage?: { code: string; name: string } | null; learningProfile?: { goalsJson?: string | null; strengthsJson?: string | null; weaknessesJson?: string | null } | null } | null }

export default function StudentProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { fetch('/api/student/profile').then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body?.error?.message || 'Unable to load profile'); return body }).then(setProfile).catch((reason: Error) => setError(reason.message)) }, [])
  if (error) return <div className={styles.error}>{error}</div>
  if (!profile) return <div className={styles.empty}>Loading profile…</div>
  const student = profile.StudentProfile
  return <div className={styles.grid}>
    <section className={styles.card}><h2>Profile</h2><p><strong>{profile.name}</strong></p><p>{profile.email}</p><p>{profile.phone || 'Phone not added'}</p><span className={styles.badge}>{profile.status}</span></section>
    <section className={styles.card}><h2>Level and stage</h2><p>{student?.officialLevel ? `${student.officialLevel.code} · ${student.officialLevel.name}` : 'Not assigned yet'}</p><p className={styles.muted}>{student?.officialStage ? `${student.officialStage.code} · ${student.officialStage.name}` : 'Stage not assigned yet'}</p></section>
    <section className={styles.card}><h2>Goals</h2><p>{student?.goal || 'No goals saved yet.'}</p></section>
    <section className={styles.card}><h2>Learning profile</h2><p className={styles.muted}>Strengths, weaknesses, and focus areas will appear here when recorded. No learning data is fabricated.</p></section>
  </div>
}