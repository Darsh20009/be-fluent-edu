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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          icon={Users} 
          label="إجمالي الطلاب" 
          subLabel="Total Students" 
          value={stats?.totalStudents || 0} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
          trend="+5%"
        />
        <StatCard 
          icon={UserCheck} 
          label="الطلاب النشطين" 
          subLabel="Active Students" 
          value={stats?.activeStudents || 0} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
          trend="+12%"
        />
        <StatCard 
          icon={TrendingUp} 
          label="إجمالي الإيرادات" 
          subLabel="Total Revenue" 
          value={`${stats?.totalRevenue.toLocaleString() || 0} EGP`} 
          color="text-teal-600" 
          bgColor="bg-teal-50" 
          trend="+8%"
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
          isWarning={(stats?.pendingSubscriptions ?? 0) > 0}
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
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              إجراءات سريعة / Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setActiveTab?.(action.tab)}
                  className="group p-5 bg-slate-50 rounded-2xl border border-transparent hover:bg-white hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 text-center flex flex-col items-center gap-3"
                >
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{action.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{action.subLabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Revenue Chart */}
          <Card className="p-8 rounded-3xl border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                  الإيرادات الشهرية / Monthly Revenue
                </h3>
                <p className="text-sm text-slate-500 mt-1">آخر 6 أشهر من الإيرادات المحصلة</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between gap-4 h-64 px-2">
              {stats?.monthlyRevenue.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full relative flex flex-col items-center">
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 scale-90 group-hover:scale-100">
                      {item.revenue.toLocaleString()} EGP
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[48px] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-xl transition-all duration-1000 ease-out group-hover:from-emerald-600 group-hover:to-teal-500 shadow-sm"
                      style={{ height: `${(item.revenue / maxRevenue) * 200 || 8}px` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-slate-900 transition-colors">{item.month}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Legend */}
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-bold">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span>الإيرادات المحصلة</span>
                </div>
              </div>
              <p>تم التحديث: {new Date().toLocaleTimeString()}</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Health & Activity */}
        <div className="space-y-8">
          {/* Platform Health */}
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              حالة النظام / Platform Health
            </h3>
            <div className="space-y-4">
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
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                نشاط حديث / Recent Activity
              </h3>
              <Link href="#" onClick={() => setActiveTab?.('subscriptions')} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                عرض الكل <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="divide-y divide-slate-50">
              <div className="px-6 py-3 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آخر الاشتراكات / Latest Subscriptions</p>
              </div>
              {stats?.recentSubscriptions.length ? stats.recentSubscriptions.map((sub: any) => (
                <div key={sub.id} className="p-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {sub.User.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{sub.User.name}</p>
                        <p className="text-[11px] text-slate-500 font-bold">{sub.Package.title}</p>
                      </div>
                    </div>
                    <Badge variant={sub.status === 'APPROVED' ? 'success' : sub.status === 'PENDING' ? 'warning' : 'error'} className="rounded-lg text-[10px] px-2 py-0.5">
                      {sub.status === 'APPROVED' ? 'مقبول' : sub.status === 'PENDING' ? 'معلق' : 'مرفوض'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>{sub.Package.price} EGP</span>
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase">No recent activity</p>
                </div>
              )}

              <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آخر المستخدمين / New Users</p>
              </div>
              {stats?.recentUsers.length ? stats.recentUsers.map((user: any) => (
                <div key={user.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        {user.role} • {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <p className="p-10 text-center text-xs text-slate-400 font-bold uppercase">No new users</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, subLabel, value, color, bgColor, trend, isWarning }: any) {
  return (
    <div className={`bg-white p-6 rounded-3xl border ${isWarning ? 'border-orange-200 shadow-orange-500/5' : 'border-slate-100 shadow-sm'} hover:shadow-xl hover:shadow-slate-500/5 transition-all duration-300 group relative overflow-hidden`}>
      {/* Background Icon Decoration */}
      <Icon className={`absolute -right-2 -bottom-2 w-20 h-20 ${color} opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-500`} />
      
      <div className="relative z-10">
        <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subLabel}</p>
          {trend && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {trend}
            </span>
          )}
        </div>
        
        <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] font-bold text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function HealthItem({ icon: Icon, label, subLabel, status }: any) {
  const isOnline = status === 'online'
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 ${isOnline ? 'bg-emerald-100/50' : 'bg-red-100/50'} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${isOnline ? 'text-emerald-600' : 'text-red-600'}`} />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{label}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{subLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-700' : 'text-red-700'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  )
}
