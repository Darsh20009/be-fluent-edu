'use client'

import { useCallback, useEffect, useState } from 'react'
import base from '@/app/phase4/phase4.module.css'
import styles from './commerce.module.css'

const sections = [
  { id: 'subscriptions', label: 'Subscriptions', endpoint: '/api/admin/commerce/subscriptions' },
  { id: 'packages', label: 'Packages', endpoint: '/api/admin/commerce/packages' },
  { id: 'enrollments', label: 'Enrollments', endpoint: '/api/admin/enrollments' },
  { id: 'groups', label: 'Groups', endpoint: '/api/admin/groups' },
  { id: 'schedules', label: 'Schedules', endpoint: '/api/admin/groups' },
] as const

type Section = (typeof sections)[number]['id']
type ApiItem = Record<string, unknown> & { id: string }

function displayName(item: ApiItem, section: Section) {
  if (section === 'packages') return String(item.title || item.titleAr || item.id)
  if (section === 'groups' || section === 'schedules') return String(item.name || item.nameAr || item.id)
  return String(item.id)
}

export default function CommerceClient() {
  const [section, setSection] = useState<Section>('subscriptions')
  const [items, setItems] = useState<ApiItem[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'blocked' | 'error'>('loading')
  const [message, setMessage] = useState('')

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
        setMessage('MongoDB is currently unavailable. No records are shown and no changes can be submitted.')
        return
      }
      if (!response.ok) throw new Error(body?.error?.message || 'Unable to load this section')
      const nextItems = Array.isArray(body) ? body : body.items || []
      setItems(nextItems)
      setState('ready')
    } catch (error) {
      setItems([])
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Unable to load this section')
    }
  }, [section])

  useEffect(() => { void load() }, [load])

  return <section>
    <div className={styles.tabs} role="tablist" aria-label="Commercial operations">
      {sections.map((item) => <button
        className={item.id === section ? styles.activeTab : styles.tab}
        key={item.id}
        onClick={() => setSection(item.id)}
        role="tab"
        aria-selected={item.id === section}
      >{item.label}</button>)}
    </div>

    {state === 'loading' && <div className={styles.status} aria-live="polite">Loading {section}…</div>}
    {state === 'blocked' && <div className={styles.blocked} role="status">
      <strong>Database unavailable</strong>
      <p>{message}</p>
      <p className={base.muted}>Phase 5 remains read/write blocked until connectivity is restored and explicitly enabled.</p>
    </div>}
    {state === 'error' && <div className={base.error} role="alert">{message} <button className={base.button} onClick={() => void load()}>Retry</button></div>}
    {state === 'ready' && items.length === 0 && <div className={base.empty}>No {section} found.</div>}
    {state === 'ready' && items.length > 0 && <div className={base.grid}>
      {items.map((item) => <article className={base.card} key={item.id}>
        <h2>{displayName(item, section)}</h2>
        <p className={base.muted}>{String(item.status || item.subscriptionType || 'Configured')}</p>
        {section === 'schedules' && Array.isArray(item.schedules) && <p>{item.schedules.length} schedule entries</p>}
      </article>)}
    </div>}
  </section>
}