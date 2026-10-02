'use client'

import { useEffect, useState, type FormEvent } from 'react'
import styles from '@/app/phase4/phase4.module.css'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

type Person = { id: string; name: string; email: string; phone?: string | null; status: string; isActive: boolean; StudentProfile?: { officialLevel?: { code: string } | null; officialStage?: { code: string } | null } | null }
type PackageOption = { id: string; title: string; titleAr: string; price: number; discountPrice?: number | null; currency?: string | null; lessonsCount: number; lessonsPerWeek?: number | null; subscriptionType?: string | null; capacity?: number | null }
type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'database'
const weekdays = [
  ['SATURDAY', 'السبت', 'Saturday'], ['SUNDAY', 'الأحد', 'Sunday'], ['MONDAY', 'الاثنين', 'Monday'],
  ['TUESDAY', 'الثلاثاء', 'Tuesday'], ['WEDNESDAY', 'الأربعاء', 'Wednesday'],
  ['THURSDAY', 'الخميس', 'Thursday'], ['FRIDAY', 'الجمعة', 'Friday'],
] as const

export default function PeopleClient({ canCreateStudent = false }: { canCreateStudent?: boolean }) {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [tab, setTab] = useState<'students' | 'teachers' | 'staff'>('students')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [items, setItems] = useState<Person[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [retryKey, setRetryKey] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [packageState, setPackageState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [createState, setCreateState] = useState<'idle' | 'saving'>('idle')
  const [createError, setCreateError] = useState('')
  const [createNotice, setCreateNotice] = useState('')
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', phone: '', packageId: '', age: '', preferredTime: '17:00', preferredDays: [] as string[],
  })

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

  useEffect(() => {
    if (!createOpen || tab !== 'students' || packageState !== 'loading') return
    let active = true
    void fetch('/api/admin/commerce/packages?active=true', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => null)
        if (!response.ok) throw new Error(payload?.error?.message || 'PACKAGE_LOAD_FAILED')
        const next = Array.isArray(payload?.items) ? payload.items : []
        if (active) {
          setPackages(next)
          setPackageState('ready')
        }
      })
      .catch(() => {
        if (active) setPackageState('error')
      })
    return () => { active = false }
  }, [createOpen, tab, packageState])

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
  const configurablePackages = packages.filter((item) =>
    Boolean(item.subscriptionType) && item.capacity != null && item.capacity > 0 &&
    item.lessonsPerWeek != null && item.lessonsPerWeek > 0,
  )

  const submitNewStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateError('')
    setCreateNotice('')
    if (!newStudent.email.trim() && !newStudent.phone.trim()) {
      setCreateError(t('أدخل البريد الإلكتروني أو رقم الهاتف.', 'Enter an email address or phone number.'))
      return
    }
    if (!newStudent.preferredDays.length) {
      setCreateError(t('اختر يومًا متاحًا واحدًا على الأقل.', 'Choose at least one available day.'))
      return
    }
    setCreateState('saving')
    try {
      const response = await fetch('/api/admin/people/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email.trim() || undefined,
          phone: newStudent.phone.trim() || undefined,
          packageId: newStudent.packageId,
          age: newStudent.age ? Number(newStudent.age) : null,
          preferredTime: newStudent.preferredTime,
          preferredDays: newStudent.preferredDays,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const code = String(payload?.error?.code || '')
        const message = code === 'PACKAGE_SCHEDULE_REQUIRED'
          ? t('أكمل نوع الباقة والسعة وعدد الحصص الأسبوعية أولًا.', 'Configure the package type, capacity, and weekly lesson count first.')
          : code === 'STUDENT_ALREADY_EXISTS'
            ? t('هذا البريد أو الهاتف مسجل بالفعل.', 'This email or phone is already registered.')
            : t('تعذر إنشاء حساب الطالب.', 'The student account could not be created.')
        throw new Error(message)
      }
      setCreateOpen(false)
      setCreateNotice(t('تم إنشاء الحساب والاشتراك المعلّق. يمكن للطالب تسجيل الدخول برمز لمرة واحدة وإعداد كلمة المرور.', 'The account and pending subscription were created. The student can sign in with a one-time code and set a password.'))
      setNewStudent({ name: '', email: '', phone: '', packageId: '', age: '', preferredTime: '17:00', preferredDays: [] })
      setPackageState('idle')
      setRetryKey((key) => key + 1)
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : t('تعذر إنشاء حساب الطالب.', 'The student account could not be created.'))
    } finally {
      setCreateState('idle')
    }
  }

  return <section className={styles.card} dir={localeDirection(language)}>
    <div className={styles.toolbar}>
      {(['students', 'teachers', 'staff'] as const).map((value) => <button className={styles.button} key={value} type="button" onClick={() => selectTab(value)} aria-pressed={tab === value}>{t(value === 'students' ? 'الطلاب' : value === 'teachers' ? 'المعلمون' : 'الموظفون', value[0].toUpperCase() + value.slice(1))}</button>)}
      <input className={styles.input} value={search} onChange={(event) => updateSearch(event.target.value)} placeholder={t('ابحث عن أشخاص', 'Search people')} aria-label={t('ابحث عن أشخاص', 'Search people')} />
      {canCreateStudent && tab === 'students' && <button className={styles.button} type="button" onClick={() => {
        setCreateNotice('')
        setCreateError('')
        setPackageState(createOpen ? 'idle' : 'loading')
        setCreateOpen((open) => !open)
      }} aria-expanded={createOpen}>{createOpen ? t('إغلاق النموذج', 'Close form') : t('إنشاء طالب', 'Create student')}</button>}
    </div>
    {createNotice && <div className={styles.badge} role="status">{createNotice}</div>}
    {createOpen && tab === 'students' && canCreateStudent && <form className={styles.card} onSubmit={submitNewStudent} aria-label={t('إنشاء حساب طالب', 'Create student account')}>
      <h2>{t('إنشاء حساب طالب وربطه بباقة', 'Create student account and attach a package')}</h2>
      <p className={styles.muted}>{t('سيكون الاشتراك بانتظار مراجعة الدفع. لا تُرسل كلمة مرور؛ يسجل الطالب برمز لمرة واحدة ثم يختار كلمة مروره.', 'The subscription remains pending payment review. No password is shared; the student signs in with a one-time code and sets a password.')}</p>
      <div className={styles.toolbar}>
        <label>{t('اسم الطالب', 'Student name')}<input className={styles.input} required minLength={2} value={newStudent.name} onChange={(event) => setNewStudent((form) => ({ ...form, name: event.target.value }))} /></label>
        <label>{t('البريد الإلكتروني', 'Email')}<input className={styles.input} type="email" value={newStudent.email} onChange={(event) => setNewStudent((form) => ({ ...form, email: event.target.value }))} /></label>
        <label>{t('رقم الهاتف', 'Phone')}<input className={styles.input} type="tel" value={newStudent.phone} onChange={(event) => setNewStudent((form) => ({ ...form, phone: event.target.value }))} /></label>
        <label>{t('الباقة', 'Package')}
          <select className={styles.input} required value={newStudent.packageId} onChange={(event) => setNewStudent((form) => ({ ...form, packageId: event.target.value }))}>
            <option value="">{packageState === 'loading' ? t('جارٍ تحميل الباقات…', 'Loading packages…') : t('اختر باقة', 'Select a package')}</option>
            {packages.map((item) => {
              const configured = Boolean(item.subscriptionType) && item.capacity != null && item.capacity > 0 &&
                item.lessonsPerWeek != null && item.lessonsPerWeek > 0
              const amount = item.discountPrice ?? item.price
              const amountText = `${item.currency || 'EGP'} ${new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en').format(amount)}`
              const originalText = item.discountPrice == null
                ? ''
                : ` · ${t(`بدلًا من ${item.price}`, `was ${new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en').format(item.price)}`)}`
              return <option key={item.id} value={item.id} disabled={!configured}>
                {language === 'ar' ? item.titleAr || item.title : item.title} · {amountText}{originalText} · {item.lessonsPerWeek || '?'} {t('حصص أسبوعيًا', 'lessons/week')}
                {!configured ? ` · ${t('تحتاج إلى إعداد', 'needs setup')}` : ''}
              </option>
            })}
          </select>
        </label>
        <label>{t('العمر (اختياري)', 'Age (optional)')}<input className={styles.input} type="number" min={5} max={100} value={newStudent.age} onChange={(event) => setNewStudent((form) => ({ ...form, age: event.target.value }))} /></label>
        <label>{t('الوقت المفضّل', 'Preferred time')}<input className={styles.input} type="time" required value={newStudent.preferredTime} onChange={(event) => setNewStudent((form) => ({ ...form, preferredTime: event.target.value }))} /></label>
      </div>
      <fieldset className={styles.toolbar}>
        <legend>{t('الأيام المتاحة', 'Available days')}</legend>
        {weekdays.map(([value, ar, en]) => <label key={value}><input type="checkbox" checked={newStudent.preferredDays.includes(value)} onChange={(event) => setNewStudent((form) => ({ ...form, preferredDays: event.target.checked ? [...form.preferredDays, value] : form.preferredDays.filter((day) => day !== value) }))} /> {t(ar, en)}</label>)}
      </fieldset>
      {packageState === 'error' && <p className={styles.error} role="alert">{t('تعذر تحميل الباقات النشطة.', 'Could not load active packages.')} <button type="button" className={styles.button} onClick={() => setPackageState('loading')}>{t('إعادة المحاولة', 'Retry')}</button></p>}
      {packageState === 'ready' && packages.length === 0 && <p className={styles.muted} role="status">{t('لا توجد باقات نشطة. أنشئ باقة أولًا من صفحة الباقات والمجموعات.', 'There are no active packages. Create one on the Packages & groups page first.')}</p>}
      {packageState === 'ready' && packages.length > 0 && configurablePackages.length === 0 && <p className={styles.muted} role="status">{t('أكمل نوع الباقة والسعة والحصص الأسبوعية قبل استخدامها لإنشاء طالب.', 'Set each package type, capacity, and lessons per week before using it to create a student.')}</p>}
      {createError && <p className={styles.error} role="alert">{createError}</p>}
      <button className={styles.button} type="submit" disabled={createState === 'saving' || packageState !== 'ready' || configurablePackages.length === 0}>{createState === 'saving' ? t('جارٍ الإنشاء…', 'Creating…') : t('إنشاء الحساب والاشتراك', 'Create account and subscription')}</button>
    </form>}
    {state === 'loading' && <p className={styles.muted} aria-live="polite" aria-busy="true">{t('جارٍ تحميل الأشخاص…', 'Loading people…')}</p>}
    {state === 'database' && <div className={styles.blocked} role="status">{t('سجلات الأشخاص غير متاحة مؤقتًا.', 'People records are temporarily unavailable.')}</div>}
    {state === 'error' && <div className={styles.error} role="alert">{t('تعذر تحميل الأشخاص.', 'People could not be loaded.')} <button type="button" className={styles.button} onClick={() => { setState('loading'); setRetryKey((key) => key + 1) }}>{t('إعادة المحاولة', 'Retry')}</button></div>}
    {state === 'empty' && <div className={styles.empty}>{t('لا توجد سجلات تطابق هذا البحث.', 'No records match this search.')}</div>}
    {state === 'ready' && <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>{t('الاسم', 'Name')}</th><th>{t('التواصل', 'Contact')}</th><th>{t('الحالة', 'Status')}</th><th>{t('المستوى', 'Level')}</th></tr></thead><tbody>
      {items.map((person) => <tr key={person.id}><td><strong>{person.name}</strong><br /><span className={styles.muted}>{person.id}</span></td><td>{person.email}<br />{person.phone || t('لا يوجد هاتف', 'No phone')}</td><td><span className={styles.badge}>{person.status}</span></td><td>{person.StudentProfile?.officialLevel?.code || t('غير محدد', 'Not assigned')}{person.StudentProfile?.officialStage?.code ? ` · ${person.StudentProfile.officialStage.code}` : ''}</td></tr>)}
    </tbody></table></div>}
  </section>
}