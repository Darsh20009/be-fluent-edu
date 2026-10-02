'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Users, CreditCard, Activity, LogOut, Shield, BookOpen,
  GraduationCap, ClipboardList, Mail, Tag, ChevronDown, ChevronRight, Menu, X,
  Globe, Layers, PhoneCall, MessageCircle, CalendarDays, BookOpenCheck,
  FileText, School, UserRound, Mic, Brain
} from 'lucide-react'
import Link from 'next/link'
import HomeTab, { type AdminOverviewStats } from './components/AdminOverviewRedesign'
import AdminAssistant from '@/components/admin/AdminAssistant'
import UsersTab from './components/UsersTab'
import SubscriptionsTab from './components/SubscriptionsTab'
import SystemTab from './components/SystemTab'
import StudentsManagementTab from './components/StudentsManagementTab'
import LessonsTab from '@/components/admin/LessonsTab'
import PlacementTestTab from './components/PlacementTestTab'
import EmailTab from './components/EmailTab'
import CouponsTab from './components/CouponsTab'
import PageEditorTab from './components/PageEditorTab'
import LeadsTab from './components/LeadsTab'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

interface Props {
  user: { name: string; email: string; role: string }
  children?: ReactNode
}

const MENU_GROUPS = [
  {
    id: 'overview',
    label: 'الرئيسية',
    icon: Home,
    items: [
      { id: 'home', label: 'لوحة التحكم', icon: Home },
    ]
  },
  {
    id: 'people',
    label: 'الأشخاص',
    icon: Users,
    items: [
      { id: 'people-route', label: 'ملفات الأشخاص', icon: UserRound, href: '/dashboard/admin/people' },
      { id: 'users', label: 'المستخدمون', icon: Users },
      { id: 'students', label: 'الطلاب', icon: BookOpen },
    ]
  },
  {
    id: 'learning',
    label: 'التعلّم والمتابعة',
    icon: GraduationCap,
    items: [
      { id: 'classes-route', label: 'الحصص', icon: CalendarDays, href: '/dashboard/admin/classes' },
      { id: 'levels-route', label: 'المستويات', icon: School, href: '/dashboard/admin/levels' },
      { id: 'feedback-route', label: 'التغذية الراجعة', icon: BookOpenCheck, href: '/dashboard/admin/feedback' },
      { id: 'homework-route', label: 'الواجبات', icon: FileText, href: '/dashboard/admin/homework' },
      { id: 'lessons', label: 'الدروس', icon: Layers },
      { id: 'placement-test', label: 'اختبار تحديد المستوى', icon: ClipboardList },
      { id: 'page-editor', label: 'محرر الصفحات', icon: Globe },
      { id: 'speaking-route', label: 'غرف المحادثة', icon: Mic, href: '/dashboard/admin/speaking' },
      { id: 'intelligence-route', label: 'ذكاء التعلّم', icon: Brain, href: '/dashboard/admin/intelligence' },
    ]
  },
  {
    id: 'requests',
    label: 'الطلبات والماليات',
    icon: CreditCard,
    items: [
      { id: 'leads', label: 'طلبات الحجز', icon: PhoneCall },
      { id: 'commerce-route', label: 'الباقات والمجموعات', icon: CreditCard, href: '/dashboard/admin/commerce' },
      { id: 'subscriptions', label: 'مراجعة دفعات الاشتراك', icon: CreditCard },
      { id: 'coupons', label: 'الكوبونات', icon: Tag },
    ]
  },
  {
    id: 'communication',
    label: 'التواصل',
    icon: MessageCircle,
    items: [
      { id: 'whatsapp-route', label: 'WhatsApp', icon: MessageCircle, href: '/dashboard/admin/whatsapp' },
      { id: 'email', label: 'البريد المباشر', icon: Mail },
    ]
  },
  {
    id: 'system',
    label: 'النظام',
    icon: Activity,
    items: [
      { id: 'system', label: 'السجلات وإعدادات النظام', icon: Activity },
      { id: 'tips-guide', label: 'دليل النظام', icon: BookOpenCheck, href: '/dashboard/admin/tips' },
    ]
  }
]

function routeMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

const MANAGER_MENU = [
  { id: 'manager-home', label: 'مساحة المدير', icon: Shield, href: '/dashboard/manager' },
  { id: 'classes-route', label: 'الحصص', icon: CalendarDays, href: '/dashboard/admin/classes' },
]

export default function AdminDashboardClient({ user, children }: Props) {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const sidebarOffscreen = language === 'ar' ? 'translate-x-full' : '-translate-x-full'
  const translateLabel = (label: string) => t(label, ({
    'الرئيسية': 'Home', 'لوحة التحكم': 'Dashboard', 'الأشخاص': 'People',
    'ملفات الأشخاص': 'People profiles', 'المستخدمون': 'Users', 'الطلاب': 'Students',
    'التعلّم والمتابعة': 'Learning & tracking', 'الحصص': 'Classes', 'المستويات': 'Levels',
    'التغذية الراجعة': 'Feedback', 'الواجبات': 'Homework', 'الدروس': 'Lessons',
    'اختبار تحديد المستوى': 'Placement test', 'محرر الصفحات': 'Page editor',
    'غرف المحادثة': 'Speaking rooms', 'ذكاء التعلّم': 'Learning intelligence',
    'الطلبات والماليات': 'Requests & finance', 'طلبات الحجز': 'Booking requests',
    'الباقات والمجموعات': 'Packages & groups', 'مراجعة دفعات الاشتراك': 'Subscription payments',
    'الكوبونات': 'Coupons', 'التواصل': 'Communication', 'البريد المباشر': 'Direct email',
    'النظام': 'System', 'السجلات وإعدادات النظام': 'System logs & settings',
    'دليل النظام': 'System guide',
    'مساحة المدير': 'Manager workspace',
  } as Record<string, string>)[label] || label)
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const activeGroup = MENU_GROUPS.find(group =>
      group.items.some(item => 'href' in item && item.href && routeMatches(pathname, item.href)),
    )
    return { overview: true, ...(activeGroup ? { [activeGroup.id]: true } : {}) }
  })
  const [stats, setStats] = useState<AdminOverviewStats | null>(null)
  const [statsState, setStatsState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [statsRetryKey, setStatsRetryKey] = useState(0)
  const isManager = user.role === 'MANAGER'
  const isDashboardRoot = pathname === '/dashboard/admin'

  useEffect(() => {
    if (!isDashboardRoot || isManager) return
    let cancelled = false

    async function loadStats() {
      try {
        const response = await fetch('/api/admin/stats', { cache: 'no-store' })
        if (!response.ok) throw new Error('Admin stats unavailable')
        const nextStats = await response.json() as AdminOverviewStats
        if (cancelled) return
        setStats(nextStats)
        setStatsState('ready')
      } catch {
        if (cancelled) return
        setStats(null)
        setStatsState('error')
      }
    }

    void loadStats()
    return () => { cancelled = true }
  }, [statsRetryKey, isDashboardRoot, isManager])

  useEffect(() => {
    const syncTabFromUrl = () => {
      const requestedTab = new URLSearchParams(window.location.search).get('tab')
      if (requestedTab && MENU_GROUPS.some(group => group.items.some(item => item.id === requestedTab && !('href' in item)))) {
        setActiveTab(requestedTab)
      }
    }
    syncTabFromUrl()
    window.addEventListener('popstate', syncTabFromUrl)
    return () => window.removeEventListener('popstate', syncTabFromUrl)
  }, [])

  const retryStats = () => {
    setStatsState('loading')
    setStatsRetryKey((key) => key + 1)
  }

  const navigateToTab = (tab: string) => {
    setActiveTab(tab)
    setSidebarOpen(false)
    if (tab === 'whatsapp-route') {
      router.push('/dashboard/admin/whatsapp')
      return
    }
    if (tab === 'classes-route') {
      router.push('/dashboard/admin/classes')
      return
    }
    if (!isDashboardRoot) router.push(`/dashboard/admin?tab=${encodeURIComponent(tab)}`)
    const group = MENU_GROUPS.find(section => section.items.some(item => item.id === tab))
    if (group) {
      setExpandedGroups(current => ({ ...current, [group.id]: true }))
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const activeRouteItem = MENU_GROUPS.flatMap(g => g.items).find(i =>
    'href' in i && i.href ? routeMatches(pathname, i.href) : false,
  )
  const activeLabel = translateLabel(activeRouteItem?.label || MENU_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'لوحة التحكم')
  const pendingSubscriptions = typeof stats?.pendingSubscriptions === 'number' && Number.isFinite(stats.pendingSubscriptions)
    ? stats.pendingSubscriptions
    : null

  return (
    <div className="min-h-[100dvh] bg-[#f5f7f4] text-[#26332e]" dir={localeDirection(language)}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label={t('إغلاق القائمة', 'Close menu')}
          className="fixed inset-0 z-40 bg-[#172b21]/35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 flex w-[min(320px,88vw)] flex-col border-[#e0e6e1] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100dvh] lg:w-[270px] lg:shrink-0 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : `${sidebarOffscreen} lg:translate-x-0`
      }`}>
        <div className="flex min-h-[76px] items-center justify-between border-b border-[#e8ece8] px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#247456] text-white">
              <Shield size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-[#26332e]">Be Fluent</span>
              <span className="mt-1 block text-[11px] font-medium text-[#76827a]">{t('مساحة الإدارة', 'Admin workspace')}</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={t('إغلاق القائمة', 'Close menu')}
            className="grid min-h-11 min-w-11 place-items-center rounded-lg text-[#68756e] hover:bg-[#f3f6f3] lg:hidden"
            onClick={() => setSidebarOpen(false)}
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
            <span className="mt-1 block truncate text-xs text-[#718078]">{user.role === 'ADMIN' ? t('مدير النظام', 'System administrator') : user.role === 'MANAGER' ? t('مدير', 'Manager') : t('مساعد', 'Assistant')}</span>
          </span>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label={isManager ? t('تنقل المدير', 'Manager navigation') : t('التنقل الرئيسي للإدارة', 'Main admin navigation')}>
          {isManager ? (
            <section className="space-y-1">
              <h2 className="px-3 pb-2 text-[11px] font-semibold text-[#839087]">{t('مساحة المدير', 'Manager workspace')}</h2>
              {MANAGER_MENU.map(item => {
                const Icon = item.icon
                const selected = routeMatches(pathname, item.href)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm transition-colors ${
                      selected ? 'bg-[#edf5ef] font-bold text-[#225d41]' : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span className="flex-1">{translateLabel(item.label)}</span>
                  </Link>
                )
              })}
            </section>
          ) : MENU_GROUPS.map(group => {
            const GroupIcon = group.icon
            const expanded = expandedGroups[group.id] ?? false
            const items = (
              <div className="space-y-1">
                {group.items.filter(item => item.id !== 'tips-guide' || user.role === 'ADMIN').map(item => {
                  const Icon = item.icon
                  const selected = 'href' in item && item.href
                    ? routeMatches(pathname, item.href)
                    : isDashboardRoot && activeTab === item.id
                  const showBadge = item.id === 'subscriptions'
                  const classes = `flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm transition-colors ${
                    selected ? 'bg-[#edf5ef] font-bold text-[#225d41]' : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'
                  }`
                  const content = (
                    <>
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      <span className="flex-1">{translateLabel(item.label)}</span>
                      {showBadge && pendingSubscriptions !== null && pendingSubscriptions > 0 && (
                        <span className="min-w-6 rounded-full bg-[#f5f1e7] px-2 py-1 text-center text-[11px] font-bold tabular-nums text-[#80662d]">
                          {pendingSubscriptions}
                        </span>
                      )}
                    </>
                  )
                  return 'href' in item && item.href ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      aria-current={selected ? 'page' : undefined}
                      onClick={() => {
                        setSidebarOpen(false)
                        setExpandedGroups(current => ({ ...current, [group.id]: true }))
                      }}
                      className={classes}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={selected ? 'page' : undefined}
                      onClick={() => navigateToTab(item.id)}
                      className={classes}
                    >
                      {content}
                    </button>
                  )
                })}
              </div>
            )

            if (group.id === 'overview') {
              return (
                <section key={group.id}>
                  <h2 className="px-3 pb-2 text-[11px] font-semibold text-[#839087]">{translateLabel(group.label)}</h2>
                  {items}
                </section>
              )
            }

            return (
              <section key={group.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`admin-nav-${group.id}`}
                  onClick={() => setExpandedGroups(current => ({ ...current, [group.id]: !expanded }))}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm font-semibold text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]"
                >
                  <GroupIcon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className="flex-1">{translateLabel(group.label)}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <div id={`admin-nav-${group.id}`} className="mt-1 space-y-1 pr-3" hidden={!expanded}>{items}</div>
              </section>
            )
          })}
        </nav>

        <div className="space-y-1 border-t border-[#e8ece8] p-3">
          {!isManager && (
            <Link href="/dashboard/teacher" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]">
              <GraduationCap size={18} aria-hidden="true" />
              {t('لوحة المعلم', 'Teacher dashboard')}
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#80534b] hover:bg-[#faf3f1]"
          >
            <LogOut size={18} aria-hidden="true" />
            {t('تسجيل الخروج', 'Sign out')}
          </button>
        </div>
      </aside>

      <div className={`min-h-[100dvh] lg:-mt-[100dvh] ${language === 'ar' ? 'lg:mr-[270px]' : 'lg:ml-[270px]'}`}>
        <header className="sticky top-0 z-30 border-b border-[#e0e6e1] bg-white/95">
          <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={t('فتح القائمة', 'Open menu')}
                aria-expanded={sidebarOpen}
                className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[#e0e6e1] text-[#315f49] hover:bg-[#f2f7f2] lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={19} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <div className="mb-1 hidden items-center gap-1.5 text-[11px] font-medium text-[#89938d] sm:flex">
                  <span>{t('الإدارة', 'Administration')}</span>
                  <ChevronRight className={language === 'ar' ? 'rotate-180' : undefined} size={13} aria-hidden="true" />
                  <span className="truncate text-[#477557]">{activeLabel}</span>
                </div>
                <h1 className="truncate text-lg font-bold text-[#26332e] sm:text-xl">{activeLabel}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
              <span className="hidden text-start sm:block">
                <span className="block text-xs font-bold text-[#344239]">{user.name}</span>
                <span className="mt-1 block text-[11px] text-[#718078]">{user.role === 'ADMIN' ? t('مدير النظام', 'System administrator') : user.role === 'MANAGER' ? t('مدير', 'Manager') : t('مساعد', 'Assistant')}</span>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f0e8] text-sm font-extrabold text-[#286547]">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">
          {isDashboardRoot ? (
            <>
              {activeTab === 'home' && <HomeTab stats={stats} statsState={statsState} onRetryStats={retryStats} onNavigate={navigateToTab} />}
              {activeTab === 'leads' && <LeadsTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'subscriptions' && <SubscriptionsTab />}
              {activeTab === 'coupons' && <CouponsTab />}
              {activeTab === 'students' && <StudentsManagementTab />}
              {activeTab === 'lessons' && <LessonsTab isActive={activeTab === 'lessons'} />}
              {activeTab === 'placement-test' && <PlacementTestTab />}
              {activeTab === 'page-editor' && <PageEditorTab />}
              {activeTab === 'email' && <EmailTab />}
              {activeTab === 'system' && <SystemTab />}
            </>
          ) : children}
        </main>
      </div>
      {user.role === 'ADMIN' && <AdminAssistant />}
    </div>
  )
}