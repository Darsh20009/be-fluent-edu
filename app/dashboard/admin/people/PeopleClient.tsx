'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'

type Person = { id: string; name: string; email: string; phone?: string | null; status: string; isActive: boolean; StudentProfile?: { officialLevel?: { code: string } | null; officialStage?: { code: string } | null } | null }

export default function PeopleClient() {
  const [tab, setTab] = useState<'students' | 'teachers' | 'staff'>('students')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<Person[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch(`/api/admin/people/${tab}?search=${encodeURIComponent(search)}`)
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload?.error?.message || 'Unable to load people')
        return payload
      })
      .then((payload) => { if (active) { setItems(payload.items || []); setError('') } })
      .catch((reason: Error) => { if (active) setError(reason.message) })
    return () => { active = false }
  }, [tab, search])

  return <section className={styles.card}>
    <div className={styles.toolbar}>
      {(['students', 'teachers', 'staff'] as const).map((value) => <button className={styles.button} key={value} type="button" onClick={() => setTab(value)} aria-pressed={tab === value}>{value}</button>)}
      <input className={styles.input} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people" aria-label="Search people" />
    </div>
    {error && <div className={styles.error}>{error}</div>}
    {items === null ? <p className={styles.muted}>Loading people…</p> : items.length === 0 ? <div className={styles.empty}>No records match this search.</div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Level</th></tr></thead><tbody>
      {items.map((person) => <tr key={person.id}><td><strong>{person.name}</strong><br /><span className={styles.muted}>{person.id}</span></td><td>{person.email}<br />{person.phone || 'No phone'}</td><td><span className={styles.badge}>{person.status}</span></td><td>{person.StudentProfile?.officialLevel?.code || 'Not assigned'}{person.StudentProfile?.officialStage?.code ? ` · ${person.StudentProfile.officialStage.code}` : ''}</td></tr>)}
    </tbody></table></div>}
  </section>
}