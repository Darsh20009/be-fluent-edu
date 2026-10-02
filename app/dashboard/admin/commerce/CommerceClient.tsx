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

function displayName(item: ApiItem, section: Section) {
  if (section === 'packages') return String(item.title || item.titleAr || item.id)
  if (section === 'groups' || section === 'schedules') return String(item.name || item.nameAr || item.id)
  return String(item.id)
}

export default function CommerceClient() {
  const { language } = useTheme()
  const t = useCallback((ar: string, en: string) => localeText(language, ar, en), [language])
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

    {state === 'loading' && <div className={styles.status} aria-live="polite">{t('جارٍ تحميل', 'Loading')} {names[section]}…</div>}
    {state === 'blocked' && <div className={styles.blocked} role="status">
       <strong>{t('قاعدة البيانات غير متاحة', 'Database unavailable')}</strong>
      <p>{message}</p>
       <p className={base.muted}>{t('تظل المرحلة الخامسة محظورة القراءة والكتابة حتى استعادة الاتصال وتفعيلها صراحةً.', 'Phase 5 remains read/write blocked until connectivity is restored and explicitly enabled.')}</p>
    </div>}
    {state === 'error' && <div className={base.error} role="alert">{message} <button className={base.button} onClick={() => void load()}>{t('إعادة المحاولة', 'Retry')}</button></div>}
    {state === 'ready' && items.length === 0 && <div className={base.empty}>{t('لم يتم العثور على', 'No')} {names[section]}.</div>}
    {state === 'ready' && items.length > 0 && <div className={base.grid}>
      {items.map((item) => <article className={base.card} key={item.id}>
        <h2>{displayName(item, section)}</h2>
         <p className={base.muted}>{String(item.status || item.subscriptionType || t('مهيأ', 'Configured'))}</p>
         {section === 'schedules' && Array.isArray(item.schedules) && <p>{item.schedules.length} {t('مواعيد', 'schedule entries')}</p>}
      </article>)}
    </div>}
  </section>
}