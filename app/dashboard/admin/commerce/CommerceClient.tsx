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
  const [lessonsPerWeek, setLessonsPerWeek] = useState('')
  const [importingPhotoPricing, setImportingPhotoPricing] = useState(false)
  const [photoPricingMessage, setPhotoPricingMessage] = useState('')

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

  const importPhotoPricing = async () => {
    const frequency = Number(lessonsPerWeek)
    if (!Number.isInteger(frequency) || frequency < 1 || frequency > 7) {
      setPhotoPricingMessage(t('أدخل عدد حصص أسبوعيًا من ١ إلى ٧.', 'Enter 1 to 7 lessons per week.'))
      return
    }
    setImportingPhotoPricing(true)
    setPhotoPricingMessage('')
    try {
      const response = await fetch('/api/admin/commerce/photo-pricing', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonsPerWeek: frequency }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const existing = Array.isArray(payload?.existing)
          ? payload.existing.map((item: ApiItem) => String(item.title || item.id)).join(', ')
          : ''
        throw new Error(existing
          ? t(`توجد باقات بالأسماء نفسها: ${existing}. لم يتم تغيير أي باقة.`, `Packages already exist with these titles: ${existing}. Nothing was changed.`)
          : t('تعذر إنشاء باقات الأسعار. لم يتم تغيير الباقات الموجودة.', 'Could not create the pricing packages. Existing packages were not changed.'))
      }
      const created = Array.isArray(payload?.items) ? payload.items.length : 0
      await load()
      setPhotoPricingMessage(t(`تم إنشاء ${created} باقات بالجنيه المصري.`, `${created} packages were created in EGP.`))
    } catch (error) {
      setPhotoPricingMessage(error instanceof Error ? error.message : t('تعذر إنشاء باقات الأسعار.', 'Could not create the pricing packages.'))
    } finally {
      setImportingPhotoPricing(false)
    }
  }

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

    {section === 'packages' && <div className={base.card}>
      <h2>{t('إضافة باقات الأسعار من الصور', 'Add the photo-based packages')}</h2>
      <p className={base.muted}>{t('الأسعار لكل طالب وبالجنيه المصري. حدّد الحصص الأسبوعية؛ يُحسب الشهر على أربعة أسابيع. لن تُستبدل أي باقات موجودة.', 'Prices are per student in EGP. Set weekly lessons; each month uses four weeks. Existing packages will not be overwritten.')}</p>
      <div className={base.toolbar}>
        <label className="grid gap-1 text-sm">
          {t('الحصص في الأسبوع', 'Lessons per week')}
          <input className={base.input} type="number" min={1} max={7} step={1} inputMode="numeric" value={lessonsPerWeek} onChange={(event) => setLessonsPerWeek(event.target.value)} data-testid="input-photo-pricing-frequency" />
        </label>
        <button className={base.button} type="button" disabled={importingPhotoPricing} onClick={() => void importPhotoPricing()} data-testid="button-import-photo-pricing">
          {importingPhotoPricing ? t('جارٍ الإنشاء…', 'Creating…') : t('إنشاء الباقات الست', 'Create six packages')}
        </button>
      </div>
      {photoPricingMessage && <p className={base.muted} role="status" data-testid="status-photo-pricing">{photoPricingMessage}</p>}
    </div>}

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