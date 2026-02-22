'use client'

import { useState, useEffect } from 'react'
import { 
  Users, UserCheck, Calendar, TrendingUp, Clock, AlertCircle, 
  CreditCard, Activity, UserPlus, CheckCircle2, FileText, Send,
  Server, Mail as MailIcon, BarChart3, ArrowRight
} from 'lucide-react'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalStudents: number
  activeStudents: number
  totalTeachers: number
  totalSessions: number
  sessionsThisWeek: number
  pendingSubscriptions: number
  totalRevenue: number
  recentSubscriptions: any[]
  recentUsers: any[]
  monthlyRevenue: { month: string, revenue: number }[]
  health: {
    database: string
    email: string
  }
}

export default function HomeTab({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quickActions = [
    { label: 'إضافة معلم', subLabel: 'Add Teacher', icon: UserPlus, color: 'bg-blue-500', tab: 'users' },
    { label: 'قبول الاشتراكات', subLabel: 'Approve Subscriptions', icon: CheckCircle2, color: 'bg-emerald-500', tab: 'subscriptions' },
    { label: 'عرض السجلات', subLabel: 'View Logs', icon: FileText, color: 'bg-purple-500', tab: 'system' },
    { label: 'إرسال رابط اختبار', subLabel: 'Send Test Link', icon: Send, color: 'bg-orange-500', tab: 'email' },
  ]

  const maxRevenue = Math.max(...(stats?.monthlyRevenue.map(r => r.revenue) || [1]))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          icon={Users} 
          label="إجمالي الطلاب" 
          subLabel="Total Students" 
          value={stats?.totalStudents || 0} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          icon={UserCheck} 
          label="الطلاب النشطين" 
          subLabel="Active Students" 
          value={stats?.activeStudents || 0} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="إجمالي الإيرادات" 
          subLabel="Total Revenue" 
          value={`${stats?.totalRevenue.toLocaleString() || 0} EGP`} 
          color="text-teal-600" 
          bgColor="bg-teal-50" 
        />
        <StatCard 
          icon={Calendar} 
          label="حصص الأسبوع" 
          subLabel="Sessions This Week" 
          value={stats?.sessionsThisWeek || 0} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
        <StatCard 
          icon={Clock} 
          label="اشتراكات معلقة" 
          subLabel="Pending Subs" 
          value={stats?.pendingSubscriptions || 0} 
          color="text-orange-600" 
          bgColor="bg-orange-50" 
        />
        <StatCard 
          icon={Users} 
          label="عدد المعلمين" 
          subLabel="Teachers Count" 
          value={stats?.totalTeachers || 0} 
          color="text-indigo-600" 
          bgColor="bg-indigo-50" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Revenue Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              إجراءات سريعة / Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setActiveTab?.(action.tab)}
                  className="group p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-center flex flex-col items-center gap-3"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{action.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{action.subLabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                الإيرادات الشهرية / Monthly Revenue
              </h3>
            </div>
            <div className="flex items-end justify-between gap-2 h-48">
              {stats?.monthlyRevenue.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative flex flex-col items-center">
                    <div 
                      className="w-full max-w-[40px] bg-emerald-500 rounded-t-lg transition-all duration-1000 group-hover:bg-emerald-600"
                      style={{ height: `${(item.revenue / maxRevenue) * 160 || 4}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.revenue} EGP
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.month}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Health & Activity */}
        <div className="space-y-8">
          {/* Platform Health */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              حالة النظام / Platform Health
            </h3>
            <div className="space-y-3">
              <HealthItem 
                icon={Activity} 
                label="قاعدة البيانات" 
                subLabel="Database Status" 
                status={stats?.health.database === 'connected' ? 'online' : 'offline'} 
              />
              <HealthItem 
                icon={MailIcon} 
                label="خدمة البريد" 
                subLabel="Email Service" 
                status={stats?.health.email === 'active' ? 'online' : 'offline'} 
              />
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                نشاط حديث / Recent Activity
              </h3>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">آخر الاشتراكات / Latest Subscriptions</p>
              </div>
              <div className="divide-y divide-gray-50">
                {stats?.recentSubscriptions.length ? stats.recentSubscriptions.map((sub: any) => (
                  <div key={sub.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-gray-900">{sub.user.name}</p>
                      <Badge variant={sub.status === 'APPROVED' ? 'success' : sub.status === 'PENDING' ? 'warning' : 'error'}>
                        {sub.status === 'APPROVED' ? 'مقبول' : sub.status === 'PENDING' ? 'معلق' : 'مرفوض'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{sub.package.name} - {sub.package.price} EGP</p>
                  </div>
                )) : (
                  <p className="p-4 text-xs text-gray-400 text-center italic">لا يوجد نشاط مؤخراً</p>
                )}
              </div>
              <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">آخر المستخدمين / New Users</p>
              </div>
              <div className="divide-y divide-gray-50">
                {stats?.recentUsers.length ? stats.recentUsers.map((user: any) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{user.role} • {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="p-4 text-xs text-gray-400 text-center italic">لا يوجد مستخدمين جدد</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, subLabel, value, color, bgColor }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{subLabel}</p>
      <p className="text-lg font-black text-gray-900 mt-0.5 leading-none">{value}</p>
      <p className="text-[10px] font-medium text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function HealthItem({ icon: Icon, label, subLabel, status }: any) {
  const isOnline = status === 'online'
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${isOnline ? 'bg-emerald-50' : 'bg-red-50'} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${isOnline ? 'text-emerald-500' : 'text-red-500'}`} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">{label}</p>
          <p className="text-[10px] text-gray-400 font-medium uppercase">{subLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  )
}
