'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  Target,
} from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

type ResourceState = 'loading' | 'ready' | 'unavailable' | 'error'
type Resource = { state: ResourceState; data?: unknown }
type ClassItem = {
  id?: string | number
  title?: string
  name?: string
  sessionTitle?: string
  startTime?: string
  status?: string
  group?: { name?: string; nameAr?: string | null } | null
  TeacherProfile?: { User?: { name?: string | null } | null } | null
}
type HomeworkItem = { id?: string | number; title?: string; name?: string; assignmentTitle?: string; status?: string }
type FeedbackItem = { summary?: string | null; session?: { title?: string | null } | null }
type LearningStep = { status?: string; title?: string; reason?: string }
type LearningToday = {
  session?: { steps?: LearningStep[] | null } | null
  plan?: { steps?: LearningStep[] | null; status?: string | null } | null
}
type LearningProfile = {
  goal?: string | null
  officialLevel?: { name?: string | null } | null
  officialStage?: { name?: string | null } | null
  mastery?: unknown[] | null
}
type RecommendationItem = { title?: string | null; status?: string | null; reason?: string | null }
type Snapshot = Record<'classes' | 'homework' | 'feedback' | 'today' | 'profile' | 'recommendations', Resource>

const loadingResource: Resource = { state: 'loading' }
const urls = [
  '/api/student/classes',
  '/api/student/homework',
  '/api/student/feedback',
  '/api/student/learning/today',
  '/api/student/learning/profile',
  '/api/student/learning/recommendations',
] as const

function getErrorCode(body: unknown) {
  if (!body || typeof body !== 'object') return ''
  const data = body as { code?: unknown; error?: { code?: unknown } }
  return String(data.error?.code || data.code || '')
}

async function loadResource(url: string): Promise<Resource> {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    const body: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      return response.status === 503 && getErrorCode(body) === 'DATABASE_UNAVAILABLE'
        ? { state: 'unavailable' }
        : { state: 'error' }
    }
    return { state: 'ready', data: body }
  } catch {
    return { state: 'error' }
  }
}

function getItems<T extends object>(data: unknown): T[] {
  if (Array.isArray(data)) return data.filter((item): item is T => Boolean(item) && typeof item === 'object')
  const container = data && typeof data === 'object' ? data as { items?: unknown } : undefined
  return Array.isArray(container?.items)
    ? container.items.filter((item): item is T => Boolean(item) && typeof item === 'object')
    : []
}

function getLabel(item: { title?: string; name?: string; sessionTitle?: string; assignmentTitle?: string }, language: 'ar' | 'en') {
  return String(item.title || item.name || item.sessionTitle || item.assignmentTitle || localeText(language, 'عنصر تعلّم', 'Learning item'))
}

function formatDate(value: string | Date | null | undefined, language: 'ar' | 'en') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ''
  return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      className="min-w-0 rounded-2xl border p-5 sm:p-6"
      style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function ResourceMessage({ resource, retry, language }: { resource: Resource; retry: () => void; language: 'ar' | 'en' }) {
  if (resource.state === 'loading') {
    return <div className="h-16 animate-pulse rounded-xl" style={{ background: 'var(--surface-muted)' }} aria-label={localeText(language, 'جارٍ التحميل', 'Loading')} aria-busy="true" />
  }
  if (resource.state === 'unavailable') {
    return <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>{localeText(language, 'الخدمة غير متاحة حالياً. حاول مرة أخرى لاحقاً.', 'This service is currently unavailable. Please try again later.')}</p>
  }
  if (resource.state === 'error') {
    return (
      <div role="alert">
        <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>{localeText(language, 'تعذر تحميل هذه المعلومات. لن نعرض بيانات غير مؤكدة.', 'Could not load this information. We will not show unverified data.')}</p>
        <button type="button" onClick={retry} className="mt-2 min-h-11 text-sm font-bold underline underline-offset-4" style={{ color: 'var(--primary)' }}>
          {localeText(language, 'إعادة المحاولة', 'Try again')}
        </button>
      </div>
    )
  }
  return null
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>
      {children}<ArrowLeft size={15} aria-hidden="true" />
    </Link>
  )
}

export default function RedesignedHomeTab() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [snapshot, setSnapshot] = useState<Snapshot>({
    classes: loadingResource,
    homework: loadingResource,
    feedback: loadingResource,
    today: loadingResource,
    profile: loadingResource,
    recommendations: loadingResource,
  })
  const [now, setNow] = useState(0)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true
    void Promise.all(urls.map(loadResource)).then(([classes, homework, feedback, today, profile, recommendations]) => {
      if (!active) return
      setSnapshot({ classes, homework, feedback, today, profile, recommendations })
      setNow(Date.now())
    })
    return () => { active = false }
  }, [retryKey])

  const retry = () => {
    setSnapshot({
      classes: loadingResource,
      homework: loadingResource,
      feedback: loadingResource,
      today: loadingResource,
      profile: loadingResource,
      recommendations: loadingResource,
    })
    setNow(Date.now())
    setRetryKey((key) => key + 1)
  }

  const classes = getItems<ClassItem>(snapshot.classes.data)
  const nextClass = classes
    .map((item) => ({ item, startsAt: item.startTime ? new Date(item.startTime).valueOf() : Number.NaN }))
    .filter((entry) => Number.isFinite(entry.startsAt) && entry.startsAt >= now)
    .sort((left, right) => left.startsAt - right.startsAt)[0]?.item
  const homework = getItems<HomeworkItem>(snapshot.homework.data)
  const pendingHomework = homework.filter((item) => ['OPEN', 'SUBMITTED'].includes(String(item.status || '').toUpperCase()))
  const feedback = getItems<FeedbackItem>(snapshot.feedback.data)[0]
  const today = snapshot.today.data as LearningToday | undefined
  const planSteps = today?.session?.steps || today?.plan?.steps || []
  const nextStep = planSteps.find((step) => !['COMPLETED', 'SKIPPED'].includes(String(step.status || '').toUpperCase()))
  const profile = (snapshot.profile.data as { profile?: LearningProfile } | undefined)?.profile
  const recommendations = getItems<RecommendationItem>(snapshot.recommendations.data)
  const recommendation = recommendations.find((item) => String(item.status || '').toUpperCase() === 'PENDING')
  const masteryCount = profile?.mastery?.length || 0
  const hasProgress = Boolean(profile?.officialLevel || profile?.officialStage || masteryCount)
  const hasTodayPlan = Boolean(today?.plan?.steps?.length || today?.session?.steps?.length)

  const actionTitle = recommendation?.title || nextStep?.title || today?.plan?.status
  const actionReason = recommendation?.reason || nextStep?.reason
  const actionHref = recommendation ? '/dashboard/student/learning?view=Recommendations' : '/dashboard/student/learning'
  const actionResource = recommendation ? snapshot.recommendations : snapshot.today
  const isActionPending = actionResource.state === 'loading'
  const isActionError = actionResource.state === 'error' || actionResource.state === 'unavailable'

  return (
    <div className="space-y-5 sm:space-y-6" dir={localeDirection(language)}>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{t('مساحتك التعليمية', 'Your learning space')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{t('تعلّمك اليوم', 'Your learning today')}</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>{t('خطوة واحدة واضحة، ثم واصل من حيث توقفت.', 'One clear step at a time. Pick up where you left off.')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(profile?.officialLevel?.name || profile?.officialStage?.name) && (
            <span className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}>
              {[profile.officialLevel?.name, profile.officialStage?.name].filter(Boolean).join(' · ')}
            </span>
          )}
          <Link href="/dashboard/student/learning" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white" style={{ background: 'var(--primary)' }}>
            {t('خطتي التعليمية', 'My learning plan')} <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={t('ملخص التعلم', 'Learning summary')}>
        {[
          { icon: CalendarDays, label: t('الحصة القادمة', 'Next class'), value: nextClass ? formatDate(nextClass.startTime, language) : snapshot.classes.state === 'loading' ? t('جارٍ التحميل', 'Loading') : t('لا توجد حصة قادمة', 'No upcoming class'), href: '/dashboard/student/classes' },
          { icon: ClipboardCheck, label: t('واجبات تحتاج متابعة', 'Homework to follow up'), value: snapshot.homework.state === 'loading' ? t('جارٍ التحميل', 'Loading') : String(pendingHomework.length), href: '/dashboard/student/homework' },
          { icon: MessageSquareText, label: t('ملاحظات المدرس', 'Teacher feedback'), value: snapshot.feedback.state === 'loading' ? t('جارٍ التحميل', 'Loading') : feedback ? t('لديك ملاحظة منشورة', 'You have published feedback') : t('لا توجد ملاحظات جديدة', 'No new feedback'), href: '/dashboard/student/feedback' },
          { icon: BookOpen, label: t('تقدّمك المسجل', 'Recorded progress'), value: snapshot.profile.state === 'loading' ? t('جارٍ التحميل', 'Loading') : hasProgress ? `${masteryCount} ${t('مهارات مسجلة', 'skills recorded')}` : t('بانتظار تسجيل التقدم', 'Waiting for progress to be recorded'), href: '/dashboard/student/learning' },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="min-h-[118px] rounded-2xl border p-4 transition-colors hover:bg-[var(--surface-muted)]" style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}><Icon size={19} aria-hidden="true" /></span>
              <ArrowLeft size={15} style={{ color: 'var(--muted)' }} aria-hidden="true" />
            </div>
            <p className="mt-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="mt-1 truncate text-sm font-bold">{value}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border p-5 sm:p-7" style={{ background: 'var(--bf-green-soft)', borderColor: 'var(--border)' }} aria-labelledby="student-next-step">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--primary)' }}>
              <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: 'var(--surface)', color: 'var(--primary)' }}>
                {recommendation ? <Target size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
              </span>
              {recommendation ? t('توصية لك', 'Recommended for you') : t('الخطوة التالية', 'Next step')}
            </div>
            <h2 id="student-next-step" className="text-xl font-bold leading-8 sm:text-2xl">
              {isActionPending ? t('نجهّز خطوتك التالية', 'Preparing your next step') : actionTitle || t('لا توجد خطوة جديدة اليوم', 'No new steps today')}
            </h2>
            {actionReason && <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--muted)' }}>{actionReason}</p>}
            {isActionPending && <div role="status" aria-busy="true" aria-label={t('جارٍ تحميل خطوة التعلّم', 'Loading your learning step')} className="mt-4 h-3 w-48 animate-pulse rounded" style={{ background: 'var(--border)' }} />}
            {isActionError && (
              <div role="alert" className="mt-3">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('تعذر تحميل خطوتك الآن. لم نعرض بيانات غير مؤكدة.', 'Could not load your step. No unverified data was shown.')}</p>
                <button type="button" onClick={retry} className="mt-2 min-h-11 text-sm font-bold underline underline-offset-4" style={{ color: 'var(--primary)' }}>{t('إعادة المحاولة', 'Try again')}</button>
              </div>
            )}
            {!isActionPending && !isActionError && !actionTitle && <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{t('يمكنك الرجوع إلى خطتك التعليمية لاختيار ما تتابعه.', 'Return to your learning plan to choose what to work on.')}</p>}
          </div>
          {!isActionPending && !isActionError && actionTitle && (
            <Link href={actionHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white" style={{ background: 'var(--primary)' }}>
              {t('ابدأ الآن', 'Get started')} <ArrowLeft size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title={t('الحصة القادمة', 'Next class')} action={<TextLink href="/dashboard/student/classes">{t('كل الحصص', 'All classes')}</TextLink>}>
          <ResourceMessage resource={snapshot.classes} retry={retry} language={language} />
          {snapshot.classes.state === 'ready' && !nextClass && <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('لا توجد حصة قادمة مسجلة.', 'No upcoming class is scheduled.')}</p>}
          {snapshot.classes.state === 'ready' && nextClass && (
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 shrink-0" size={19} style={{ color: 'var(--primary)' }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-bold">{getLabel(nextClass, language)}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{formatDate(nextClass.startTime, language)}</p>
                {nextClass.TeacherProfile?.User?.name && <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{t('المدرس: ', 'Teacher: ')}{nextClass.TeacherProfile.User.name}</p>}
                {nextClass.group?.nameAr && <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{t('المجموعة: ', 'Group: ')}{nextClass.group.name}</p>}
              </div>
            </div>
          )}
        </Panel>

        <Panel title={t('الواجبات المطلوبة', 'Required homework')} action={<TextLink href="/dashboard/student/homework">{t('عرض الواجبات', 'View homework')}</TextLink>}>
          <ResourceMessage resource={snapshot.homework} retry={retry} language={language} />
          {snapshot.homework.state === 'ready' && !pendingHomework.length && <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('لا توجد واجبات بانتظارك.', 'You have no pending homework.')}</p>}
          {snapshot.homework.state === 'ready' && pendingHomework.length > 0 && (
            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {pendingHomework.slice(0, 4).map((item, index) => (
                <li key={String(item.id || index)} className="flex min-h-12 items-center justify-between gap-3 py-2">
                    <span className="min-w-0 text-sm font-semibold">{getLabel(item, language)}</span>
                  <span className="shrink-0 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}>
                    {String(item.status).toUpperCase() === 'SUBMITTED' ? t('تم التسليم', 'Submitted') : t('مطلوب', 'Required')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t('تقدّم التعلّم', 'Learning progress')} action={<TextLink href="/dashboard/student/learning">{t('التفاصيل', 'Details')}</TextLink>}>
          <ResourceMessage resource={snapshot.profile} retry={retry} language={language} />
          {snapshot.profile.state === 'ready' && !hasProgress && <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('سيظهر تقدمك هنا بعد تسجيل بيانات التعلّم.', 'Your progress will appear here once learning data is recorded.')}</p>}
          {snapshot.profile.state === 'ready' && hasProgress && (
            <div className="flex items-start gap-3">
              <BookOpen className="mt-1 shrink-0" size={19} style={{ color: 'var(--primary)' }} aria-hidden="true" />
              <div>
                <p className="font-bold">{profile?.officialLevel?.name || t('المستوى غير محدد', 'Level not specified')}{profile?.officialStage?.name ? ` · ${profile.officialStage.name}` : ''}</p>
                {masteryCount > 0 && <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{masteryCount} {t('مهارات لها بيانات تقدّم', 'skills with progress data')}</p>}
              </div>
            </div>
          )}
          {profile?.goal && <p className="mt-4 flex items-start gap-2 text-sm leading-6"><Target className="mt-1 shrink-0" size={17} style={{ color: 'var(--primary)' }} aria-hidden="true" />{profile.goal}</p>}
        </Panel>

        <Panel title={t('ملاحظات المدرس', 'Teacher feedback')} action={<TextLink href="/dashboard/student/feedback">{t('كل الملاحظات', 'All feedback')}</TextLink>}>
          <ResourceMessage resource={snapshot.feedback} retry={retry} language={language} />
          {snapshot.feedback.state === 'ready' && !feedback && <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('لا توجد ملاحظات منشورة بعد.', 'No feedback has been published yet.')}</p>}
          {snapshot.feedback.state === 'ready' && feedback && (
            <div className="flex items-start gap-3">
              <MessageSquareText className="mt-1 shrink-0" size={19} style={{ color: 'var(--primary)' }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm leading-6">{feedback.summary || t('تتوفر ملاحظات من حصتك الأخيرة.', 'Feedback from your last class is available.')}</p>
                {feedback.session?.title && <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>{feedback.session.title}</p>}
              </div>
            </div>
          )}
        </Panel>

        {hasTodayPlan && nextStep && (
          <Panel title={t('خطة اليوم', 'Today’s plan')} action={<TextLink href="/dashboard/student/learning">{t('افتح الخطة', 'Open plan')}</TextLink>}>
            <div className="flex items-start gap-3">
              <ClipboardCheck className="mt-1 shrink-0" size={19} style={{ color: 'var(--primary)' }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-bold">{nextStep.title || t('خطوة التعلّم التالية', 'Next learning step')}</p>
                {nextStep.reason && <p className="mt-1 text-sm leading-6" style={{ color: 'var(--muted)' }}>{nextStep.reason}</p>}
              </div>
            </div>
          </Panel>
        )}
      </section>
    </div>
  )
}