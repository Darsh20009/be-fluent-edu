'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
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
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

type TeacherWorkspaceShellProps = {
  user: { name: string; email: string; role: string }
  children: ReactNode
}

export default function TeacherWorkspaceShell({ user, children }: TeacherWorkspaceShellProps) {
  const { language } = useTheme()
  const pathname = usePathname()
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
    <div className="min-h-[100dvh] bg-[#f5f7f4] text-[#26332e]" dir={localeDirection(language)}>
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
          <Image
            src="/brand/be-fluent-mark-2026.png"
            alt=""
            width={38}
            height={38}
            className="h-[38px] w-[38px] object-contain"
            priority
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
              <Link
                key={href}
                href={href}
                aria-current={selected ? 'page' : undefined}
                onClick={closeSidebar}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                  selected
                    ? 'bg-[#edf5ef] font-bold text-[#225d41]'
                    : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
          {user.role === 'ADMIN' && (
            <Link
              href="/dashboard/admin"
              onClick={closeSidebar}
              className="mt-3 flex min-h-11 items-center gap-3 rounded-lg border-t border-[#e8ece8] px-3 pt-3 text-sm font-semibold text-[#526158] hover:bg-[#f5f7f5]"
            >
              <Shield className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span>{t('لوحة الإدارة', 'Admin dashboard')}</span>
            </Link>
          )}
        </nav>

        <div className="border-t border-[#e8ece8] p-3">
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: '/auth/login' })}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#80534b] hover:bg-[#faf3f1]"
          >
            <LogOut size={18} aria-hidden="true" />
            {t('تسجيل الخروج', 'Sign out')}
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
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}