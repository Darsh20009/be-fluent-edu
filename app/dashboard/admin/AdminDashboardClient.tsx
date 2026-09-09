'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Home, Users, CreditCard, Activity, LogOut, Shield, BookOpen,
  GraduationCap, ClipboardList, Mail, Tag, ChevronRight, Menu, X,
  Bell, Settings, BarChart3, Globe, Layers, ChevronDown, PhoneCall
} from 'lucide-react'
import Link from 'next/link'
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
import LeadsTab from './components/LeadsTab'
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
    label: 'العملاء المحتملون',
    items: [
      { id: 'leads', label: 'طلبات الحجز', icon: PhoneCall },
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
    <div className="min-h-screen bg-[#f4f1e9] text-[#1f2924] [&_button]:rounded-none [&_input]:rounded-none [&_select]:rounded-none [&_textarea]:rounded-none" dir="rtl">
      {/* Sidebar */}
      <aside className={`
         fixed top-0 right-0 h-full z-50 w-72 border-l border-[#cfcfc4] bg-[#f8f6f0] shadow-2xl shadow-[#1f2924]/10
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
          <div className="flex items-center justify-between border-b border-[#d7d4ca] px-6 py-6">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="grid h-11 w-11 place-items-center bg-[#174d3a] text-[#f8f6f0] transition-transform group-hover:scale-105">
               <Shield className="w-5 h-5" />
            </div>
            <div>
               <p className="text-lg font-black leading-none tracking-[-0.06em] text-[#174d3a]">Be Fluent</p>
               <p className="mt-1 text-[10px] font-bold tracking-[0.12em] text-[#758178]">لوحة الإدارة / ADMIN DESK</p>
            </div>
          </Link>
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* User Card */}
         <div className="mx-4 my-5 border border-[#d7d4ca] bg-[#eeece5] p-4">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center bg-[#174d3a] text-sm font-black text-[#f8f6f0]">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
               <p className="truncate text-sm font-bold text-[#1f2924]">{user.name}</p>
               <p className="text-[10px] font-black tracking-tight text-[#32654b]">{user.role === 'ADMIN' ? 'المدير العام / Super Admin' : 'مساعد / Assistant'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
         <nav className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4 pb-6">
          {MENU_GROUPS.map(group => (
            <div key={group.label} className="space-y-2">
               <p className="px-3 text-[10px] font-black tracking-[0.16em] text-[#758178]">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                       className={`flex w-full items-center gap-3 border-r-2 px-4 py-2.5 text-right text-sm font-bold transition-colors ${
                        isActive
                           ? 'border-[#174d3a] bg-[#dce9dc] text-[#174d3a]'
                           : 'border-transparent text-[#4c5750] hover:bg-[#eeece5] hover:text-[#174d3a]'
                      }`}
                    >
                       <Icon className={`h-5 w-5 ${isActive ? 'text-[#174d3a]' : 'text-[#758178]'}`} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
         <div className="space-y-2 border-t border-[#d7d4ca] p-4">
          <Link
            href="/dashboard/teacher"
             className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#4c5750] transition-colors hover:bg-[#eeece5] hover:text-[#174d3a]"
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
         <header className="sticky top-0 z-30 border-b border-[#d7d4ca] bg-[#f8f6f0]/95 backdrop-blur">
           <div className="flex items-center justify-between px-4 py-3 sm:px-8">
            <div className="flex items-center gap-4">
                 <button className="lg:hidden border border-[#c9c7bc] bg-[#f8f6f0] p-2 transition-all hover:bg-[#eeece5]" onClick={() => setSidebarOpen(true)}>
                 <Menu className="h-5 w-5 text-[#174d3a]" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                  <Link href="/dashboard/admin" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-emerald-600">{activeLabel}</span>
                </div>
                 <h1 className="text-xl font-black tracking-tight text-[#1f2924]">{activeLabel}</h1>
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
         <main className="flex-1 p-4 sm:p-6">
           <div className="mx-auto max-w-7xl">
            {activeTab === 'home'          && <HomeTab setActiveTab={setActiveTab} />}
            {activeTab === 'leads'         && <LeadsTab />}
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
