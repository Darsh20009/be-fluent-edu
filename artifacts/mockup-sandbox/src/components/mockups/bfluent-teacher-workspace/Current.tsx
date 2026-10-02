'use client'

import './_group.css'
import { useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import {
  BookOpenCheck,
  Brain,
  CalendarDays,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  MessageCircle,
  School,
  Shield,
  Users,
  X,
} from 'lucide-react'

type TeacherWorkspaceShellProps = {
  user: { name: string; email: string; role: string }
  children: ReactNode
}

const localeText = (language: 'ar' | 'en', arabic: string, english: string) =>
  language === 'ar' ? arabic : english
const localeDirection = (language: 'ar' | 'en') => language === 'ar' ? 'rtl' : 'ltr'

function LocalLink({
  href,
  onClick,
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
      }}
    >
      {children}
    </a>
  )
}

function TeacherWorkspaceShell({ user, children }: TeacherWorkspaceShellProps) {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [darkMode, setDarkMode] = useState(false)
  const [pathname, setPathname] = useState('/dashboard/teacher/feedback')
  const [signedOut, setSignedOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const links = [
    { href: '/dashboard/teacher', label: t('لوحة المعلم', 'Teacher dashboard'), icon: GraduationCap },
    { href: '/dashboard/teacher/classes', label: t('حصصي', 'My classes'), icon: CalendarDays },
    { href: '/dashboard/teacher/classes?view=QMeet', label: 'QMeet', icon: MessageCircle },
    { href: '/dashboard/teacher/feedback', label: t('ملاحظات الحصص', 'Class feedback'), icon: BookOpenCheck },
    { href: '/dashboard/teacher/homework', label: t('الواجبات', 'Homework'), icon: FileText },
    { href: '/dashboard/teacher/students', label: t('طلابي', 'My students'), icon: Users },
    { href: '/dashboard/teacher/intelligence', label: t('ذكاء التعلّم', 'Learning intelligence'), icon: Brain },
    { href: '/dashboard/teacher/speaking', label: t('غرف التحدث', 'Speaking rooms'), icon: MessageCircle },
    { href: '/dashboard/teacher/staff', label: t('حسابات الموظفين', 'Employee accounts'), icon: School },
  ]

  const closeSidebar = () => setSidebarOpen(false)
  const isActive = (href: string) => href === '/dashboard/teacher'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className={`bfluent-current-teacher min-h-screen bg-[#f5f7f4] text-[#26332e] ${darkMode ? 'contrast-125' : ''}`} dir={localeDirection(language)}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label={t('إغلاق القائمة', 'Close navigation')}
          className="fixed inset-0 z-40 bg-[#172b21]/35 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`fixed inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 flex w-[min(310px,88vw)] flex-col border-[#e0e6e1] bg-white transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full' : '-translate-x-full'
      } lg:w-[270px]`}>
        <div className="flex min-h-[76px] items-center gap-3 border-b border-[#e8ece8] px-5">
          <img
            src="/__mockup/images/be-fluent-mark-2026.png"
            alt=""
            width={38}
            height={38}
            className="h-[38px] w-[38px] object-contain"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-[#26332e]">Be Fluent</div>
            <div className="mt-1 text-[11px] text-[#718078]">{t('مساحة المعلم', 'Teacher workspace')}</div>
          </div>
          <button
            type="button"
            aria-label={t('إغلاق القائمة', 'Close navigation')}
            onClick={closeSidebar}
            className="grid h-11 w-11 place-items-center rounded-lg text-[#68756e] hover:bg-[#f3f6f3] lg:hidden"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="mx-4 my-4 flex items-center gap-3 rounded-lg bg-[#f5f7f4] p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e6f0e8] text-sm font-extrabold text-[#286547]">
            {user.name?.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[#2d3a32]">{user.name}</span>
            <span className="mt-1 block truncate text-xs text-[#718078]">
              {user.role === 'ADMIN' ? t('مدير النظام', 'System administrator') : t('المعلم', 'Teacher')}
            </span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label={t('التنقل الرئيسي للمعلم', 'Main teacher navigation')}>
          <p className="px-3 pb-2 pt-2 text-[11px] font-bold text-[#849087]">{t('مساحة العمل', 'Workspace')}</p>
          {links.map(({ href, label, icon: Icon }) => {
            const selected = isActive(href)
            return (
              <LocalLink
                key={href}
                href={href}
                aria-current={selected ? 'page' : undefined}
                onClick={() => { setPathname(href.split('?')[0]); closeSidebar() }}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                  selected
                    ? 'bg-[#edf5ef] font-bold text-[#225d41]'
                    : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </LocalLink>
            )
          })}
          {user.role === 'ADMIN' && (
            <LocalLink
              href="/dashboard/admin"
              onClick={() => { setPathname('/dashboard/admin'); closeSidebar() }}
              className="mt-3 flex min-h-11 items-center gap-3 rounded-lg border-t border-[#e8ece8] px-3 pt-3 text-sm font-semibold text-[#526158] hover:bg-[#f5f7f5]"
            >
              <Shield className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span>{t('لوحة الإدارة', 'Admin dashboard')}</span>
            </LocalLink>
          )}
        </nav>

        <div className="border-t border-[#e8ece8] p-3">
          <button
            type="button"
            onClick={() => setSignedOut(true)}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#80534b] hover:bg-[#faf3f1]"
          >
            <LogOut size={18} aria-hidden="true" />
            {signedOut ? t('تم تسجيل الخروج (عرض توضيحي)', 'Signed out (demo)') : t('تسجيل الخروج', 'Sign out')}
          </button>
        </div>
      </aside>

      <div className={language === 'ar' ? 'lg:mr-[270px]' : 'lg:ml-[270px]'}>
        <header className="sticky top-0 z-30 border-b border-[#e0e6e1] bg-white/95">
          <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={t('فتح القائمة', 'Open navigation')}
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[#e0e6e1] text-[#315f49] hover:bg-[#f2f7f2] lg:hidden"
              >
                <Menu size={19} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#26332e]">{t('مساحة المعلم', 'Teacher workspace')}</p>
                <p className="mt-1 hidden truncate text-xs text-[#718078] sm:block">{user.name}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="min-h-10 rounded-lg border border-[#e0e6e1] px-3 text-xs font-semibold text-[#526158]"
                aria-label={t('تغيير اللغة', 'Change language')}
              >
                {language === 'ar' ? 'EN' : 'عربي'}
              </button>
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="min-h-10 rounded-lg border border-[#e0e6e1] px-3 text-xs font-semibold text-[#526158]"
                aria-label={t('تغيير المظهر', 'Toggle theme')}
              >
                {darkMode ? '☀' : '◐'}
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function FeedbackDemo() {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  return (
    <section className="space-y-5" dir="rtl">
      <header>
        <p className="text-sm font-semibold text-[#718078]">مساحة المعلم / ملاحظات الحصص</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#26332e]">ملاحظات الحصص</h1>
        <p className="mt-2 text-sm leading-6 text-[#68756e]">تابعي تقدّم المتعلمين وأضيفي ملاحظات بنّاءة بعد كل حصة.</p>
      </header>
      <article className="rounded-xl border border-[#dce5de] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#718078]">اليوم · ١٠:٠٠ صباحاً</p>
            <h2 className="mt-2 text-lg font-bold text-[#26332e]">محادثة إنجليزية — المستوى المتوسط</h2>
            <p className="mt-1 text-sm text-[#5c6961]">المتعلمة: ليان مراد <span className="text-[#849087]">· محتوى تجريبي</span></p>
          </div>
          <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-bold text-[#225d41]">بانتظار الملاحظات</span>
        </div>
        <div className="mt-5 rounded-lg bg-[#f7f9f7] p-4">
          <p className="text-xs font-bold text-[#718078]">محاور الحصة</p>
          <p className="mt-2 text-sm leading-6 text-[#526158]">التعبير عن الروتين اليومي، استخدام زمن المضارع البسيط، وممارسة أسئلة المتابعة في الحوار.</p>
        </div>
        <label htmlFor="feedback-note" className="mt-5 block text-sm font-bold text-[#344239]">ملاحظة للمتعلمة</label>
        <textarea
          id="feedback-note"
          rows={4}
          value={note}
          onChange={(event) => { setNote(event.target.value); setSaved(false) }}
          placeholder="اكتبي نقاط القوة وخطوة صغيرة للتدرب عليها…"
          className="mt-2 w-full resize-y rounded-lg border border-[#dce4dc] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {saved && <span role="status" className="text-sm font-semibold text-[#246448]">حُفظت الملاحظة في العرض التوضيحي.</span>}
          <button type="button" onClick={() => setSaved(true)} className="min-h-11 rounded-lg bg-[#24714f] px-5 text-sm font-semibold text-white hover:bg-[#19583f]">
            حفظ الملاحظة
          </button>
        </div>
      </article>
    </section>
  )
}

export function Current() {
  return (
    <TeacherWorkspaceShell user={{ name: 'سارة العتيبي', email: 'sara.teacher@example.test', role: 'TEACHER' }}>
      <FeedbackDemo />
    </TeacherWorkspaceShell>
  )
}