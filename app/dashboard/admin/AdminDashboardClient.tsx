'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Home, Users, CreditCard, Activity, LogOut, Shield, BookOpen, Headphones } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import HomeTab from './components/HomeTab'
import UsersTab from './components/UsersTab'
import SubscriptionsTab from './components/SubscriptionsTab'
import SystemTab from './components/SystemTab'
import StudentsManagementTab from './components/StudentsManagementTab'
import LessonsTab from '@/components/admin/LessonsTab'
import ListeningTab from './components/ListeningTab'

interface AdminDashboardClientProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const menuItems = [
    { id: 'home', label: 'Home / الرئيسية', icon: Home },
    { id: 'users', label: 'Users / المستخدمين', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions / الاشتراكات', icon: CreditCard },
    { id: 'students', label: 'Students / الطلاب', icon: BookOpen },
    { id: 'lessons', label: 'Lessons / الدروس', icon: BookOpen },
    { id: 'listening', label: 'Listening / الاستماع', icon: Headphones },
    { id: 'system', label: 'System / النظام', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5DC] to-white">
      <header className="bg-[#004E89] text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              <h1 className="text-xl sm:text-2xl font-bold">Youspeak</h1>
              <Badge variant="success" className="hidden sm:inline-flex">{user.role}</Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm hidden sm:block">{user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-white border-white hover:bg-white hover:text-[#004E89] text-xs sm:text-sm px-2 sm:px-4"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout / خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-64 lg:w-auto lg:flex-none
            transform lg:transform-none transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <Card variant="elevated" padding="none" className="h-full lg:h-auto bg-[#F5F1E8] border border-[#d4c9b8]">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between lg:justify-start gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#004E89] rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{user.role}</p>
                    </div>
                  </div>
                  <button
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors mb-1 ${
                        activeTab === item.id
                          ? 'bg-[#004E89] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </div>

          <div className="flex-1 min-w-0">
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'subscriptions' && <SubscriptionsTab />}
            {activeTab === 'students' && <StudentsManagementTab />}
            {activeTab === 'lessons' && <LessonsTab isActive={activeTab === 'lessons'} />}
            {activeTab === 'listening' && <ListeningTab isActive={activeTab === 'listening'} />}
            {activeTab === 'system' && <SystemTab />}
          </div>
        </div>
      </div>
      <FloatingContactButtons />
    </div>
  )
}