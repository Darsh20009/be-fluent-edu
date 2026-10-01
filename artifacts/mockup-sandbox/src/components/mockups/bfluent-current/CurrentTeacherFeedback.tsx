import { useState } from 'react'
import styles from './phase4.module.css'
import './_group.css'

type FeedbackItem = {
  id: string
  title: string
  status: string
  publishedAt?: string
  summary: string
  sessionTitle?: string
}

const recentDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const feedbackItems: FeedbackItem[] = [
  {
    id: 'feedback-2408',
    title: 'Everyday conversation: making plans',
    status: 'COMPLETED',
    publishedAt: recentDate(1),
    summary: 'Learner used clear question forms and responded confidently. Review the difference between “will” and “going to” before the next class.',
    sessionTitle: 'Intermediate group · Session 24',
  },
  {
    id: 'feedback-2396',
    title: 'Talking about past experiences',
    status: 'COMPLETED',
    publishedAt: recentDate(3),
    summary: 'Good use of past-tense verbs in the discussion. Continue practising irregular forms and adding details to longer answers.',
    sessionTitle: 'Speaking practice · Session 23',
  },
]

const ebiItems: FeedbackItem[] = [
  {
    id: 'ebi-014',
    title: 'Giving a more natural response',
    status: 'APPROVED',
    publishedAt: recentDate(4),
    summary: 'Use “That sounds like a great idea” to respond naturally when agreeing with a suggestion.',
  },
]

const mistakeItems: FeedbackItem[] = [
  {
    id: 'mistake-031',
    title: 'Past simple: irregular verbs',
    status: 'APPROVED',
    publishedAt: recentDate(6),
    summary: 'Use “went” rather than “goed” when describing a completed action in the past.',
  },
]

const tabs = ['Completed sessions', 'EBI Library', 'Mistake Library'] as const

function detail(item: FeedbackItem) {
  const date = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''
  return [item.status, date].filter(Boolean).join(' · ')
}

export default function CurrentTeacherFeedback() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0])
  const visibleItems = activeTab === 'EBI Library'
    ? ebiItems
    : activeTab === 'Mistake Library'
      ? mistakeItems
      : feedbackItems

  return (
    <main className={`${styles.shell} bfluent-current-teacher`} dir="rtl">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}>Teacher workspace · phase 7</div>
            <h1 className={styles.title}>Feedback</h1>
            <p className={styles.muted}>Draft feedback from completed sessions and approved libraries.</p>
          </div>
          <nav className={styles.nav} aria-label="Teacher navigation">
            <a href="#my-classes">My classes</a>
            <a href="#qmeet">QMeet</a>
            <a href="#feedback" aria-current="page">Feedback</a>
            <a href="#homework">Homework</a>
            <a href="#my-students">My students</a>
            <a href="#learning-intelligence">Learning intelligence</a>
            <a href="#speaking">Speaking</a>
            <a href="#legacy-dashboard">Legacy dashboard</a>
          </nav>
        </header>

        <section>
          <div className={styles.sectionNav} role="tablist" aria-label="feedback views">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                data-testid={`tab-${tab.toLowerCase().replaceAll(' ', '-')}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {visibleItems.length === 0 ? (
            <div className={styles.empty} data-testid="state-empty">
              <strong>Nothing here yet</strong>
              <br />
              When records are available, they will appear in this view.
            </div>
          ) : (
            <div className={styles.grid} data-testid="learning-list">
              {visibleItems.map((item) => (
                <article className={styles.card} key={item.id} data-testid={`learning-card-${item.id}`}>
                  <div className={styles.eyebrow}>{detail(item) || 'Feedback record'}</div>
                  <h2>{item.title}</h2>
                  <p className={styles.muted}>{item.summary}</p>
                  {item.sessionTitle && <p className={styles.muted}>{item.sessionTitle}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}