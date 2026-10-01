'use client'

import { useCallback, useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Home, Users, CreditCard, Activity, LogOut, Shield, BookOpen,
  GraduationCap, ClipboardList, Mail, Tag, ChevronRight, Menu, X,
  Globe, Layers, PhoneCall
} from 'lucide-react'
import Link from 'next/link'
import HomeTab, { type AdminOverviewStats } from './components/AdminOverviewRedesign'
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

interface Props {
  user: { name: string; email: string; role: string }
}

const MENU_GROUPS = [
  {
    label: 'الرئيسية',
    items: [
      { id: 'home', label: 'لوحة التحكم', icon: Home },
    ]
  },
  {
    label: 'العملاء المحتملون',
    items: [
      { id: 'leads', label: 'طلبات الحجز', icon: PhoneCall },
    ]
  },
  {
    label: 'إدارة المستخدمين',
    items: [
      { id: 'users', label: 'المستخدمين', icon: Users },
      { id: 'students', label: 'الطلاب', icon: BookOpen },
      { id: 'subscriptions', label: 'الاشتراكات', icon: CreditCard },
      { id: 'coupons', label: 'الكوبونات', icon: Tag },
    ]
  },
  {
    label: 'المحتوى التعليمي',
    items: [
      { id: 'lessons', label: 'الدروس', icon: Layers },
      { id: 'placement-test', label: 'اختبار تحديد المستوى', icon: ClipboardList },
      { id: 'page-editor', label: 'محرر الصفحات (CMS)', icon: Globe },
    ]
  },
  {
    label: 'النظام',
    items: [
      { id: 'email', label: 'البريد المباشر', icon: Mail },
      { id: 'system', label: 'النظام والسجلات', icon: Activity },
    ]
  }
]

export default function AdminDashboardClient({ user }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<AdminOverviewStats | null>(null)
  const [statsState, setStatsState] = useState<'loading' | 'ready' | 'error'>('loading')

  const loadStats = useCallback(async () => {
    setStatsState('loading')
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (!response.ok) throw new Error('Admin stats unavailable')
      setStats(await response.json() as AdminOverviewStats)
      setStatsState('ready')
    } catch {
      setStats(null)
      setStatsState('error')
    }
  }, [])

  useEffect(() => { void loadStats() }, [loadStats])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const activeLabel = MENU_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'لوحة التحكم'
  const pendingSubscriptions = typeof stats?.pendingSubscriptions === 'number' && Number.isFinite(stats.pendingSubscriptions)
    ? stats.pendingSubscriptions
    : null

  return (
    <div className="min-h-[100dvh] bg-[#f5f7f4] text-[#26332e]" dir="rtl">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-40 bg-[#172b21]/35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 flex w-[min(320px,88vw)] flex-col border-l border-[#e0e6e1] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100dvh] lg:w-[270px] lg:shrink-0 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex min-h-[76px] items-center justify-between border-b border-[#e8ece8] px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#247456] text-white">
              <Shield size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-[#26332e]">Be Fluent</span>
              <span className="mt-1 block text-[11px] font-medium text-[#76827a]">مساحة الإدارة</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="إغلاق القائمة"
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
            <span className="mt-1 block truncate text-xs text-[#718078]">{user.role === 'ADMIN' ? 'مدير النظام' : 'مساعد'}</span>
          </span>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="التنقل الرئيسي للإدارة">
          {MENU_GROUPS.map(group => (
            <section key={group.label}>
              <h2 className="px-3 pb-2 text-[11px] font-semibold text-[#839087]">{group.label}</h2>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon
                  const selected = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={selected ? 'page' : undefined}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-right text-sm transition-colors ${
                        selected ? 'bg-[#edf5ef] font-bold text-[#225d41]' : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {item.id === 'subscriptions' && pendingSubscriptions !== null && pendingSubscriptions > 0 && (
                        <span className="min-w-6 rounded-full bg-[#f5f1e7] px-2 py-1 text-center text-[11px] font-bold tabular-nums text-[#80662d]">
                          {pendingSubscriptions}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="space-y-1 border-t border-[#e8ece8] p-3">
          <Link href="/dashboard/teacher" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]">
            <GraduationCap size={18} aria-hidden="true" />
            لوحة المعلم
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#80534b] hover:bg-[#faf3f1]"
          >
            <LogOut size={18} aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="min-h-[100dvh] lg:-mt-[100dvh] lg:mr-[270px]">
        <header className="sticky top-0 z-30 border-b border-[#e0e6e1] bg-white/95">
          <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="فتح القائمة"
                aria-expanded={sidebarOpen}
                className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[#e0e6e1] text-[#315f49] hover:bg-[#f2f7f2] lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={19} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <div className="mb-1 hidden items-center gap-1.5 text-[11px] font-medium text-[#89938d] sm:flex">
                  <span>الإدارة</span>
                  <ChevronRight size={13} aria-hidden="true" />
                  <span className="truncate text-[#477557]">{activeLabel}</span>
                </div>
                <h1 className="truncate text-lg font-bold text-[#26332e] sm:text-xl">{activeLabel}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-[#344239]">{user.name}</span>
                <span className="mt-1 block text-[11px] text-[#718078]">{user.role === 'ADMIN' ? 'مدير النظام' : 'مساعد'}</span>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f0e8] text-sm font-extrabold text-[#286547]">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">
          {activeTab === 'home' && <HomeTab stats={stats} statsState={statsState} onRetryStats={loadStats} />}
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
        </main>
      </div>
    </div>
  )
}