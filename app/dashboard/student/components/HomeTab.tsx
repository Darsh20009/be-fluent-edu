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

  return (
    <div className="space-y-6" dir="rtl">
      <BFPageHeader
        title="مساحة تعلّمك"
        description="تابع ما تحتاجه اليوم، واعرف خطوتك التالية."
        actions={
          <Link
            href="/dashboard/student/learning"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#12805e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0e6a4e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12805e]"
          >
            تعلّمي اليوم <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="ملخص التعلّم">
        <PanelCard
          title="الحصة القادمة"
          description="موعدك التعليمي التالي"
          resource={snapshot.classes}
          empty={!nextClass}
          emptyMessage="لا توجد حصة قادمة مسجلة."
          retry={retry}
        >
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-1 shrink-0 text-[#4b3a70]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-[#252238]">{getLabel(nextClass)}</p>
              <p className="mt-1 text-sm text-[#687080]">{formatDate(nextClass.startTime)}</p>
              {nextClass.TeacherProfile?.User?.name && <p className="mt-1 text-sm text-[#687080]">المدرس: {nextClass.TeacherProfile.User.name}</p>}
              {nextClass.group?.nameAr && <p className="mt-1 text-sm text-[#687080]">المجموعة: {nextClass.group.nameAr}</p>}
            </div>
          </div>
          <Link href="/dashboard/student/classes" className="mt-4 inline-block text-sm font-semibold text-[#4b3a70] underline underline-offset-4">تفاصيل الحصص</Link>
        </PanelCard>

        <PanelCard
          title="الواجبات المطلوبة"
          description={`${pendingHomework.length} واجباً يحتاج إلى متابعة`}
          resource={snapshot.homework}
          empty={!pendingHomework.length}
          emptyMessage="لا توجد واجبات بانتظارك."
          retry={retry}
        >
          <ul className="space-y-3">
            {pendingHomework.slice(0, 3).map((item, index) => (
              <li key={String(item.id || index)} className="flex items-start justify-between gap-3">
                <span className="min-w-0 text-sm font-semibold text-[#252238]">{getLabel(item)}</span>
                <BFBadge tone={String(item.status).toUpperCase() === 'SUBMITTED' ? 'success' : 'warning'}>
                  {String(item.status).toUpperCase() === 'SUBMITTED' ? 'تم التسليم' : 'مطلوب'}
                </BFBadge>
              </li>
            ))}
          </ul>
          <Link href="/dashboard/student/homework" className="mt-4 inline-block text-sm font-semibold text-[#4b3a70] underline underline-offset-4">عرض الواجبات</Link>
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
            <MessageSquareText className="mt-1 shrink-0 text-[#4b3a70]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm leading-6 text-[#353143]">{feedback.summary || 'تتوفر ملاحظات من حصتك الأخيرة.'}</p>
              {feedback.session?.title && <p className="mt-2 text-xs text-[#687080]">{feedback.session.title}</p>}
            </div>
          </div>
          <Link href="/dashboard/student/feedback" className="mt-4 inline-block text-sm font-semibold text-[#4b3a70] underline underline-offset-4">عرض الملاحظات</Link>
        </PanelCard>

        <PanelCard
          title="تقدّم التعلّم"
          description="المستوى ومهاراتك المسجلة"
          resource={snapshot.profile}
          empty={!hasProgress}
          emptyMessage="سيظهر تقدمك هنا بعد تسجيل بيانات التعلّم."
          retry={retry}
        >
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1 shrink-0 text-[#12805e]" size={19} aria-hidden="true" />
            <div>
              <p className="font-semibold text-[#252238]">
                {profile?.officialLevel?.name || 'المستوى غير محدد'}
                {profile?.officialStage?.name ? ` · ${profile.officialStage.name}` : ''}
              </p>
              {masteryCount > 0 && <p className="mt-1 text-sm text-[#687080]">{masteryCount} مهارة لها بيانات تقدّم</p>}
            </div>
          </div>
          <Link href="/dashboard/student/learning" className="mt-4 inline-block text-sm font-semibold text-[#4b3a70] underline underline-offset-4">تفاصيل التقدم</Link>
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
            <Target className="mt-1 shrink-0 text-[#12805e]" size={19} aria-hidden="true" />
            <p className="text-sm leading-6 text-[#353143]">{profile?.goal}</p>
          </div>
          <Link href="/dashboard/student/learning?view=Goals" className="mt-4 inline-block text-sm font-semibold text-[#4b3a70] underline underline-offset-4">تعديل الهدف</Link>
        </PanelCard>

        <PanelCard
          title="خطوتك التالية"
          description="اقتراح مناسب لما تتعلمه الآن"
          resource={snapshot.recommendations}
          empty={!recommendation}
          emptyMessage="لا توجد توصية جديدة حالياً."
          retry={retry}
        >
          {recommendation && <>
            <div className="flex items-start gap-3">
              <ClipboardCheck className="mt-1 shrink-0 text-[#12805e]" size={19} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold text-[#252238]">{recommendation.title || 'ممارسة مقترحة'}</p>
                {recommendation.reason && <p className="mt-1 text-sm leading-6 text-[#687080]">{recommendation.reason}</p>}
              </div>
            </div>
            <Link href="/dashboard/student/learning?view=Recommendations" className="mt-4 inline-block text-sm font-semibold text-[#4b3a70] underline underline-offset-4">عرض التوصيات</Link>
          </>}
        </PanelCard>

        <PanelCard
          title="تعلم اليوم"
          description="خطة قصيرة مبنية على ما تعلمته"
          resource={snapshot.today}
          empty={!hasTodayPlan}
          emptyMessage="لا توجد خطوات تعلّم لليوم حالياً."
          retry={retry}
        >
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1 shrink-0 text-[#12805e]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-[#252238]">{nextStep?.title || today?.plan?.status || 'خطوة التعلّم التالية'}</p>
              {nextStep?.reason && <p className="mt-1 text-sm leading-6 text-[#687080]">{nextStep.reason}</p>}
            </div>
          </div>
          <Link href="/dashboard/student/learning" className="mt-4 inline-block text-sm font-semibold text-[#4b3a70] underline underline-offset-4">ابدأ التعلّم</Link>
        </PanelCard>
      </section>
    </div>
  )
}