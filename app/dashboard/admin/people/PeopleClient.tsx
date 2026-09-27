'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'

type Person = { id: string; name: string; email: string; phone?: string | null; status: string; isActive: boolean; StudentProfile?: { officialLevel?: { code: string } | null; officialStage?: { code: string } | null } | null }
type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'database'

export default function PeopleClient() {
  const [tab, setTab] = useState<'students' | 'teachers' | 'staff'>('students')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [items, setItems] = useState<Person[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void fetch(`/api/admin/people/${tab}?search=${encodeURIComponent(debouncedSearch)}`, { cache: 'no-store' })
        .then(async (response) => {
          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            const code = String(payload?.error?.code || payload?.code || '')
            if (active) setState(response.status === 503 && code === 'DATABASE_UNAVAILABLE' ? 'database' : 'error')
            return
          }
          const next = Array.isArray(payload?.items) ? payload.items : []
          if (active) {
            setItems(next)
            setState(next.length ? 'ready' : 'empty')
          }
        })
        .catch(() => { if (active) setState('error') })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [tab, debouncedSearch, retryKey])

  const selectTab = (value: 'students' | 'teachers' | 'staff') => {
    setItems([])
    setState('loading')
    setTab(value)
  }
  const updateSearch = (value: string) => {
    setItems([])
    setState('loading')
    setSearch(value)
  }

  return <section className={styles.card}>
    <div className={styles.toolbar}>
      {(['students', 'teachers', 'staff'] as const).map((value) => <button className={styles.button} key={value} type="button" onClick={() => selectTab(value)} aria-pressed={tab === value}>{value}</button>)}
      <input className={styles.input} value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search people" aria-label="Search people" />
    </div>
    {state === 'loading' && <p className={styles.muted} aria-live="polite" aria-busy="true">Loading people…</p>}
    {state === 'database' && <div className={styles.blocked} role="status">People records are temporarily unavailable.</div>}
    {state === 'error' && <div className={styles.error} role="alert">People could not be loaded. <button type="button" className={styles.button} onClick={() => { setState('loading'); setRetryKey((key) => key + 1) }}>Retry</button></div>}
    {state === 'empty' && <div className={styles.empty}>No records match this search.</div>}
    {state === 'ready' && <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Level</th></tr></thead><tbody>
      {items.map((person) => <tr key={person.id}><td><strong>{person.name}</strong><br /><span className={styles.muted}>{person.id}</span></td><td>{person.email}<br />{person.phone || 'No phone'}</td><td><span className={styles.badge}>{person.status}</span></td><td>{person.StudentProfile?.officialLevel?.code || 'Not assigned'}{person.StudentProfile?.officialStage?.code ? ` · ${person.StudentProfile.officialStage.code}` : ''}</td></tr>)}
    </tbody></table></div>}
  </section>
}