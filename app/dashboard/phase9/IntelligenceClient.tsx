'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import type React from 'react'
import styles from './intelligence.module.css'
import { BFButton } from '@/components/bf'

type Load = 'loading' | 'ready' | 'error' | 'database'
const api = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, { ...options, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error?.code || body?.error?.message || 'ERROR')
  return body
}
const studentLearningTabs = ['Today', 'Recommendations', 'Progress', 'Goals', 'Learning Profile']
function State({ state, retry }: { state: Load; retry: () => void }) {
  if (state === 'loading') return <div className={styles.grid}>{[1, 2, 3].map((x) => <div className={`${styles.card} ${styles.skeleton}`} key={x} />)}</div>
  if (state === 'database') return <div className={`${styles.notice} ${styles.blocked}`}><b>Database unavailable</b><p>Records are not available. Nothing will be persisted.</p></div>
  if (state === 'error') return <div className={styles.error}>This view could not be loaded. <button className={styles.button} onClick={retry}>Retry</button></div>
  return null
}
function Shell({ children, title, subtitle, tabs, tab, setTab }: { children: React.ReactNode; title: string; subtitle: string; tabs: string[]; tab: string; setTab: (tab: string) => void }) {
  return <main className={styles.shell}><div className={styles.wrap}><header className={styles.top}><div><div className={styles.kicker}>B Fluent EDU / learning intelligence</div><h1>{title}</h1><p className={styles.muted}>{subtitle}</p></div></header><nav className={styles.tabs} aria-label="Learning views">{tabs.map((item) => <button key={item} aria-current={tab === item ? 'page' : undefined} onClick={() => setTab(item)}>{item}</button>)}</nav>{children}</div></main>
}

export function StudentLearning() {
  const [tab, setTab] = useState(studentLearningTabs[0]); const [state, setState] = useState<Load>('loading'); const [data, setData] = useState<any>({})
  const [tabInitialized, setTabInitialized] = useState(false)
  const load = useCallback(async () => { setState('loading'); try { const url = tab === 'Today' ? '/api/student/learning/today' : tab === 'Recommendations' ? '/api/student/learning/recommendations' : '/api/student/learning/profile'; const result = await api(url); setData(result?.profile && Array.isArray(result.profile.mastery) ? { ...result, mastery: result.profile.mastery } : result); setState('ready') } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }, [tab])
  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get('view')
    if (requestedView && studentLearningTabs.includes(requestedView)) setTab(requestedView)
    setTabInitialized(true)
  }, [])
  useEffect(() => { if (tabInitialized) void load() }, [load, tabInitialized])
  const post = async (url: string, body?: any) => { try { await api(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }); void load() } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const plan = data.plan; const steps = data.session?.steps?.map((step: any, index: number) => ({ ...step, ...(plan?.steps?.[index] || {}) })) || plan?.steps || []
  return <Shell title="Your learning, today" subtitle="A short plan shaped by what happened in your classes." tabs={studentLearningTabs} tab={tab} setTab={setTab}><State state={state} retry={load} />
    {state === 'ready' && tab === 'Today' && <section className={styles.card}><div className={styles.kicker}>{data.session?.status || 'NOT_STARTED'}</div><h2>Daily plan · {plan?.status || 'NOT_READY'}</h2><p className={styles.muted}>{plan?.status === 'READY' ? 'A focused set of steps from your class evidence.' : 'A plan will appear when enough evidence and resources are available.'}</p><b>{plan?.totalMinutes || 0} minutes</b>{!data.session && plan?.steps?.length > 0 && <div className={styles.actions}><button className={`${styles.button} ${styles.primary}`} onClick={() => post('/api/student/learning/today/start')}>Start today</button></div>}{steps.map((step: any, index: number) => <div className={styles.item} key={step.stepIndex ?? index}><div className={styles.row}><b>{(step.stepIndex ?? index) + 1}. {step.title || step.type}</b><span className={styles.tag}>{step.status || 'PENDING'}</span></div><p className={styles.muted}>{[step.reason, step.skillCode, step.resourceId && `Resource ${step.resourceId}`, step.durationMinutes && `${step.durationMinutes} min`].filter(Boolean).join(' · ')}</p>{step.status === 'PENDING' && step.stepIndex === data.session?.currentStepIndex && <button className={styles.button} onClick={() => post('/api/student/learning/today/progress', { action: 'START_STEP', stepIndex: step.stepIndex })}>Begin</button>}{step.status === 'IN_PROGRESS' && <button className={`${styles.button} ${styles.primary}`} onClick={() => post('/api/student/learning/today/progress', { action: 'COMPLETE_STEP', stepIndex: step.stepIndex })}>Mark complete</button>}</div>)}</section>}
    {state === 'ready' && tab === 'Recommendations' && <RecommendationList items={data.items || []} post={post} />}
    {state === 'ready' && tab === 'Progress' && <section className={styles.card}><h2>Progress by skill</h2>{data.mastery?.length ? data.mastery.map((item: any, index: number) => <div className={styles.item} key={`${item.skill?.code || 'skill'}-${item.levelId || ''}-${item.stageId || ''}-${index}`}><div className={styles.row}><b>{item.skill?.name || item.skill?.code || 'Skill'}</b><span>{item.evidence?.score ?? 'No score'}</span></div><p className={styles.muted}>{[item.levelId, item.stageId, item.evidence?.evidenceCount && `${item.evidence.evidenceCount} pieces of evidence`, item.evidence?.source].filter(Boolean).join(' · ')}</p></div>) : <div className={styles.empty}>Progress will appear after completed learning.</div>}</section>}
    {state === 'ready' && tab === 'Goals' && <GoalsPanel goal={data.profile?.goal || ''} goals={data.profile?.goals || []} onSave={async (value) => {
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
    }} />}
    {state === 'ready' && tab === 'Learning Profile' && <Profile profile={data.profile || {}} />}
  </Shell>
}
function GoalsPanel({ goal, goals, onSave }: { goal: string; goals: Array<{ id?: string; title?: string }>; onSave: (value: string) => Promise<void> }) {
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
      setMessage('Your goal has been saved.')
    } catch {
      setMessage('Your goal could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return <section className={styles.card}>
    <h2>Current goal</h2>
    <form onSubmit={submit}>
      <label htmlFor="student-overall-goal">What would you like to achieve?</label>
      <textarea
        id="student-overall-goal"
        maxLength={1000}
        rows={4}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-describedby="student-goal-help"
      />
      <p id="student-goal-help" className={styles.muted}>You can update this goal at any time.</p>
      <div className={styles.actions}>
        <BFButton type="submit" disabled={saving || draft.trim() === goal.trim()}>
          {saving ? 'Saving…' : 'Save goal'}
        </BFButton>
      </div>
      {message && <p role="status" aria-live="polite" className={styles.muted}>{message}</p>}
    </form>
    {goals.length > 0 && <div className={styles.list}>
      <h3>Saved goals</h3>
      {goals.map((item, index) => <div className={styles.item} key={item.id || `${item.title || 'goal'}-${index}`}>{item.title || 'Saved goal'}</div>)}
    </div>}
  </section>
}
function RecommendationList({ items, post }: { items: any[]; post: (url: string, body?: any) => void }) { return <div className={styles.list}>{!items.length && <div className={styles.empty}>No recommendations are available yet.</div>}{items.map((item) => <article className={styles.item} key={item.id}><div className={styles.row}><b>{item.title || 'Practice suggestion'}</b><span className={styles.tag}>{item.status}</span></div><p className={styles.muted}>{item.reason}</p>{item.status === 'PENDING' && <div className={styles.actions}><button className={`${styles.button} ${styles.primary}`} onClick={() => post(`/api/student/learning/recommendations/${item.id}/accept`)}>Keep this</button><button className={styles.button} onClick={() => post(`/api/student/learning/recommendations/${item.id}/dismiss`)}>Dismiss</button></div>}</article>)}</div> }
function Profile({ profile }: { profile: any }) { return <section className={styles.card}><h2>Learning profile</h2><p className={styles.muted}>Level: {profile.officialLevel?.name || 'Not recorded'} · Stage: {profile.officialStage?.name || 'Not recorded'}</p>{profile.goal && <div className={styles.item}><b>Current goal</b><p>{profile.goal}</p></div>}{profile.targetSkills?.length > 0 && <div className={styles.item}><b>Focus areas</b><p>{profile.targetSkills.map((skill: any) => skill.name || skill.code || skill).join(', ')}</p></div>}</section> }

const draftFields: Record<string, string[]> = { FEEDBACK_EXPRESSION: ['expression', 'meaning', 'example', 'category'], MISTAKE: ['original', 'correction', 'explanation'], EBI: ['betterExpression', 'explanation', 'priority'] }
function safeDraft(draft: any) { return Object.fromEntries((draftFields[draft.type] || []).map((key) => [key, String(draft[key] || '').trim()]).filter((entry) => entry[1])) }
export function TeacherIntelligence() {
  const [id, setId] = useState(''); const [student, setStudent] = useState<any>(null); const [state, setState] = useState<Load>('ready'); const [drafts, setDrafts] = useState<any[]>([]); const [draft, setDraft] = useState<any>({ type: 'FEEDBACK_EXPRESSION', reason: '' })
  const lookup = async () => { setStudent(null); setState('loading'); try { setStudent(await api(`/api/teacher/intelligence/students/${encodeURIComponent(id)}`)); setState('ready') } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const create = async () => { try { const response = await api('/api/teacher/intelligence/suggestions', { method: 'POST', body: JSON.stringify({ studentId: id, type: draft.type, reason: draft.reason, draft: safeDraft(draft) }) }); const item = response?.item ?? response; setDrafts((current) => [...current, item]) } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  const approve = async (item: any) => { try { const response = await api(`/api/teacher/intelligence/suggestions/${item.id}/approve`, { method: 'POST', body: JSON.stringify({ approved: true }) }); const result = response?.item ?? response; setDrafts((current) => current.map((draftItem) => draftItem.id === item.id ? { ...draftItem, ...result, status: result.status } : draftItem)); await lookup() } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }
  return <Shell title="Student intelligence" subtitle="Review class evidence and decide what is worth sharing." tabs={['Assigned student']} tab="Assigned student" setTab={() => {}}><div className={styles.card}><input value={id} onChange={(event) => setId(event.target.value)} placeholder="Assigned student ID" /><button className={`${styles.button} ${styles.primary}`} disabled={!id} onClick={lookup}>Look up student</button></div><State state={state} retry={lookup}/>{state === 'ready' && student && <div className={styles.grid}><section className={styles.card}><h2>{student.student?.name || id}</h2><p className={styles.muted}>Evidence from this assigned student only.</p>{(student.signals || []).slice(0, 8).map((signal: any) => <div className={styles.item} key={signal.id}>{signal.evidence?.expression || signal.evidence?.original || signal.topicKey || signal.type}</div>)}</section><section className={styles.card}><h2>Suggestion draft</h2><select value={draft.type} onChange={(event) => setDraft({ type: event.target.value, reason: '' })}>{Object.keys(draftFields).map((type) => <option key={type} value={type}>{type}</option>)}</select><textarea placeholder="Reason" value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })}/>{draftFields[draft.type].map((field) => <input key={field} placeholder={field} value={draft[field] || ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}/>)}<button className={`${styles.button} ${styles.primary}`} onClick={create}>Save draft</button>{drafts.map((item) => <div className={styles.item} key={item.id}><span className={styles.tag}>{item.status}</span>{item.status === 'DRAFT' && <button className={styles.button} onClick={() => approve(item)}>Approve explicitly</button>}</div>)}</section></div>}</Shell>
}
export function AdminIntelligence() { const [state, setState] = useState<Load>('loading'); const [data, setData] = useState<any>({}); const load = async () => { try { const [overview, recommendations, settings] = await Promise.all([api('/api/admin/intelligence/overview'), api('/api/admin/intelligence/recommendations'), api('/api/admin/intelligence/settings')]); setData({ overview, recommendations: recommendations.items || [], settings }); setState('ready') } catch (error) { setState((error as Error).message === 'DATABASE_UNAVAILABLE' ? 'database' : 'error') } }; useEffect(() => { void load() }, []); return <Shell title="Learning intelligence" subtitle="A clear operational view of evidence, recommendations, and controls." tabs={['Overview', 'Recommendations', 'Settings']} tab="Overview" setTab={() => {}}><State state={state} retry={load}/>{state === 'ready' && <div className={styles.grid}><section className={styles.card}><h2>Overview</h2><p className={styles.muted}>{data.overview?.pendingRecommendations} pending recommendations · {data.overview?.teacherSuggestions} teacher drafts</p></section><section className={styles.card}><h2>Recommendations</h2>{data.recommendations.map((item: any) => <div className={styles.item} key={item.id}>{item.student?.name || item.studentId} · {item.title || item.type} · {item.status}</div>)}</section><section className={styles.card}><h2>Service status</h2><p className={styles.muted}>{data.settings?.mode}</p><div className={styles.notice}>Provider unavailable. Teacher approval only changes a draft to APPROVED; it does not create student records.</div></section></div>}</Shell> }