'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Home, Users, CreditCard, Activity, LogOut, Shield, BookOpen,
  GraduationCap, ClipboardList, Mail, Tag, ChevronRight, Menu, X,
  Bell, Settings, BarChart3, Globe, Layers, ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HomeTab from './components/HomeTab'
import UsersTab from './components/UsersTab'
import SubscriptionsTab from './components/SubscriptionsTab'
import SystemTab from './components/SystemTab'
import StudentsManagementTab from './components/StudentsManagementTab'
import LessonsTab from '@/components/admin/LessonsTab'
import PlacementTestTab from './components/PlacementTestTab'
import EmailTab from './components/EmailTab'
import CouponsTab from './components/CouponsTab'
import PageEditorTab from './components/PageEditorTab'
import FloatingContactButtons from '@/components/FloatingContactButtons'

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
    label: 'إدارة المستخدمين',
    items: [
      { id: 'users',         label: 'المستخدمين',       icon: Users },
      { id: 'students',      label: 'الطلاب',            icon: BookOpen },
      { id: 'subscriptions', label: 'الاشتراكات',        icon: CreditCard },
      { id: 'coupons',       label: 'الكوبونات',         icon: Tag },
    ]
  },
  {
    label: 'المحتوى التعليمي',
    items: [
      { id: 'lessons',         label: 'الدروس',              icon: Layers },
      { id: 'placement-test',  label: 'اختبار تحديد المستوى', icon: ClipboardList },
      { id: 'page-editor',     label: 'محرر الصفحات (CMS)',   icon: Globe },
    ]
  },
  {
    label: 'النظام',
    items: [
      { id: 'email',  label: 'البريد المباشر', icon: Mail },
      { id: 'system', label: 'النظام والسجلات', icon: Activity },
    ]
  }
]

export default function AdminDashboardClient({ user }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d) }).catch(() => {})
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const activeLabel = MENU_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'لوحة التحكم'

  return (
    <div className="min-h-screen bg-[#F4F6FA]" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full z-50 w-64 bg-white border-l border-gray-200 shadow-2xl
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">Be Fluent</p>
              <p className="text-[10px] text-gray-400 font-medium">لوحة الإدارة</p>
            </div>
          </Link>
          <button className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-4 my-4 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-200">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-sm truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase">{user.role === 'ADMIN' ? 'مدير النظام' : 'مساعد'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {MENU_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-bold ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 space-y-1.5">
          <Link
            href="/dashboard/teacher"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <GraduationCap className="w-4 h-4 text-gray-400" />
            لوحة المعلم
          </Link>
          <Link
            href="/admin/placement-test"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <ClipboardList className="w-4 h-4 text-gray-400" />
            إدارة بنك الأسئلة
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:pr-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="font-black text-gray-900 text-lg">{activeLabel}</h1>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>لوحة الإدارة</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-emerald-600 font-bold">{activeLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick stats in header */}
              {stats && (
                <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <div className="text-center">
                    <p className="font-black text-gray-900">{stats.totalStudents || 0}</p>
                    <p className="text-gray-400">طالب</p>
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="text-center">
                    <p className="font-black text-orange-600">{stats.pendingSubscriptions || 0}</p>
                    <p className="text-gray-400">معلق</p>
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="text-center">
                    <p className="font-black text-emerald-600">{stats.activeStudents || 0}</p>
                    <p className="text-gray-400">نشط</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-emerald-200">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-black text-gray-900">{user.name}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">{user.role === 'ADMIN' ? 'مدير' : 'مساعد'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'home'          && <HomeTab />}
            {activeTab === 'users'         && <UsersTab />}
            {activeTab === 'subscriptions' && <SubscriptionsTab />}
            {activeTab === 'coupons'       && <CouponsTab />}
            {activeTab === 'students'      && <StudentsManagementTab />}
            {activeTab === 'lessons'       && <LessonsTab isActive={activeTab === 'lessons'} />}
            {activeTab === 'placement-test' && <PlacementTestTab />}
            {activeTab === 'page-editor'   && <PageEditorTab />}
            {activeTab === 'email'         && <EmailTab />}
            {activeTab === 'system'        && <SystemTab />}
          </div>
        </main>
      </div>

      <FloatingContactButtons />
    </div>
  )
}
