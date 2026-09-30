'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CalendarDays, ClipboardCheck, MessageSquareText, Target } from 'lucide-react'
import {
  BFButton,
  BFCard,
  BFBadge,
  BFEmptyState,
  BFErrorState,
  BFPageHeader,
} from '@/components/bf'

type ResourceState = 'loading' | 'ready' | 'unavailable' | 'error'
type Resource<T> = { state: ResourceState; data?: T }
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
type Snapshot = {
  classes: Resource<unknown>
  homework: Resource<unknown>
  feedback: Resource<unknown>
  today: Resource<unknown>
  profile: Resource<unknown>
  recommendations: Resource<unknown>
}

const loadingResource: Resource<unknown> = { state: 'loading' }

function getErrorCode(body: unknown) {
  if (!body || typeof body !== 'object') return ''
  const data = body as { code?: unknown; error?: { code?: unknown } }
  return String(data.error?.code || data.code || '')
}

async function loadResource(url: string): Promise<Resource<unknown>> {
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
  if (Array.isArray(container?.items)) return container.items.filter((item): item is T => Boolean(item) && typeof item === 'object')
  return []
}

function getLabel(item: { title?: string; name?: string; sessionTitle?: string; assignmentTitle?: string }) {
  return String(item.title || item.name || item.sessionTitle || item.assignmentTitle || 'عنصر تعلّم')
}

function formatDate(value?: string | Date | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ''
  return date.toLocaleString('ar', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function PanelCard({
  title,
  description,
  resource,
  empty,
  emptyMessage,
  retry,
  children,
}: {
  title: string
  description?: string
  resource: Resource<unknown>
  empty: boolean
  emptyMessage: string
  retry: () => void
  children: ReactNode
}) {
  return (
    <BFCard className="min-w-0 p-5 sm:p-6">
      <h2 className="text-base font-bold text-[#252238]">{title}</h2>
      {description && <p className="mt-1 text-sm leading-6 text-[#687080]">{description}</p>}
      <div className="mt-4">
        {resource.state === 'loading' && (
          <div className="h-20 rounded-lg bg-[#efedf1]" aria-label="جارٍ التحميل" aria-busy="true" />
        )}
        {resource.state === 'unavailable' && (
          <BFEmptyState title="الخدمة غير متاحة حالياً" description="تعذر الوصول إلى بيانات التعلّم الآن. حاول مرة أخرى لاحقاً." />
        )}
        {resource.state === 'error' && (
          <BFErrorState
            title="تعذر تحميل هذه المعلومات"
            description="حاول مرة أخرى. لن نعرض بيانات غير مؤكدة."
            action={<BFButton type="button" variant="secondary" onClick={retry}>إعادة المحاولة</BFButton>}
          />
        )}
        {resource.state === 'ready' && empty && (
          <BFEmptyState title={emptyMessage} />
        )}
        {resource.state === 'ready' && !empty && children}
      </div>
    </BFCard>
  )
}

export default function HomeTab() {
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
    const urls = [
      '/api/student/classes',
      '/api/student/homework',
      '/api/student/feedback',
      '/api/student/learning/today',
      '/api/student/learning/profile',
      '/api/student/learning/recommendations',
    ]
    void Promise.all(urls.map(loadResource)).then(([classes, homework, feedback, today, profile, recommendations]) => {
      if (active) {
        setSnapshot({ classes, homework, feedback, today, profile, recommendations })
        setNow(Date.now())
      }
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
  const hasGoal = Boolean(profile?.goal)
  const hasTodayPlan = Boolean(today?.plan?.steps?.length || today?.session?.steps?.length)

  const nextActionIsRecommendation = Boolean(recommendation)
  const actionResource = nextActionIsRecommendation ? snapshot.recommendations : snapshot.today
  const actionTitle = recommendation?.title || nextStep?.title || today?.plan?.status
  const actionReason = recommendation?.reason || nextStep?.reason
  const actionHref = nextActionIsRecommendation
    ? '/dashboard/student/learning?view=Recommendations'
    : '/dashboard/student/learning'
  const actionPending = actionResource.state === 'loading'
  const actionFailed = actionResource.state === 'error' || actionResource.state === 'unavailable'
  const actionEmpty = actionResource.state === 'ready' && !actionTitle

  return (
    <div className="space-y-7" dir="rtl">
      <BFPageHeader
        title="تعلّمك اليوم"
        description="خطوة واحدة واضحة، ثم واصل من حيث توقفت."
        actions={
          <Link
            href="/dashboard/student/learning"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d8e3da] bg-white px-4 py-2 text-sm font-semibold text-[#285f46] hover:bg-[#f3f7f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247456]"
          >
            خطتي التعليمية <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        }
      />

      <section
        aria-labelledby="student-next-step"
        className="overflow-hidden rounded-xl border border-[#dce8de] bg-[#f5f9f5] p-5 sm:p-7"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#527360]">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e2efe4] text-[#276646]">
                <ClipboardCheck size={16} aria-hidden="true" />
              </span>
              الخطوة التالية
            </div>
            <h2 id="student-next-step" className="text-xl font-bold leading-8 text-[#26332e] sm:text-2xl">
              {actionPending ? 'نجهّز خطوتك التالية' : actionTitle || 'لا توجد خطوة جديدة اليوم'}
            </h2>
            {actionReason && (
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#65736a]">{actionReason}</p>
            )}
            {actionPending && (
              <div role="status" aria-busy="true" aria-label="جارٍ تحميل خطوة التعلّم" className="mt-4 h-3 w-48 rounded bg-[#e2ebe3]" />
            )}
            {actionFailed && (
              <div role="alert" className="mt-3">
                <p className="text-sm text-[#7a4b43]">تعذر تحميل خطوتك الآن. لم نعرض بيانات غير مؤكدة.</p>
                <button type="button" onClick={retry} className="mt-2 min-h-11 text-sm font-bold text-[#285f46] underline underline-offset-4">
                  إعادة المحاولة
                </button>
              </div>
            )}
            {actionEmpty && <p className="mt-2 text-sm text-[#65736a]">يمكنك الرجوع إلى خطتك التعليمية لاختيار ما تتابعه.</p>}
          </div>
          {!actionPending && !actionFailed && !actionEmpty && actionTitle && (
            <Link
              href={actionHref}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#247456] px-5 text-sm font-bold text-white hover:bg-[#19583f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247456]"
            >
              ابدأ الآن <ArrowLeft size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>

      <section aria-label="ما يحتاج انتباهك" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PanelCard
          title="الحصة القادمة"
          description="موعدك التعليمي التالي"
          resource={snapshot.classes}
          empty={!nextClass}
          emptyMessage="لا توجد حصة قادمة مسجلة."
          retry={retry}
        >
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-[#26332e]">{getLabel(nextClass)}</p>
              <p className="mt-1 text-sm text-[#68756e]">{formatDate(nextClass.startTime)}</p>
              {nextClass.TeacherProfile?.User?.name && <p className="mt-1 text-sm text-[#68756e]">المدرس: {nextClass.TeacherProfile.User.name}</p>}
              {nextClass.group?.nameAr && <p className="mt-1 text-sm text-[#68756e]">المجموعة: {nextClass.group.nameAr}</p>}
            </div>
          </div>
          <Link href="/dashboard/student/classes" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">تفاصيل الحصص</Link>
        </PanelCard>

        <PanelCard
          title="الواجبات المطلوبة"
          description={pendingHomework.length ? `${pendingHomework.length} واجباً بانتظار المتابعة` : 'واجباتك الحالية'}
          resource={snapshot.homework}
          empty={!pendingHomework.length}
          emptyMessage="لا توجد واجبات بانتظارك."
          retry={retry}
        >
          <ul className="divide-y divide-[#edf0ed]">
            {pendingHomework.slice(0, 3).map((item, index) => (
              <li key={String(item.id || index)} className="flex min-h-12 items-center justify-between gap-3 py-2">
                <span className="min-w-0 text-sm font-semibold text-[#26332e]">{getLabel(item)}</span>
                <BFBadge tone={String(item.status).toUpperCase() === 'SUBMITTED' ? 'success' : 'warning'}>
                  {String(item.status).toUpperCase() === 'SUBMITTED' ? 'تم التسليم' : 'مطلوب'}
                </BFBadge>
              </li>
            ))}
          </ul>
          <Link href="/dashboard/student/homework" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">عرض الواجبات</Link>
        </PanelCard>
      </section>

      <section aria-label="مسارك التعليمي" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PanelCard
          title="تقدّم التعلّم"
          description="المستوى والمهارات المسجلة"
          resource={snapshot.profile}
          empty={!hasProgress}
          emptyMessage="سيظهر تقدمك هنا بعد تسجيل بيانات التعلّم."
          retry={retry}
        >
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <div>
              <p className="font-semibold text-[#26332e]">
                {profile?.officialLevel?.name || 'المستوى غير محدد'}
                {profile?.officialStage?.name ? ` · ${profile.officialStage.name}` : ''}
              </p>
              {masteryCount > 0 && <p className="mt-1 text-sm text-[#68756e]">{masteryCount} مهارة لها بيانات تقدّم</p>}
            </div>
          </div>
          <Link href="/dashboard/student/learning" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">تفاصيل التقدم</Link>
        </PanelCard>

        <PanelCard
          title="هدفي الحالي"
          description="الهدف الذي حفظته لمسارك"
          resource={snapshot.profile}
          empty={!hasGoal}
          emptyMessage="لم تحفظ هدفاً بعد."
          retry={retry}
        >
          <div className="flex items-start gap-3">
            <Target className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <p className="text-sm leading-6 text-[#38463e]">{profile?.goal}</p>
          </div>
          <Link href="/dashboard/student/learning?view=Goals" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">عرض الهدف</Link>
        </PanelCard>

        <PanelCard
          title="ملاحظات المدرس"
          description="آخر ملاحظات منشورة لك"
          resource={snapshot.feedback}
          empty={!feedback}
          emptyMessage="لا توجد ملاحظات منشورة بعد."
          retry={retry}
        >
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm leading-6 text-[#38463e]">{feedback.summary || 'تتوفر ملاحظات من حصتك الأخيرة.'}</p>
              {feedback.session?.title && <p className="mt-2 text-xs text-[#68756e]">{feedback.session.title}</p>}
            </div>
          </div>
          <Link href="/dashboard/student/feedback" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">عرض الملاحظات</Link>
        </PanelCard>

        {hasTodayPlan && nextStep && (
          <PanelCard
            title="خطة اليوم"
            description="خطوات التعلّم المسجلة لهذا اليوم"
            resource={snapshot.today}
            empty={!hasTodayPlan}
            emptyMessage="لا توجد خطوات تعلّم لليوم حالياً."
            retry={retry}
          >
            <div className="flex items-start gap-3">
              <BookOpen className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold text-[#26332e]">{nextStep.title || 'خطوة التعلّم التالية'}</p>
                {nextStep.reason && <p className="mt-1 text-sm leading-6 text-[#68756e]">{nextStep.reason}</p>}
              </div>
            </div>
            <Link href="/dashboard/student/learning" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">افتح خطة اليوم</Link>
          </PanelCard>
        )}
      </section>
    </div>
  )
}