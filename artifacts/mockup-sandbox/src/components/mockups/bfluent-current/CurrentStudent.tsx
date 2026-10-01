import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  Award,
  ArrowLeft,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  CreditCard,
  FileText,
  Home,
  Layers,
  LogOut,
  Medal,
  Menu,
  MessageSquare,
  MessageSquareText,
  Mic,
  ShoppingCart,
  Target,
  TrendingUp,
  UserRound,
  Video,
  type LucideIcon,
} from 'lucide-react'
import styles from './student-foundation.module.css'
import {
  BFBadge,
  BFCard,
  BFEmptyState,
  BFPageHeader,
} from './primitives'
import './_group.css'

type MenuItem = { id: string; label: string; icon: LucideIcon; href?: string; locked?: boolean }

const primaryItems: MenuItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'classes', label: 'حصصي', icon: Calendar, href: '#classes' },
  { id: 'learning', label: 'التعلّم', icon: BookOpen, href: '#learning' },
  { id: 'homework', label: 'الواجبات', icon: FileText, href: '#homework' },
  { id: 'feedback', label: 'ملاحظات المدرس', icon: MessageSquare, href: '#feedback' },
  { id: 'speaking', label: 'غرف المحادثة', icon: Mic, href: '#speaking' },
  { id: 'goals', label: 'أهدافي', icon: Target, href: '#goals' },
  { id: 'profile', label: 'الملف الشخصي', icon: UserRound, href: '#profile' },
]

const exploreItems: MenuItem[] = [
  { id: 'sessions', label: 'الجلسات السابقة', icon: Video },
  { id: 'legacy-homework', label: 'الواجبات السابقة', icon: FileText },
  { id: 'certificates', label: 'الشهادات', icon: Award },
  { id: 'lessons', label: 'الدروس التعليمية', icon: BookOpen, href: '#lessons' },
  { id: 'level', label: 'تقدم المستوى', icon: TrendingUp, href: '#level' },
  { id: 'vocabulary', label: 'المفردات', icon: Layers, href: '#vocabulary' },
  { id: 'conversation', label: 'تدريب المحادثة', icon: Mic, href: '#conversation' },
  { id: 'packages', label: 'الباقات', icon: CreditCard },
  { id: 'achievements', label: 'الإنجازات السابقة', icon: Award, href: '#achievements' },
  { id: 'leaderboard', label: 'لوحة الترتيب السابقة', icon: Medal, href: '#leaderboard' },
]

const student = {
  name: 'سارة محمد',
  email: 'sara.mohamed@example.com',
  isActive: true,
}

function afterMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

const studentFixture = {
  nextClass: {
    title: 'محادثة عملية: التسوق اليومي',
    startTime: afterMinutes(27 * 60),
    teacher: 'Ahmed Hassan',
    group: 'المستوى المتوسط',
  },
  homework: [
    { id: 'homework-1', title: 'وصف روتينك اليومي', status: 'OPEN' },
    { id: 'homework-2', title: 'مفردات الحياة اليومية', status: 'SUBMITTED' },
  ],
  feedback: {
    summary: 'استخدمتَ جملاً واضحة في المحادثة. حاول إضافة تفاصيل أكثر عند وصف يومك.',
    session: 'محادثة عملية · الثلاثاء',
  },
  action: {
    title: 'تدريب التحدث: تحدث عن روتينك الصباحي',
    reason: 'تدرّب على استخدام خمس جمل كاملة لوصف روتينك اليومي.',
  },
  profile: {
    level: 'B1',
    stage: 'Everyday conversations',
    masteryCount: 8,
    goal: 'أريد التحدث بثقة في مواقف العمل والحياة اليومية.',
  },
  todayStep: {
    title: 'راجع كلمات المستوى B1',
    reason: 'ابدأ بمراجعة المفردات التي ظهرت في حصتك الأخيرة.',
  },
}

function BrandLockup() {
  const name = Array.from('Be Fluent')

  return (
    <span className="inline-flex min-w-0 items-center gap-2.5" dir="ltr">
      <img
        src="/__mockup/images/be-fluent-mark-2026.png"
        alt=""
        aria-hidden="true"
        width={26}
        height={28}
        className="shrink-0 object-contain"
      />
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-sm font-bold leading-tight tracking-tight text-[#24342b]" lang="en" dir="ltr">
          <span className="sr-only">Be Fluent</span>
          <span aria-hidden="true" className="bfluent-brand-wordmark">
            {name.map((character, index) => (
              <span
                key={`${character}-${index}`}
                className="bfluent-brand-character"
                style={{ '--brand-char-delay': `${index * 75}ms` } as CSSProperties}
              >
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </span>
        </span>
      </span>
    </span>
  )
}

function PanelCard({
  title,
  description,
  empty,
  emptyMessage,
  children,
}: {
  title: string
  description?: string
  empty: boolean
  emptyMessage: string
  children: ReactNode
}) {
  return (
    <BFCard className="min-w-0 p-5 sm:p-6">
      <h2 className="text-base font-bold text-[#252238]">{title}</h2>
      {description && <p className="mt-1 text-sm leading-6 text-[#687080]">{description}</p>}
      <div className="mt-4">
        {empty ? <BFEmptyState title={emptyMessage} /> : children}
      </div>
    </BFCard>
  )
}

function StudentHome() {
  const formatDate = (value: string) =>
    new Date(value).toLocaleString('ar', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
    })

  return (
    <div className="space-y-7" dir="rtl">
      <BFPageHeader
        title="تعلّمك اليوم"
        description="خطوة واحدة واضحة، ثم واصل من حيث توقفت."
        actions={
          <a
            href="#learning"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d8e3da] bg-white px-4 py-2 text-sm font-semibold text-[#285f46] hover:bg-[#f3f7f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247456]"
          >
            خطتي التعليمية <ArrowLeft size={16} aria-hidden="true" />
          </a>
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
              {studentFixture.action.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#65736a]">{studentFixture.action.reason}</p>
          </div>
          <a
            href="#learning"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#247456] px-5 text-sm font-bold text-white hover:bg-[#19583f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247456]"
          >
            ابدأ الآن <ArrowLeft size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section aria-label="ما يحتاج انتباهك" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PanelCard
          title="الحصة القادمة"
          description="موعدك التعليمي التالي"
          empty={!studentFixture.nextClass}
          emptyMessage="لا توجد حصة قادمة مسجلة."
        >
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-[#26332e]">{studentFixture.nextClass.title}</p>
              <p className="mt-1 text-sm text-[#68756e]">{formatDate(studentFixture.nextClass.startTime)}</p>
              <p className="mt-1 text-sm text-[#68756e]">المدرس: {studentFixture.nextClass.teacher}</p>
              <p className="mt-1 text-sm text-[#68756e]">المجموعة: {studentFixture.nextClass.group}</p>
            </div>
          </div>
          <a href="#classes" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">تفاصيل الحصص</a>
        </PanelCard>

        <PanelCard
          title="الواجبات المطلوبة"
          description={`${studentFixture.homework.filter((item) => ['OPEN', 'SUBMITTED'].includes(item.status)).length} واجباً بانتظار المتابعة`}
          empty={!studentFixture.homework.length}
          emptyMessage="لا توجد واجبات بانتظارك."
        >
          <ul className="divide-y divide-[#edf0ed]">
            {studentFixture.homework.map((item) => (
              <li key={item.id} className="flex min-h-12 items-center justify-between gap-3 py-2">
                <span className="min-w-0 text-sm font-semibold text-[#26332e]">{item.title}</span>
                <BFBadge tone={item.status === 'SUBMITTED' ? 'success' : 'warning'}>
                  {item.status === 'SUBMITTED' ? 'تم التسليم' : 'مطلوب'}
                </BFBadge>
              </li>
            ))}
          </ul>
          <a href="#homework" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">عرض الواجبات</a>
        </PanelCard>
      </section>

      <section aria-label="مسارك التعليمي" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PanelCard
          title="تقدّم التعلّم"
          description="المستوى والمهارات المسجلة"
          empty={!studentFixture.profile.level && !studentFixture.profile.masteryCount}
          emptyMessage="سيظهر تقدمك هنا بعد تسجيل بيانات التعلّم."
        >
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <div>
              <p className="font-semibold text-[#26332e]">{studentFixture.profile.level} · {studentFixture.profile.stage}</p>
              <p className="mt-1 text-sm text-[#68756e]">{studentFixture.profile.masteryCount} مهارات لها بيانات تقدّم</p>
            </div>
          </div>
          <a href="#learning" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">تفاصيل التقدم</a>
        </PanelCard>

        <PanelCard
          title="هدفي الحالي"
          description="الهدف الذي حفظته لمسارك"
          empty={!studentFixture.profile.goal}
          emptyMessage="لم تحفظ هدفاً بعد."
        >
          <div className="flex items-start gap-3">
            <Target className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <p className="text-sm leading-6 text-[#38463e]">{studentFixture.profile.goal}</p>
          </div>
          <a href="#goals" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">عرض الهدف</a>
        </PanelCard>

        <PanelCard
          title="ملاحظات المدرس"
          description="آخر ملاحظات منشورة لك"
          empty={!studentFixture.feedback}
          emptyMessage="لا توجد ملاحظات منشورة بعد."
        >
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm leading-6 text-[#38463e]">{studentFixture.feedback.summary}</p>
              <p className="mt-2 text-xs text-[#68756e]">{studentFixture.feedback.session}</p>
            </div>
          </div>
          <a href="#feedback" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">عرض الملاحظات</a>
        </PanelCard>

        <PanelCard
          title="خطة اليوم"
          description="خطوات التعلّم المسجلة لهذا اليوم"
          empty={!studentFixture.todayStep}
          emptyMessage="لا توجد خطوات تعلّم لليوم حالياً."
        >
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1 shrink-0 text-[#327453]" size={19} aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-[#26332e]">{studentFixture.todayStep.title}</p>
              <p className="mt-1 text-sm leading-6 text-[#68756e]">{studentFixture.todayStep.reason}</p>
            </div>
          </div>
          <a href="#learning" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#285f46] underline underline-offset-4">افتح خطة اليوم</a>
        </PanelCard>
      </section>
    </div>
  )
}

export default function CurrentStudent() {
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderMenu = (items: MenuItem[]) =>
    items.map((item) => {
      const Icon = item.icon
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            if (item.locked) return
            setActiveTab(item.id)
            setSidebarOpen(false)
          }}
          disabled={item.locked}
          aria-current={activeTab === item.id ? 'page' : undefined}
          className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
        >
          <Icon size={17} aria-hidden="true" />
          <span>{item.label}</span>
          {item.locked && <span className="mr-auto text-[10px]">يتطلب اشتراكاً</span>}
        </button>
      )
    })

  return (
    <div className={styles.foundation} dir="rtl">
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.headerTools}>
            <button
              type="button"
              aria-label="فتح القائمة"
              aria-expanded={sidebarOpen}
              aria-controls="student-navigation-panel"
              onClick={() => setSidebarOpen(true)}
              className={styles.mobileOnly}
            >
              <Menu size={21} aria-hidden="true" />
            </button>
            <a href="#home" className={styles.brand} aria-label="Be Fluent home">
              <BrandLockup />
            </a>
          </div>
          <nav className={styles.desktopNav} aria-label="التنقل السريع">
            <a href="#classes">حصصي</a>
            <a href="#learning">التعلّم</a>
            <a href="#feedback">الملاحظات</a>
          </nav>
          <div className={styles.headerTools}>
            <span className={styles.status}>{student.isActive ? 'حساب نشط' : 'قيد التفعيل'}</span>
            <a href="#cart" aria-label="السلة" className="relative grid min-h-11 min-w-11 place-items-center rounded-lg text-[#496257] hover:bg-[#f2f7f2]">
              <ShoppingCart size={19} aria-hidden="true" />
            </a>
            <button
              type="button"
              className="inline-flex !min-h-11 items-center justify-center gap-2 rounded-lg border-2 !border-[#d7e1d8] bg-transparent px-3 text-sm font-medium !text-[#315f49] hover:bg-[#247456] hover:text-white"
            >
              <LogOut size={15} className="ml-1" aria-hidden="true" />
              خروج
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className={styles.mobileOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={styles.page}>
        <div className={styles.shell}>
          <aside
            id="student-navigation-panel"
            aria-label="قائمة الطالب"
            className={`${styles.side} ${sidebarOpen ? styles.sideOpen : ''}`}
          >
            <button
              type="button"
              aria-label="إغلاق القائمة"
              onClick={() => setSidebarOpen(false)}
              className={`${styles.mobileOnly} absolute top-3 left-3`}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div className={styles.profile}>
              <div className="flex items-center gap-3">
                <div className={styles.avatar} aria-hidden="true">{student.name.charAt(0)}</div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{student.name}</p>
                  <p className="truncate text-xs text-[#6e776f]">{student.email}</p>
                </div>
              </div>
            </div>
            <nav id="student-primary-menu" aria-label="التنقل الرئيسي">
              <p className={styles.sectionLabel}>مساحتك التعليمية</p>
              {renderMenu(primaryItems)}
            </nav>
            <nav aria-label="أدوات إضافية">
              <p className={styles.sectionLabel}>أدوات إضافية</p>
              {renderMenu(exploreItems)}
            </nav>
          </aside>
          <main className={styles.surface} id="student-home">
            <StudentHome />
          </main>
        </div>
      </div>
    </div>
  )
}