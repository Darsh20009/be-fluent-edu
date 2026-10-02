'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from 'react'
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
  'ABANDONED': 'منتهي', 'PENDING': 'قيد الانتظار', 'PENDING_REVIEW': 'قيد المراجعة', 'APPROVED': 'موافق عليه', 'REJECTED': 'مرفوض', 'SKIPPED': 'تم التخطي', 'READY': 'جاهز',
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
  'Service status': 'حالة الخدمة', 'AI proposal approval creates a student recommendation; rejection does not.': 'تؤدي الموافقة على مقترح الذكاء الاصطناعي إلى إنشاء توصية للطالب، بينما لا يؤدي الرفض إلى ذلك.',
  'Generate provider proposals': 'أنشئ مقترحات من الموفّر', 'Generating proposals…': 'جارٍ إنشاء المقترحات…',
  'Provider proposals': 'مقترحات الموفّر', 'AI-generated for teacher review': 'أنشأها الذكاء الاصطناعي لمراجعة المعلم',
  'These proposals are saved for teacher review only. They are not student recommendations until approved.': 'تُحفظ هذه المقترحات لمراجعة المعلم فقط، ولا تصبح توصيات للطالب حتى الموافقة عليها.',
  'Each generation creates a separate set of review drafts.': 'ينشئ كل توليد مجموعة منفصلة من مسودات المراجعة.',
  'No proposals were returned. Try again when more learning evidence is available.': 'لم يتم إرجاع مقترحات. حاول مجدداً عند توفر أدلة تعلّم إضافية.',
  'The AI provider is unavailable right now. Your student records are unchanged.': 'موفّر الذكاء الاصطناعي غير متاح حالياً. لم تتغير سجلات الطالب.',
  'The provider response could not be safely reviewed. Retry generation.': 'تعذّرت مراجعة استجابة الموفّر بأمان. أعد إنشاء المقترحات.',
  'The provider could not generate proposals. Retry in a moment.': 'تعذّر على الموفّر إنشاء المقترحات. حاول مجدداً بعد قليل.',
  'Proposal generation failed. Check your assignment and try again.': 'تعذّر إنشاء المقترحات. تحقق من تعيين الطالب ثم حاول مجدداً.',
  'Approve proposal': 'الموافقة على المقترح', 'Reject proposal': 'رفض المقترح',
  'Confirm rejection': 'تأكيد الرفض', 'Keep proposal': 'الاحتفاظ بالمقترح', 'Reviewing…': 'جارٍ المراجعة…',
  'Recommendation created': 'تم إنشاء التوصية', 'Proposal review could not be completed. Refresh the student and check its review status.': 'تعذّرت مراجعة المقترح. حدّث بيانات الطالب وتحقق من حالة المراجعة.',
  'Saved to teacher review': 'محفوظ لمراجعة المعلم',
  'Current student recommendations': 'توصيات الطالب الحالية', 'Student recommendation records': 'سجلات توصيات الطالب',
  'No current student recommendations.': 'لا توجد توصيات حالية للطالب.',
  'No pending provider drafts. Generate proposals to create a new review batch.': 'لا توجد مسودات معلّقة من الموفّر. أنشئ المقترحات لبدء مجموعة مراجعة جديدة.',
  'Could not load pending review drafts.': 'تعذّر تحميل مسودات المراجعة المعلّقة.',
  'Provider proposal review': 'مراجعة مقترحات الموفّر',
  'Approve': 'موافقة', 'Reject': 'رفض', 'Reviewed by admin': 'تمت المراجعة بواسطة الإدارة',
  'Approved and added to student recommendations.': 'تمت الموافقة وإضافة المقترح إلى توصيات الطالب.',
  'Rejected. No student recommendation was created.': 'تم الرفض. لم يتم إنشاء توصية للطالب.',
  'Admin review action failed. Refresh and check the pending queue.': 'تعذّر تنفيذ إجراء المراجعة. حدّث الصفحة وتحقق من قائمة الانتظار.',
  'Invalid proposal draft; it cannot be approved.': 'مسودة المقترح غير صالحة ولا يمكن الموافقة عليها.',
  'Teacher': 'المعلم', 'Student': 'الطالب', 'Created': 'تاريخ الإنشاء',
  'Manual teacher suggestions are not handled in this AI proposal queue.': 'لا تُدار اقتراحات المعلم اليدوية ضمن قائمة مقترحات الذكاء الاصطناعي هذه.',
  'Approving a manual teacher draft only marks it APPROVED; it does not create a student recommendation.': 'الموافقة على مسودة المعلم اليدوية تغيّر حالتها إلى «موافق عليها» فقط، ولا تنشئ توصية للطالب.',
  'Loading review drafts…': 'جارٍ تحميل مسودات المراجعة…',
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
type ProviderProposal = {
  id: string
  status: string
  proposal: { type: string; title: string; reason: string; skillCode: string | null; resourceId: string | null; levelId: string | null; stageId: string | null }
  reason: string
  materialized?: boolean
  recommendationId?: string
}
type ProviderFailure = 'unavailable' | 'invalid' | 'provider' | 'request'
export function TeacherIntelligence() {
  const { language } = useTheme()
  const [id, setId] = useState('')
  const [student, setStudent] = useState<any>(null)
  const [state, setState] = useState<Load>('ready')
  const [drafts, setDrafts] = useState<any[]>([])
  const [draft, setDraft] = useState<any>({ type: 'FEEDBACK_EXPRESSION', reason: '' })
  const [proposals, setProposals] = useState<ProviderProposal[]>([])
  const [proposalState, setProposalState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [proposalQueueState, setProposalQueueState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [proposalFailure, setProposalFailure] = useState<ProviderFailure | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState('')
  const loadPendingProposals = useCallback(async (studentId: string) => {
    setProposalQueueState('loading')
    try {
      const result = await api(`/api/teacher/intelligence/students/${encodeURIComponent(studentId)}/proposals`)
      if (result?.ok !== true || !Array.isArray(result?.items)) throw new Error('INVALID_PROPOSAL_QUEUE')
      setProposals(result.items)
      setProposalState(result.items.length ? 'ready' : 'idle')
      setProposalQueueState('ready')
    } catch {
      setProposalQueueState('error')
    }
  }, [])
  const lookup = useCallback(async (studentId = id) => {
    const requestedId = studentId.trim()
    if (!requestedId) return
    setId(requestedId)
    try { window.sessionStorage.setItem('bf.teacher.intelligence.studentId', requestedId) } catch { /* Storage is optional. */ }
    setStudent(null)
    setProposals([])
    setProposalState('idle')
    setProposalQueueState('idle')
    setProposalFailure(null)
    setState('loading')
    try {
      const learner = await api(`/api/teacher/intelligence/students/${encodeURIComponent(requestedId)}`)
      setStudent(learner)
      setState('ready')
      void loadPendingProposals(requestedId)
    } catch (error) {
      setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error')
    }
  }, [id, loadPendingProposals])
  const restoredLearner = useRef(false)
  useEffect(() => {
    if (restoredLearner.current) return
    restoredLearner.current = true
    try {
      const savedId = window.sessionStorage.getItem('bf.teacher.intelligence.studentId')
      if (savedId) void lookup(savedId)
    } catch { /* Storage is optional; a teacher can enter an ID manually. */ }
  }, [lookup])
  const generateProposals = async () => {
    if (!student || proposalState === 'loading') return
    setProposalState('loading')
    setProposalFailure(null)
    setReviewError('')
    try {
      const result = await api(`/api/teacher/intelligence/students/${encodeURIComponent(id.trim())}/proposals`, { method: 'POST' })
      if (result?.mode !== 'PROVIDER' || result?.persisted !== true || !Array.isArray(result?.items)) {
        setProposalFailure('invalid')
        setProposalState('error')
        return
      }
      setProposals((current) => [...current, ...result.items])
      setProposalState('ready')
      setProposalQueueState('ready')
    } catch (error) {
      const code = (error as Error).message
      setProposalFailure(code === 'AI_PROVIDER_UNAVAILABLE' ? 'unavailable'
        : code === 'AI_INVALID_RESPONSE' ? 'invalid'
          : code === 'AI_PROVIDER_ERROR' ? 'provider' : 'request')
      setProposalState('error')
    }
  }
  const create = async () => { try { const response = await api('/api/teacher/intelligence/suggestions', { method: 'POST', body: JSON.stringify({ studentId: id, type: draft.type, reason: draft.reason, draft: safeDraft(draft) }) }); const item = response?.item ?? response; setDrafts((current) => [...current, item]) } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const approve = async (item: any) => { try { const response = await api(`/api/teacher/intelligence/suggestions/${item.id}/approve`, { method: 'POST', body: JSON.stringify({ approved: true }) }); const result = response?.item ?? response; setDrafts((current) => current.map((draftItem) => draftItem.id === item.id ? { ...draftItem, ...result, status: result.status } : draftItem)); setStudent(await api(`/api/teacher/intelligence/students/${encodeURIComponent(id.trim())}`)) } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const proposalFailureCopy: Record<ProviderFailure, string> = {
    unavailable: 'The AI provider is unavailable right now. Your student records are unchanged.',
    invalid: 'The provider response could not be safely reviewed. Retry generation.',
    provider: 'The provider could not generate proposals. Retry in a moment.',
    request: 'Proposal generation failed. Check your assignment and try again.',
  }
  const approveProviderProposal = async (item: ProviderProposal) => {
    if (reviewingId) return
    setReviewingId(item.id)
    setReviewError('')
    try {
      const result = await api(`/api/teacher/intelligence/suggestions/${encodeURIComponent(item.id)}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approved: true }),
      })
      if (result?.kind !== 'APPROVED' || result?.materialized !== true || !result?.recommendationId) {
        throw new Error('REVIEW_NOT_MATERIALIZED')
      }
      setProposals((current) => current.map((proposal) => proposal.id === item.id
        ? { ...proposal, status: result.status, materialized: true, recommendationId: result.recommendationId }
        : proposal))
      const refreshedStudent = await api(`/api/teacher/intelligence/students/${encodeURIComponent(id.trim())}`)
      setStudent(refreshedStudent)
    } catch {
      setReviewError(t(language, 'Proposal review could not be completed. Refresh the student and check its review status.'))
    } finally {
      setReviewingId(null)
      setConfirmRejectId(null)
    }
  }
  const rejectProviderProposal = async (item: ProviderProposal) => {
    if (reviewingId) return
    setReviewingId(item.id)
    setReviewError('')
    try {
      const result = await api(`/api/teacher/intelligence/suggestions/${encodeURIComponent(item.id)}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejected: true }),
      })
      if (result?.kind !== 'REJECTED') throw new Error('REVIEW_NOT_REJECTED')
      setProposals((current) => current.map((proposal) => proposal.id === item.id
        ? { ...proposal, status: result.status }
        : proposal))
    } catch {
      setReviewError(t(language, 'Proposal review could not be completed. Refresh the student and check its review status.'))
    } finally {
      setReviewingId(null)
      setConfirmRejectId(null)
    }
  }
  const draftTypeLabels: Record<string, string> = { FEEDBACK_EXPRESSION: 'تعبير للملاحظات', MISTAKE: 'خطأ', EBI: 'تعبير أفضل' }
  const fieldLabels: Record<string, string> = { expression: 'التعبير', meaning: 'المعنى', example: 'مثال', category: 'الفئة', original: 'الأصل', correction: 'التصحيح', explanation: 'الشرح', betterExpression: 'تعبير أفضل', priority: 'الأولوية' }
  return <Shell title="Student intelligence" subtitle="Review class evidence and decide what is worth sharing." tabs={['Assigned student']} tab="Assigned student" setTab={() => {}}>
    <div className={styles.card}>
      <label className={styles.field}><span>{t(language, 'Assigned student ID')}</span><input data-testid="teacher-student-id" value={id} onChange={(event) => {
        const nextId = event.target.value
        setId(nextId)
        setStudent(null)
        setProposals([])
        setProposalState('idle')
        setProposalQueueState('idle')
        setState('ready')
        try { window.sessionStorage.removeItem('bf.teacher.intelligence.studentId') } catch { /* Storage is optional. */ }
      }} placeholder={t(language, 'Assigned student ID')} onKeyDown={(event) => { if (event.key === 'Enter') void lookup() }}/></label>
      <button data-testid="teacher-student-lookup" className={`${styles.button} ${styles.primary}`} disabled={!id.trim() || state === 'loading'} onClick={() => void lookup()}>{t(language, 'Look up student')}</button>
    </div>
    <State state={state} retry={() => void lookup()}/>
    {state === 'ready' && student && <div className={styles.grid}>
      <section className={styles.card}><h2>{student.student?.name || id}</h2><p className={styles.muted}>{t(language, 'Evidence from this assigned student only.')}</p>{(student.signals || []).slice(0, 8).map((signal: any) => <div className={styles.item} key={signal.id}>{signal.evidence?.expression || signal.evidence?.original || signal.topicKey || signal.type}</div>)}</section>
      <section className={`${styles.card} ${styles.wide}`} data-testid="provider-proposal-panel">
        <div className={styles.proposalHeading}>
          <div><div className={styles.kicker}>{t(language, 'AI-generated for teacher review')}</div><h2>{t(language, 'Provider proposals')}</h2></div>
          <button data-testid="generate-provider-proposals" className={`${styles.button} ${styles.primary}`} disabled={proposalState === 'loading'} onClick={() => void generateProposals()}>
            {proposalState === 'loading' ? t(language, 'Generating proposals…') : t(language, 'Generate provider proposals')}
          </button>
        </div>
        <div className={`${styles.notice} ${styles.reviewNotice}`} role="note">
          <strong>{t(language, 'These proposals are saved for teacher review only. They are not student recommendations until approved.')}</strong>
          <p>{t(language, 'Each generation creates a separate set of review drafts.')}</p>
        </div>
        {proposalState === 'loading' && <div className={styles.proposalSkeleton} aria-label={t(language, 'Generating proposals…')} data-testid="proposal-loading">{[0, 1].map((item) => <div className={styles.skeleton} key={item}/>)}</div>}
        {proposalQueueState === 'loading' && <div className={styles.proposalSkeleton} aria-label={t(language, 'Loading review drafts…')} data-testid="proposal-queue-loading"><div className={styles.skeleton}/></div>}
        {proposalQueueState === 'error' && <div className={styles.error} role="alert" data-testid="proposal-queue-error">
          {t(language, 'Could not load pending review drafts.')}
          <button className={styles.button} onClick={() => void loadPendingProposals(id.trim())}>{t(language, 'Retry')}</button>
        </div>}
        {proposalQueueState === 'ready' && proposalState === 'idle' && proposals.length === 0 && <div className={styles.empty} data-testid="proposal-queue-empty">{t(language, 'No pending provider drafts. Generate proposals to create a new review batch.')}</div>}
        {proposalState === 'error' && proposalFailure && <div className={styles.error} role="alert" data-testid={`proposal-error-${proposalFailure}`}>
          {t(language, proposalFailureCopy[proposalFailure])}
          <button className={styles.button} onClick={() => void generateProposals()}>{t(language, 'Retry')}</button>
        </div>}
        {proposalState === 'ready' && proposals.length === 0 && <div className={styles.empty} data-testid="proposal-empty">{t(language, 'No proposals were returned. Try again when more learning evidence is available.')}</div>}
        {proposals.length > 0 && <div className={styles.proposalReview} data-testid="provider-proposals">
          {reviewError && <div className={styles.error} role="alert" data-testid="proposal-review-error">{reviewError}</div>}
          {proposals.map((item) => <article className={styles.proposal} key={item.id} data-testid="provider-proposal">
            <div className={styles.row}>
              <div><span className={styles.tag}>{item.proposal.type}</span><span className={`${styles.tag} ${styles.reviewStatusTag}`}>{statusText(language, item.status)}</span></div>
              {item.materialized && <span className={styles.materializedTag}>{t(language, 'Recommendation created')}</span>}
            </div>
            <h3>{item.proposal.title}</h3>
            <p className={styles.muted}>{item.proposal.reason || item.reason}</p>
            <dl className={styles.proposalMeta}>
              {item.proposal.skillCode && <div><dt>{t(language, 'Skill')}</dt><dd>{item.proposal.skillCode}</dd></div>}
              {item.proposal.resourceId && <div><dt>{t(language, 'Resource')}</dt><dd>{item.proposal.resourceId}</dd></div>}
              {item.proposal.levelId && <div><dt>{t(language, 'Level')}</dt><dd>{student.officialLevel?.code || item.proposal.levelId}</dd></div>}
              {item.proposal.stageId && <div><dt>{t(language, 'Stage')}</dt><dd>{student.officialStage?.code || item.proposal.stageId}</dd></div>}
            </dl>
            {item.status === 'PENDING_REVIEW' && <div className={styles.actions}>
              <button className={`${styles.button} ${styles.primary}`} disabled={Boolean(reviewingId)} onClick={() => void approveProviderProposal(item)} data-testid={`approve-provider-proposal-${item.id}`}>
                {reviewingId === item.id ? t(language, 'Reviewing…') : t(language, 'Approve proposal')}
              </button>
              {confirmRejectId === item.id
                ? <><span className={styles.muted}>{t(language, 'Confirm rejection')}?</span><button className={styles.button} disabled={Boolean(reviewingId)} onClick={() => void rejectProviderProposal(item)}>{t(language, 'Confirm rejection')}</button><button className={styles.button} disabled={Boolean(reviewingId)} onClick={() => setConfirmRejectId(null)}>{t(language, 'Keep proposal')}</button></>
                : <button className={styles.button} disabled={Boolean(reviewingId)} onClick={() => setConfirmRejectId(item.id)} data-testid={`reject-provider-proposal-${item.id}`}>{t(language, 'Reject proposal')}</button>}
            </div>}
          </article>)}
        </div>}
      </section>
      {Array.isArray(student.recommendations) && <section className={`${styles.card} ${styles.wide}`} data-testid="existing-student-recommendations">
        <div className={styles.row}><h2>{t(language, 'Current student recommendations')}</h2><span className={styles.tag}>{t(language, 'Student recommendation records')}</span></div>
        {student.recommendations.length
          ? student.recommendations.map((item: any) => <article className={styles.item} key={item.id}><div className={styles.row}><b>{item.title || item.type}</b><span className={styles.tag}>{statusText(language, item.status)}</span></div><p className={styles.muted}>{item.reason}</p></article>)
          : <div className={styles.empty}>{t(language, 'No current student recommendations.')}</div>}
      </section>}
      <section className={styles.card}><h2>{t(language, 'Suggestion draft')}</h2><p className={styles.muted}>{t(language, 'Approving a manual teacher draft only marks it APPROVED; it does not create a student recommendation.')}</p><select value={draft.type} onChange={(event) => setDraft({ type: event.target.value, reason: '' })}>{Object.keys(draftFields).map((type) => <option key={type} value={type}>{language === 'ar' ? draftTypeLabels[type] : type}</option>)}</select><textarea placeholder={t(language, 'Reason')} value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })}/>{draftFields[draft.type].map((field) => <input key={field} placeholder={language === 'ar' ? fieldLabels[field] || field : field} value={draft[field] || ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}/>)}<button className={`${styles.button} ${styles.primary}`} onClick={create}>{t(language, 'Save draft')}</button>{drafts.map((item) => <div className={styles.item} key={item.id}><span className={styles.tag}>{statusText(language, item.status)}</span>{item.status === 'DRAFT' && <button className={styles.button} onClick={() => approve(item)}>{t(language, 'Approve explicitly')}</button>}</div>)}</section>
    </div>}
  </Shell>
}
export function AdminIntelligence() {
  const { language } = useTheme()
  const [state, setState] = useState<Load>('loading')
  const [data, setData] = useState<any>({})
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState('')
  const load = async () => {
    setState('loading')
    try {
      const [overview, recommendations, settings, suggestions] = await Promise.all([
        api('/api/admin/intelligence/overview'),
        api('/api/admin/intelligence/recommendations'),
        api('/api/admin/intelligence/settings'),
        api('/api/admin/intelligence/suggestions?limit=50'),
      ])
      setData({ overview, recommendations: recommendations.items || [], settings, suggestions: suggestions.items || [] })
      setState('ready')
    } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') }
  }
  const reviewSuggestion = async (item: any, decision: 'APPROVE' | 'REJECT') => {
    if (reviewingId) return
    setReviewingId(item.id)
    setReviewError('')
    try {
      const result = await api('/api/admin/intelligence/suggestions', {
        method: 'POST',
        body: JSON.stringify({ suggestionId: item.id, decision }),
      })
      if (decision === 'APPROVE') {
        if (result?.kind !== 'APPROVED' || result?.materialized !== true || !result?.recommendationId) {
          throw new Error('APPROVAL_NOT_MATERIALIZED')
        }
        setData((current: any) => ({
          ...current,
          overview: {
            ...current.overview,
            pendingRecommendations: (current.overview?.pendingRecommendations || 0) + 1,
          },
          suggestions: current.suggestions.map((suggestion: any) => suggestion.id === item.id
            ? { ...suggestion, status: 'APPROVED', materialized: true, recommendationId: result.recommendationId }
            : suggestion),
          recommendations: [{
            id: result.recommendationId,
            studentId: item.studentId,
            student: item.student || null,
            type: item.proposal?.type,
            title: item.proposal?.title,
            reason: item.proposal?.reason || item.reason,
            status: 'PENDING',
          }, ...current.recommendations],
        }))
      } else {
        if (result?.kind !== 'REJECTED') throw new Error('REJECTION_NOT_RECORDED')
        setData((current: any) => ({
          ...current,
          suggestions: current.suggestions.map((suggestion: any) => suggestion.id === item.id
            ? { ...suggestion, status: 'REJECTED', materialized: false }
            : suggestion),
        }))
      }
    } catch (error) {
      const code = (error as Error).message
      setReviewError(code === 'INVALID_DRAFT'
        ? t(language, 'Invalid proposal draft; it cannot be approved.')
        : t(language, 'Admin review action failed. Refresh and check the pending queue.'))
    } finally {
      setReviewingId(null)
      setConfirmRejectId(null)
    }
  }
  useEffect(() => { void load() }, [])
  return <Shell title="Learning intelligence" subtitle="A clear operational view of evidence, recommendations, and controls." tabs={['Overview', 'Recommendations', 'Settings']} tab="Overview" setTab={() => {}}>
    <State state={state} retry={load}/>
    {state === 'ready' && <div className={styles.grid}>
      <section className={styles.card}><h2>{t(language, 'Overview')}</h2><p className={styles.muted}>{data.overview?.pendingRecommendations} {t(language, 'pending recommendations')} · {data.overview?.teacherSuggestions} {t(language, 'teacher drafts')}</p></section>
      <section className={styles.card}><h2>{t(language, 'Recommendations')}</h2>{data.recommendations.map((item: any) => <div className={styles.item} key={item.id}>{item.student?.name || item.studentId} · {item.title || item.type} · {statusText(language, item.status)}</div>)}</section>
      <section className={`${styles.card} ${styles.wide}`} data-testid="admin-ai-proposal-queue">
        <div className={styles.row}><div><div className={styles.kicker}>{t(language, 'Reviewed by admin')}</div><h2>{t(language, 'Provider proposal review')}</h2></div><span className={styles.tag}>{data.suggestions.filter((item: any) => item.status === 'PENDING_REVIEW').length}</span></div>
        <p className={styles.muted}>{t(language, 'AI proposal approval creates a student recommendation; rejection does not.')}</p>
        <p className={styles.muted}>{t(language, 'Manual teacher suggestions are not handled in this AI proposal queue.')}</p>
        {reviewError && <div className={styles.error} role="alert" data-testid="admin-proposal-review-error">{reviewError}</div>}
        {data.suggestions.length === 0
          ? <div className={styles.empty} data-testid="admin-proposal-queue-empty">{t(language, 'No pending provider drafts. Generate proposals to create a new review batch.')}</div>
          : <div className={styles.adminReviewList}>{data.suggestions.map((item: any) => <article className={styles.adminProposal} key={item.id} data-testid="admin-ai-proposal">
            <div className={styles.row}>
              <div><span className={styles.tag}>{item.proposal?.type || 'AI_RECOMMENDATION'}</span><span className={styles.tag}>{statusText(language, item.status)}</span></div>
              {item.materialized && <span className={styles.materializedTag}>{t(language, 'Recommendation created')}</span>}
            </div>
            <h3>{item.proposal?.title || t(language, 'Invalid proposal draft; it cannot be approved.')}</h3>
            {item.proposal?.reason && <p className={styles.muted}>{item.proposal.reason}</p>}
            {item.invalidDraft && <p className={styles.error}>{t(language, 'Invalid proposal draft; it cannot be approved.')}</p>}
            <dl className={styles.proposalMeta}>
              <div><dt>{t(language, 'Student')}</dt><dd>{item.student?.name || item.studentId}</dd></div>
              <div><dt>{t(language, 'Teacher')}</dt><dd>{item.teacherId}</dd></div>
              {item.createdAt && <div><dt>{t(language, 'Created')}</dt><dd>{new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}</dd></div>}
            </dl>
            {item.status === 'APPROVED' && <p className={styles.reviewOutcome} role="status">{t(language, 'Approved and added to student recommendations.')}</p>}
            {item.status === 'REJECTED' && <p className={styles.reviewOutcome} role="status">{t(language, 'Rejected. No student recommendation was created.')}</p>}
            {item.status === 'PENDING_REVIEW' && <div className={styles.actions}>
              <button className={`${styles.button} ${styles.primary}`} disabled={Boolean(reviewingId) || item.invalidDraft} onClick={() => void reviewSuggestion(item, 'APPROVE')} data-testid={`admin-approve-proposal-${item.id}`}>
                {reviewingId === item.id ? t(language, 'Reviewing…') : t(language, 'Approve')}
              </button>
              {confirmRejectId === item.id
                ? <><span className={styles.muted}>{t(language, 'Confirm rejection')}?</span><button className={styles.button} disabled={Boolean(reviewingId)} onClick={() => void reviewSuggestion(item, 'REJECT')}>{t(language, 'Confirm rejection')}</button><button className={styles.button} disabled={Boolean(reviewingId)} onClick={() => setConfirmRejectId(null)}>{t(language, 'Keep proposal')}</button></>
                : <button className={styles.button} disabled={Boolean(reviewingId)} onClick={() => setConfirmRejectId(item.id)} data-testid={`admin-reject-proposal-${item.id}`}>{t(language, 'Reject')}</button>}
            </div>}
          </article>)}</div>}
      </section>
      <section className={styles.card}><h2>{t(language, 'Service status')}</h2><p className={styles.muted}>{data.settings?.mode}</p><div className={styles.notice}>{t(language, 'AI proposal approval creates a student recommendation; rejection does not.')}</div></section>
    </div>}
  </Shell>
}