'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

type Level = { id: string; code: string; name: string; nameAr?: string | null; stages: { id: string; code: string; name: string; nameAr?: string | null }[] }
type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'database'

export default function LevelsClient() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [levels, setLevels] = useState<Level[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void fetch('/api/admin/levels', { cache: 'no-store' }).then(async (response) => {
        const body = await response.json().catch(() => null)
        if (!response.ok) {
          const code = String(body?.error?.code || body?.code || '')
          if (active) setState(response.status === 503 && code === 'DATABASE_UNAVAILABLE' ? 'database' : 'error')
          return
        }
        const next = Array.isArray(body) ? body : []
        if (active) {
          setLevels(next)
          setState(next.length ? 'ready' : 'empty')
        }
      }).catch(() => { if (active) setState('error') })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [retryKey])

  return <section className={styles.grid} aria-live="polite" dir={localeDirection(language)}>
    {state === 'loading' && <div className={styles.empty} aria-busy="true">{t('جارٍ تحميل المستويات…', 'Loading levels…')}</div>}
    {state === 'database' && <div className={styles.blocked} role="status">{t('سجلات المستويات غير متاحة مؤقتًا.', 'Level records are temporarily unavailable.')}</div>}
    {state === 'error' && <div className={styles.error} role="alert">{t('تعذر تحميل المستويات.', 'Levels could not be loaded.')} <button type="button" className={styles.button} onClick={() => { setState('loading'); setRetryKey((key) => key + 1) }}>{t('إعادة المحاولة', 'Retry')}</button></div>}
    {state === 'empty' && <div className={styles.empty}>{t('لم يتم إعداد مستويات نشطة بعد.', 'No active levels are configured yet.')}</div>}
    {state === 'ready' && levels.map((level) => <article className={styles.card} key={level.id}>
      <h2>{level.code} · {level.name}</h2>
      <p className={styles.muted}>{language === 'ar' ? level.nameAr || level.name : level.name}</p>
      <div className={styles.nav}>{level.stages.map((stage) => <span className={styles.badge} key={stage.id}>{stage.code}</span>)}</div>
    </article>)}
  </section>
}