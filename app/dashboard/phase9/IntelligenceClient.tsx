'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import type React from 'react'
import styles from './intelligence.module.css'
import { BFButton } from '@/components/bf'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

type Load = 'loading' | 'ready' | 'error' | 'database'
const api = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, { ...options, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error?.code || body?.error?.message || 'ERROR')
  return body
}
const studentLearningTabs = ['Today', 'Recommendations', 'Progress', 'Goals', 'Learning Profile']
const translations: Record<string, string> = {
  'Today': 'اليوم', 'Recommendations': 'التوصيات', 'Progress': 'التقدم', 'Goals': 'الأهداف', 'Learning Profile': 'الملف التعليمي',
  'Database unavailable': 'قاعدة البيانات غير متاحة', 'Records are not available. Nothing will be persisted.': 'السجلات غير متاحة. لن يتم حفظ أي شيء.',
  'This view could not be loaded.': 'تعذّر تحميل هذا العرض.', 'Retry': 'إعادة المحاولة',
  'B Fluent EDU / learning intelligence': 'B Fluent EDU / ذكاء التعلّم', 'Learning views': 'عروض التعلّم',
  'Your learning, today': 'تعلّمك اليوم', 'A short plan shaped by what happened in your classes.': 'خطة قصيرة مستندة إلى ما حدث في حصصك.',
  'NOT_STARTED': 'لم يبدأ', 'IN_PROGRESS': 'قيد التقدم', 'PAUSED': 'متوقف مؤقتاً', 'COMPLETED': 'مكتمل',
  'ABANDONED': 'منتهي', 'PENDING': 'قيد الانتظار', 'SKIPPED': 'تم التخطي', 'READY': 'جاهز',
  'NOT_READY': 'غير جاهز', 'NO_RECOMMENDATIONS': 'لا توجد توصيات',
  'Daily plan': 'الخطة اليومية', 'minutes': 'دقيقة', 'Starting a recommendation step accepts it; only completed steps are marked complete.': 'يؤدي بدء خطوة موصى بها إلى قبولها؛ ولا تُعلّم الخطوات كمكتملة إلا بعد إتمامها.',
  'A plan will appear when current recommendations have suitable learning resources.': 'ستظهر الخطة عند توفر موارد تعليمية مناسبة للتوصيات الحالية.',
  'Start today': 'ابدأ اليوم', 'No current recommendations are available for a daily plan.': 'لا توجد توصيات حالية لإعداد خطة يومية.',
  'Review recommendations': 'راجع التوصيات', 'Pause': 'إيقاف مؤقت', 'Resume': 'استئناف', 'End session': 'إنهاء الجلسة',
  "Confirm ending today's learning session": 'تأكيد إنهاء جلسة تعلّم اليوم',
  'End this session? Its current progress will remain in the record, and the session cannot be resumed.': 'هل تريد إنهاء هذه الجلسة؟ سيبقى التقدم الحالي في السجل، ولن تتمكن من استئناف الجلسة.',
  'Keep session': 'الاحتفاظ بالجلسة', "Today's learning session is complete.": 'اكتملت جلسة تعلّم اليوم.',
  'This session has ended. Its saved progress remains in your history.': 'انتهت هذه الجلسة. لا يزال تقدمها المحفوظ في سجلّك.',
  'Resource': 'مورد', 'min': 'دقيقة', 'Begin': 'ابدأ', 'Skip': 'تخطَّ', 'Mark complete': 'علّم كمكتمل',
  "Complete today's plan": 'أكمل خطة اليوم', 'Progress by skill': 'التقدم حسب المهارة', 'Skill': 'مهارة',
  'No score': 'لا توجد درجة', 'pieces of evidence': 'أدلة', 'Progress will appear after completed learning.': 'سيظهر التقدم بعد إكمال أنشطة التعلّم.',
  'Your goal has been saved.': 'تم حفظ هدفك.', 'Your goal could not be saved. Please try again.': 'تعذّر حفظ هدفك. يُرجى المحاولة مجدداً.',
  'Current goal': 'الهدف الحالي', 'What would you like to achieve?': 'ما الذي ترغب في تحقيقه؟',
  'You can update this goal at any time.': 'يمكنك تحديث هذا الهدف في أي وقت.', 'Saving…': 'جارٍ الحفظ…',
  'Save goal': 'حفظ الهدف', 'Saved goals': 'الأهداف المحفوظة', 'Saved goal': 'هدف محفوظ',
  'No recommendations are available yet.': 'لا توجد توصيات بعد.', 'Practice suggestion': 'اقتراح للتدرب',
  'Keep this': 'احتفظ بهذا', 'Dismiss': 'تجاهل', 'Learning profile': 'الملف التعليمي',
  'Not recorded': 'غير مسجل', 'Level': 'المستوى', 'Stage': 'المرحلة', 'Focus areas': 'مجالات التركيز',
  'Student intelligence': 'ذكاء الطالب', 'Review class evidence and decide what is worth sharing.': 'راجع أدلة الحصص وحدد ما يستحق المشاركة.',
  'Assigned student': 'الطالب المعيّن', 'Assigned student ID': 'معرّف الطالب المعيّن', 'Look up student': 'ابحث عن الطالب',
  'Evidence from this assigned student only.': 'الأدلة من هذا الطالب المعيّن فقط.', 'Suggestion draft': 'مسودة اقتراح',
  'Reason': 'السبب', 'Save draft': 'حفظ المسودة', 'Approve explicitly': 'الموافقة صراحةً',
  'Learning intelligence': 'ذكاء التعلّم', 'A clear operational view of evidence, recommendations, and controls.': 'عرض تشغيلي واضح للأدلة والتوصيات وعناصر التحكم.',
  'Overview': 'نظرة عامة', 'Settings': 'الإعدادات',
  'pending recommendations': 'توصية قيد الانتظار', 'teacher drafts': 'مسودة للمعلم',
  'Service status': 'حالة الخدمة', 'Provider unavailable. Teacher approval only changes a draft to APPROVED; it does not create student records.': 'الموفر غير متاح. موافقة المعلم تغيّر حالة المسودة إلى «معتمد» فقط، ولا تنشئ سجلات للطلاب.',
}
function t(language: 'ar' | 'en', value: string) {
  return localeText(language, translations[value] || value, value)
}
function statusText(language: 'ar' | 'en', status: string) {
  return t(language, status)
}
function localizedData(item: any, key: string, language: 'ar' | 'en') {
  return item?.[`${key}${language === 'ar' ? 'Ar' : 'En'}`] || item?.[key]
}
function State({ state, retry }: { state: Load; retry: () => void }) {
  const { language } = useTheme()
  if (state === 'loading') return <div className={styles.grid}>{[1, 2, 3].map((x) => <div className={`${styles.card} ${styles.skeleton}`} key={x} />)}</div>
  if (state === 'database') return <div className={`${styles.notice} ${styles.blocked}`}><b>{t(language, 'Database unavailable')}</b><p>{t(language, 'Records are not available. Nothing will be persisted.')}</p></div>
  if (state === 'error') return <div className={styles.error}>{t(language, 'This view could not be loaded.')} <button className={styles.button} onClick={retry}>{t(language, 'Retry')}</button></div>
  return null
}
function Shell({ children, title, subtitle, tabs, tab, setTab }: { children: React.ReactNode; title: string; subtitle: string; tabs: string[]; tab: string; setTab: (tab: string) => void }) {
  const { language } = useTheme()
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.wrap}><header className={styles.top}><div><div className={styles.kicker}>{t(language, 'B Fluent EDU / learning intelligence')}</div><h1>{t(language, title)}</h1><p className={styles.muted}>{t(language, subtitle)}</p></div></header><nav className={styles.tabs} aria-label={t(language, 'Learning views')}>{tabs.map((item) => <button key={item} aria-current={tab === item ? 'page' : undefined} onClick={() => setTab(item)}>{t(language, item)}</button>)}</nav>{children}</div></main>
}

export function StudentLearning() {
  const { language } = useTheme()
  const [tab, setTab] = useState(studentLearningTabs[0])
  const [state, setState] = useState<Load>('loading')
  const [data, setData] = useState<any>({})
  const [posting, setPosting] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const [tabInitialized, setTabInitialized] = useState(false)
  const load = useCallback(async () => {
    setState('loading')
    try {
      const url = tab === 'Today'
        ? '/api/student/learning/today'
        : tab === 'Recommendations'
          ? '/api/student/learning/recommendations'
          : '/api/student/learning/profile'
      const result = await api(url)
      setData(result?.profile && Array.isArray(result.profile.mastery)
        ? { ...result, mastery: result.profile.mastery }
        : result)
      setState('ready')
    } catch (error) {
      setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error')
    }
  }, [tab])
  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get('view')
    if (requestedView && studentLearningTabs.includes(requestedView)) setTab(requestedView)
    setTabInitialized(true)
  }, [])
  useEffect(() => {
    if (tabInitialized) void load()
  }, [load, tabInitialized])

  const post = async (url: string, body?: any) => {
    if (posting) return
    setPosting(true)
    try {
      await api(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
      setConfirmAbandon(false)
      await load()
    } catch (error) {
      setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error')
    } finally {
      setPosting(false)
    }
  }

  const plan = data.plan
  const session = data.session
  const sessionStatus = session?.status
  const steps = session?.steps?.map((step: any, index: number) => ({
    ...step,
    ...(plan?.steps?.[index] || {}),
  })) || plan?.steps || []
  const terminalSession = sessionStatus === 'COMPLETED' || sessionStatus === 'ABANDONED'
  const canProgress = sessionStatus === 'NOT_STARTED' || sessionStatus === 'IN_PROGRESS'
  const allStepsResolved = steps.length > 0
    && steps.every((step: any) => ['COMPLETED', 'SKIPPED'].includes(step.status))

  return <Shell
    title="Your learning, today"
    subtitle="A short plan shaped by what happened in your classes."
    tabs={studentLearningTabs}
    tab={tab}
    setTab={setTab}
  >
    <State state={state} retry={load} />
    {state === 'ready' && tab === 'Today' && <section className={styles.card}>
      <div className={styles.kicker}>{statusText(language, sessionStatus || 'NOT_STARTED')}</div>
      <h2>{t(language, 'Daily plan')} · {statusText(language, plan?.status || 'NOT_READY')}</h2>
      <p className={styles.muted}>
        {plan?.status === 'READY'
          ? t(language, 'Starting a recommendation step accepts it; only completed steps are marked complete.')
          : t(language, 'A plan will appear when current recommendations have suitable learning resources.')}
      </p>
      <b>{plan?.totalMinutes || 0} {t(language, 'minutes')}</b>

      {!session && plan?.steps?.length > 0 && <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.primary}`}
          disabled={posting}
          onClick={() => void post('/api/student/learning/today/start')}
        >
          {t(language, 'Start today')}
        </button>
      </div>}

      {!session && plan?.status === 'NO_RECOMMENDATIONS' && <div className={styles.notice}>
        <p>{t(language, 'No current recommendations are available for a daily plan.')}</p>
        <button className={styles.button} onClick={() => setTab('Recommendations')}>
          {t(language, 'Review recommendations')}
        </button>
      </div>}

      {session && !terminalSession && <div className={styles.actions}>
        {sessionStatus === 'IN_PROGRESS' && <button
          className={styles.button}
          disabled={posting}
          onClick={() => void post('/api/student/learning/today/progress', { action: 'PAUSE' })}
        >
          {t(language, 'Pause')}
        </button>}
        {sessionStatus === 'PAUSED' && <button
          className={`${styles.button} ${styles.primary}`}
          disabled={posting}
          onClick={() => void post('/api/student/learning/today/progress', { action: 'RESUME' })}
        >
          {t(language, 'Resume')}
        </button>}
        <button
          className={styles.button}
          disabled={posting}
          onClick={() => setConfirmAbandon(true)}
        >
          {t(language, 'End session')}
        </button>
      </div>}

      {confirmAbandon && session && !terminalSession && <div className={styles.notice} role="group" aria-label={t(language, "Confirm ending today's learning session")}>
        <p>{t(language, 'End this session? Its current progress will remain in the record, and the session cannot be resumed.')}</p>
        <div className={styles.actions}>
          <button className={styles.button} disabled={posting} onClick={() => setConfirmAbandon(false)}>
            {t(language, 'Keep session')}
          </button>
          <button
            className={styles.button}
            disabled={posting}
            onClick={() => void post('/api/student/learning/today/abandon')}
          >
            {t(language, 'End session')}
          </button>
        </div>
      </div>}

      {sessionStatus === 'COMPLETED' && <div className={styles.notice} role="status">
        {t(language, "Today's learning session is complete.")}
      </div>}
      {sessionStatus === 'ABANDONED' && <div className={styles.notice} role="status">
        {t(language, 'This session has ended. Its saved progress remains in your history.')}
      </div>}

      {steps.map((step: any, index: number) => {
        const stepIndex = step.stepIndex ?? index
        const isCurrentStep = stepIndex === session?.currentStepIndex
        return <div className={styles.item} key={stepIndex}>
          <div className={styles.row}>
            <b>{stepIndex + 1}. {step.title || step.type}</b>
            <span className={styles.tag}>{statusText(language, step.status || 'PENDING')}</span>
          </div>
          <p className={styles.muted}>
            {[step.reason, step.skillCode, step.resourceId && `${t(language, 'Resource')} ${step.resourceId}`, step.durationMinutes && `${step.durationMinutes} ${t(language, 'min')}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {session && canProgress && isCurrentStep && step.status === 'PENDING' && <div className={styles.actions}>
            <button
              className={styles.button}
              disabled={posting}
              onClick={() => void post('/api/student/learning/today/progress', { action: 'START_STEP', stepIndex })}
            >
              {t(language, 'Begin')}
            </button>
            <button
              className={styles.button}
              disabled={posting}
              onClick={() => void post('/api/student/learning/today/progress', { action: 'SKIP_STEP', stepIndex })}
            >
              {t(language, 'Skip')}
            </button>
          </div>}
          {sessionStatus === 'IN_PROGRESS' && isCurrentStep && step.status === 'IN_PROGRESS' && <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              disabled={posting}
              onClick={() => void post('/api/student/learning/today/progress', { action: 'COMPLETE_STEP', stepIndex })}
            >
              {t(language, 'Mark complete')}
            </button>
            <button
              className={styles.button}
              disabled={posting}
              onClick={() => void post('/api/student/learning/today/progress', { action: 'SKIP_STEP', stepIndex })}
            >
              {t(language, 'Skip')}
            </button>
          </div>}
        </div>
      })}

      {session && allStepsResolved && !terminalSession && <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.primary}`}
          disabled={posting}
          onClick={() => void post('/api/student/learning/today/complete')}
        >
          {t(language, "Complete today's plan")}
        </button>
      </div>}
    </section>}
    {state === 'ready' && tab === 'Recommendations' && <RecommendationList items={data.items || []} post={post} />}
    {state === 'ready' && tab === 'Progress' && <section className={styles.card}>
      <h2>{t(language, 'Progress by skill')}</h2>
      {data.mastery?.length
        ? data.mastery.map((item: any, index: number) => <div className={styles.item} key={`${item.skill?.code || 'skill'}-${item.levelId || ''}-${item.stageId || ''}-${index}`}>
          <div className={styles.row}>
            <b>{localizedData(item.skill, 'name', language) || item.skill?.code || t(language, 'Skill')}</b>
            <span>{item.evidence?.score ?? t(language, 'No score')}</span>
          </div>
          <p className={styles.muted}>
            {[item.levelId, item.stageId, item.evidence?.evidenceCount && `${item.evidence.evidenceCount} ${t(language, 'pieces of evidence')}`, item.evidence?.source]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>)
        : <div className={styles.empty}>{t(language, 'Progress will appear after completed learning.')}</div>}
    </section>}
    {state === 'ready' && tab === 'Goals' && <GoalsPanel
      goal={data.profile?.goal || ''}
      goals={data.profile?.goals || []}
      onSave={async (value) => {
        try {
          const saved = await api('/api/student/goals', { method: 'PATCH', body: JSON.stringify({ overallGoal: value || null }) })
          setData((current: any) => ({
            ...current,
            profile: {
              ...current.profile,
              goal: value || null,
              ...(Array.isArray(saved?.goals) ? { goals: saved.goals } : {}),
            },
          }))
        } catch (error) {
          if ((error as Error).message === 'DATABASE_UNAVAILABLE') setState('database')
          throw error
        }
      }}
    />}
    {state === 'ready' && tab === 'Learning Profile' && <Profile profile={data.profile || {}} />}
  </Shell>
}
function GoalsPanel({ goal, goals, onSave }: { goal: string; goals: Array<{ id?: string; title?: string }>; onSave: (value: string) => Promise<void> }) {
  const { language } = useTheme()
  const [draft, setDraft] = useState(goal)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => { setDraft(goal) }, [goal])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await onSave(draft.trim())
      setMessage(t(language, 'Your goal has been saved.'))
    } catch {
      setMessage(t(language, 'Your goal could not be saved. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  return <section className={styles.card}>
    <h2>{t(language, 'Current goal')}</h2>
    <form onSubmit={submit}>
      <label htmlFor="student-overall-goal">{t(language, 'What would you like to achieve?')}</label>
      <textarea
        id="student-overall-goal"
        maxLength={1000}
        rows={4}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-describedby="student-goal-help"
      />
      <p id="student-goal-help" className={styles.muted}>{t(language, 'You can update this goal at any time.')}</p>
      <div className={styles.actions}>
        <BFButton type="submit" disabled={saving || draft.trim() === goal.trim()}>
          {saving ? t(language, 'Saving…') : t(language, 'Save goal')}
        </BFButton>
      </div>
      {message && <p role="status" aria-live="polite" className={styles.muted}>{message}</p>}
    </form>
    {goals.length > 0 && <div className={styles.list}>
      <h3>{t(language, 'Saved goals')}</h3>
      {goals.map((item, index) => <div className={styles.item} key={item.id || `${item.title || 'goal'}-${index}`}>{item.title || t(language, 'Saved goal')}</div>)}
    </div>}
  </section>
}
function RecommendationList({ items, post }: { items: any[]; post: (url: string, body?: any) => void }) {
  const { language } = useTheme()
  return <div className={styles.list}>{!items.length && <div className={styles.empty}>{t(language, 'No recommendations are available yet.')}</div>}{items.map((item) => <article className={styles.item} key={item.id}><div className={styles.row}><b>{localizedData(item, 'title', language) || t(language, 'Practice suggestion')}</b><span className={styles.tag}>{statusText(language, item.status)}</span></div><p className={styles.muted}>{localizedData(item, 'reason', language)}</p>{item.status === 'PENDING' && <div className={styles.actions}><button className={`${styles.button} ${styles.primary}`} onClick={() => post(`/api/student/learning/recommendations/${item.id}/accept`)}>{t(language, 'Keep this')}</button><button className={styles.button} onClick={() => post(`/api/student/learning/recommendations/${item.id}/dismiss`)}>{t(language, 'Dismiss')}</button></div>}</article>)}</div>
}
function Profile({ profile }: { profile: any }) {
  const { language } = useTheme()
  return <section className={styles.card}><h2>{t(language, 'Learning profile')}</h2><p className={styles.muted}>{t(language, 'Level')}: {localizedData(profile.officialLevel, 'name', language) || t(language, 'Not recorded')} · {t(language, 'Stage')}: {localizedData(profile.officialStage, 'name', language) || t(language, 'Not recorded')}</p>{profile.goal && <div className={styles.item}><b>{t(language, 'Current goal')}</b><p>{profile.goal}</p></div>}{profile.targetSkills?.length > 0 && <div className={styles.item}><b>{t(language, 'Focus areas')}</b><p>{profile.targetSkills.map((skill: any) => localizedData(skill, 'name', language) || skill.code || skill).join(', ')}</p></div>}</section>
}

const draftFields: Record<string, string[]> = { FEEDBACK_EXPRESSION: ['expression', 'meaning', 'example', 'category'], MISTAKE: ['original', 'correction', 'explanation'], EBI: ['betterExpression', 'explanation', 'priority'] }
function safeDraft(draft: any) { return Object.fromEntries((draftFields[draft.type] || []).map((key) => [key, String(draft[key] || '').trim()]).filter((entry) => entry[1])) }
export function TeacherIntelligence() {
  const { language } = useTheme()
  const [id, setId] = useState(''); const [student, setStudent] = useState<any>(null); const [state, setState] = useState<Load>('ready'); const [drafts, setDrafts] = useState<any[]>([]); const [draft, setDraft] = useState<any>({ type: 'FEEDBACK_EXPRESSION', reason: '' })
  const lookup = async () => { setStudent(null); setState('loading'); try { setStudent(await api(`/api/teacher/intelligence/students/${encodeURIComponent(id)}`)); setState('ready') } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const create = async () => { try { const response = await api('/api/teacher/intelligence/suggestions', { method: 'POST', body: JSON.stringify({ studentId: id, type: draft.type, reason: draft.reason, draft: safeDraft(draft) }) }); const item = response?.item ?? response; setDrafts((current) => [...current, item]) } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const approve = async (item: any) => { try { const response = await api(`/api/teacher/intelligence/suggestions/${item.id}/approve`, { method: 'POST', body: JSON.stringify({ approved: true }) }); const result = response?.item ?? response; setDrafts((current) => current.map((draftItem) => draftItem.id === item.id ? { ...draftItem, ...result, status: result.status } : draftItem)); await lookup() } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const draftTypeLabels: Record<string, string> = { FEEDBACK_EXPRESSION: 'تعبير للملاحظات', MISTAKE: 'خطأ', EBI: 'تعبير أفضل' }
  const fieldLabels: Record<string, string> = { expression: 'التعبير', meaning: 'المعنى', example: 'مثال', category: 'الفئة', original: 'الأصل', correction: 'التصحيح', explanation: 'الشرح', betterExpression: 'تعبير أفضل', priority: 'الأولوية' }
  return <Shell title="Student intelligence" subtitle="Review class evidence and decide what is worth sharing." tabs={['Assigned student']} tab="Assigned student" setTab={() => {}}>
    <div className={styles.card}><input value={id} onChange={(event) => setId(event.target.value)} placeholder={t(language, 'Assigned student ID')} /><button className={`${styles.button} ${styles.primary}`} disabled={!id} onClick={lookup}>{t(language, 'Look up student')}</button></div>
    <State state={state} retry={lookup}/>
    {state === 'ready' && student && <div className={styles.grid}>
      <section className={styles.card}><h2>{student.student?.name || id}</h2><p className={styles.muted}>{t(language, 'Evidence from this assigned student only.')}</p>{(student.signals || []).slice(0, 8).map((signal: any) => <div className={styles.item} key={signal.id}>{signal.evidence?.expression || signal.evidence?.original || signal.topicKey || signal.type}</div>)}</section>
      <section className={styles.card}><h2>{t(language, 'Suggestion draft')}</h2><select value={draft.type} onChange={(event) => setDraft({ type: event.target.value, reason: '' })}>{Object.keys(draftFields).map((type) => <option key={type} value={type}>{language === 'ar' ? draftTypeLabels[type] : type}</option>)}</select><textarea placeholder={t(language, 'Reason')} value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })}/>{draftFields[draft.type].map((field) => <input key={field} placeholder={language === 'ar' ? fieldLabels[field] || field : field} value={draft[field] || ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}/>)}<button className={`${styles.button} ${styles.primary}`} onClick={create}>{t(language, 'Save draft')}</button>{drafts.map((item) => <div className={styles.item} key={item.id}><span className={styles.tag}>{statusText(language, item.status)}</span>{item.status === 'DRAFT' && <button className={styles.button} onClick={() => approve(item)}>{t(language, 'Approve explicitly')}</button>}</div>)}</section>
    </div>}
  </Shell>
}
export function AdminIntelligence() {
  const { language } = useTheme()
  const [state, setState] = useState<Load>('loading')
  const [data, setData] = useState<any>({})
  const load = async () => {
    try {
      const [overview, recommendations, settings] = await Promise.all([api('/api/admin/intelligence/overview'), api('/api/admin/intelligence/recommendations'), api('/api/admin/intelligence/settings')])
      setData({ overview, recommendations: recommendations.items || [], settings }); setState('ready')
    } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') }
  }
  useEffect(() => { void load() }, [])
  return <Shell title="Learning intelligence" subtitle="A clear operational view of evidence, recommendations, and controls." tabs={['Overview', 'Recommendations', 'Settings']} tab="Overview" setTab={() => {}}>
    <State state={state} retry={load}/>
    {state === 'ready' && <div className={styles.grid}>
      <section className={styles.card}><h2>{t(language, 'Overview')}</h2><p className={styles.muted}>{data.overview?.pendingRecommendations} {t(language, 'pending recommendations')} · {data.overview?.teacherSuggestions} {t(language, 'teacher drafts')}</p></section>
      <section className={styles.card}><h2>{t(language, 'Recommendations')}</h2>{data.recommendations.map((item: any) => <div className={styles.item} key={item.id}>{item.student?.name || item.studentId} · {item.title || item.type} · {statusText(language, item.status)}</div>)}</section>
      <section className={styles.card}><h2>{t(language, 'Service status')}</h2><p className={styles.muted}>{data.settings?.mode}</p><div className={styles.notice}>{t(language, 'Provider unavailable. Teacher approval only changes a draft to APPROVED; it does not create student records.')}</div></section>
    </div>}
  </Shell>
}