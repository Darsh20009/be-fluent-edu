'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'

type Level = { id: string; code: string; name: string; nameAr?: string | null; stages: { id: string; code: string; name: string; nameAr?: string | null }[] }

export default function LevelsClient() {
  const [levels, setLevels] = useState<Level[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    fetch('/api/admin/levels').then(async (response) => {
      const body = await response.json()
      if (!response.ok) throw new Error(body?.error?.message || 'Unable to load levels')
      return body
    }).then(setLevels).catch((reason: Error) => setError(reason.message))
  }, [])
  return <section className={styles.grid}>
    {error && <div className={styles.error}>{error}</div>}
    {!error && levels.length === 0 && <div className={styles.empty}>No active levels are configured yet.</div>}
    {levels.map((level) => <article className={styles.card} key={level.id}><h2>{level.code} · {level.name}</h2><p className={styles.muted}>{level.nameAr || 'No Arabic label'}</p><div className={styles.nav}>{level.stages.map((stage) => <span className={styles.badge} key={stage.id}>{stage.code}</span>)}</div></article>)}
  </section>
}