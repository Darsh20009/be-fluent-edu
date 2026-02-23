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
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full z-50 w-72 bg-white border-l border-slate-200 shadow-2xl
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-8 border-b border-slate-50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg tracking-tight leading-none">Be Fluent</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">لوحة الإدارة / Admin</p>
            </div>
          </Link>
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-4 my-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-100">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">{user.role === 'ADMIN' ? 'المدير العام / Super Admin' : 'مساعد / Assistant'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-8 custom-scrollbar">
          {MENU_GROUPS.map(group => (
            <div key={group.label} className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-[-4px]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/dashboard/teacher"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all"
          >
            <GraduationCap className="w-5 h-5 text-slate-400" />
            لوحة المعلم
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:pr-72 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                  <Link href="/dashboard/admin" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-emerald-600">{activeLabel}</span>
                </div>
                <h1 className="font-black text-slate-900 text-xl tracking-tight">{activeLabel}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification & Messages Icons */}
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative group">
                  <Bell className="w-5 h-5" />
                  {stats?.pendingSubscriptions > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />
                  )}
                  {/* Tooltip */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">التنبيهات</span>
                </button>
                <button className="hidden sm:flex p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative group">
                  <Mail className="w-5 h-5" />
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">الرسائل</span>
                </button>
                <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative group">
                  <Settings className="w-5 h-5" />
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">الإعدادات</span>
                </button>
              </div>

              <div className="h-8 w-px bg-slate-200 mx-1" />

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden sm:block text-left text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">{user.role === 'ADMIN' ? 'مدير النظام' : 'مساعد'}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-100">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'home'          && <HomeTab setActiveTab={setActiveTab} />}
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
