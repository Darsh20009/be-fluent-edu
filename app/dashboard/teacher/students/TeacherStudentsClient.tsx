'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

type Student = { id: string; name: string; email: string; status: string }
type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'database'

export default function TeacherStudentsClient() {
  const { language } = useTheme()
  const [students, setStudents] = useState<Student[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [retryKey, setRetryKey] = useState(0)
  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void fetch('/api/teacher/students', { cache: 'no-store' }).then(async (response) => {
        const body = await response.json().catch(() => null)
        if (!response.ok) {
          const code = String(body?.error?.code || body?.code || '')
          if (active) setState(response.status === 503 && code === 'DATABASE_UNAVAILABLE' ? 'database' : 'error')
          return
        }
        const next = Array.isArray(body?.students) ? body.students : Array.isArray(body?.items) ? body.items : []
        if (active) {
          setStudents(next)
          setState(next.length ? 'ready' : 'empty')
        }
      }).catch(() => { if (active) setState('error') })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [retryKey])
  return <section className={styles.card} aria-live="polite">
    {state === 'loading' && <p className={styles.muted} aria-busy="true">{localeText(language, 'جارٍ تحميل الطلاب المعيّنين…', 'Loading assigned students…')}</p>}
    {state === 'database' && <div className={styles.blocked} role="status">{localeText(language, 'سجلات الطلاب غير متاحة مؤقتاً.', 'Student records are temporarily unavailable.')}</div>}
    {state === 'error' && <div className={styles.error} role="alert">{localeText(language, 'تعذر تحميل الطلاب المعيّنين.', 'Assigned students could not be loaded.')} <button type="button" className={styles.button} onClick={() => { setState('loading'); setRetryKey((key) => key + 1) }}>{localeText(language, 'إعادة المحاولة', 'Retry')}</button></div>}
    {state === 'empty' && <div className={styles.empty}>{localeText(language, 'لا يوجد طلاب معيّنون بعد.', 'No assigned students are available yet.')}</div>}
    {state === 'ready' && <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>{localeText(language, 'الاسم', 'Name')}</th><th>{localeText(language, 'البريد الإلكتروني', 'Email')}</th><th>{localeText(language, 'الحالة', 'Status')}</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.name}</td><td>{student.email}</td><td><span className={styles.badge}>{student.status}</span></td></tr>)}</tbody></table></div>}
  </section>
}