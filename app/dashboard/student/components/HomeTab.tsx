'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Trophy, BookOpen, Clock, Flame, Star, Medal, Users, User, Heart, Search, Sparkles, TrendingUp, FileText, ArrowLeft, ClipboardList, CheckCircle, CreditCard, AlertCircle, MessageCircle, Bot, Layers, Mic } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GamificationHeader from '@/components/gamification/GamificationHeader'
import LevelProgressWidget from '@/components/gamification/LevelProgressWidget'

interface HomeTabProps {
  isActive: boolean
}

interface Stats {
  wordsLearned: number
  sessionsAttended: number
  pendingAssignments: number
  placementTestTaken?: boolean
  levelCurrent?: string | null
  activeSubscription: {
    packageTitle: string
    packageTitleAr: string
    startDate: Date
    endDate: Date
    lessonsTotal: number
    lessonsRemaining: number
    daysRemaining: number
  } | null
  nextSession: {
    id: string
    title: string
    startTime: Date
    endTime: Date
    teacherName: string
  } | null
}

export default function HomeTab({ isActive }: HomeTabProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    fetchStats()
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('صباح الخير')
    else if (hour < 17) setGreeting('طاب يومك')
    else setGreeting('مساء الخير')
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/student/stats')
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

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#10B981] p-8 sm:p-10 text-white shadow-2xl shadow-[#10B981]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-10 translate-y-10 blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider">{greeting} يا بطل!</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              جاهز لتطوير لغتك <br />
              <span className="text-[#D1FAE5]">اليوم؟</span>
            </h1>
            <p className="text-emerald-50/80 text-sm sm:text-base max-w-md font-medium leading-relaxed">
              استمر في التقدم، كل كلمة تتعلمها اليوم تقربك أكثر من الطلاقة التي تطمح إليها.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-amber-300 drop-shadow-lg" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-amber-400 rounded-2xl rotate-12 flex items-center justify-center shadow-lg">
                <Flame className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'الحصة القادمة', value: stats?.nextSession ? 'اليوم' : 'لا يوجد', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'واجبات معلقة', value: stats?.pendingAssignments || 0, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'XP الأسبوع', value: '450', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'أيام الحماس', value: '5', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-lg sm:text-xl font-black text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Placement Test Banner */}
      {!stats?.placementTestTaken && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ClipboardList size={120} />
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <h3 className="text-2xl font-black mb-2">تحديد المستوى</h3>
              <p className="text-amber-50 font-medium">ابدأ الآن بتحديد مستواك لتحصل على خطة دراسية مخصصة لك.</p>
            </div>
            <Link href="/placement-test">
              <Button className="bg-white text-orange-600 hover:bg-amber-50 font-black px-10 py-4 !rounded-2xl text-lg shadow-lg">
                ابدأ الاختبار الآن
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress & Subscription */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">تقدمك الحالي</h3>
              <Link href="/dashboard/student/level-progress" className="text-sm font-bold text-[#10B981] hover:underline">عرض التفاصيل</Link>
            </div>
            <LevelProgressWidget className="!shadow-none !border-0 !p-0" />
          </div>

          {/* Active Subscription */}
          {stats?.activeSubscription ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <CreditCard size={120} />
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black">باقتك الحالية</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">نوع الباقة</p>
                      <p className="text-2xl font-black text-emerald-400">{stats.activeSubscription.packageTitleAr}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">تبدأ في</p>
                        <p className="text-sm font-bold">{new Date(stats.activeSubscription.startDate).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">تنتهي في</p>
                        <p className="text-sm font-bold">{new Date(stats.activeSubscription.endDate).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">الحصص المتبقية</p>
                        <p className="text-4xl font-black text-white">{stats.activeSubscription.lessonsRemaining}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-400">من {stats.activeSubscription.lessonsTotal}</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${(stats.activeSubscription.lessonsRemaining / stats.activeSubscription.lessonsTotal) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-center mt-3 font-bold text-emerald-400 uppercase tracking-widest">
                      متبقي {stats.activeSubscription.daysRemaining} يوم على انتهاء الصلاحية
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-8 rounded-[2rem] text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-amber-900 mb-2">لا يوجد اشتراك نشط</h3>
              <p className="text-amber-700/80 mb-6 font-medium">اشترك الآن لتتمكن من حجز الحصص والوصول لكافة المميزات التعليمية.</p>
              <Link href="/packages">
                <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 !rounded-2xl px-8">استعرض الباقات</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Teacher & Support */}
        <div className="space-y-6">
          {/* Teacher Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#10B981]/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-[#10B981] w-5 h-5" />
                معلمك الخاص
              </h3>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-100 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                    <img src="https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=10B981&color=fff&size=128" alt="Teacher" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900">أ. أحمد محمد</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">المعلم الأساسي</p>
                </div>
                <div className="flex gap-2 w-full pt-2">
                  <Button variant="outline" size="sm" fullWidth className="!rounded-xl text-xs">دردشة</Button>
                  <Button variant="outline" size="sm" fullWidth className="!rounded-xl text-xs">جدول الحصص</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support */}
          <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black">الدعم الفني</h3>
            </div>
            <p className="text-sm text-blue-50/80 mb-4 font-medium leading-relaxed">لديك سؤال أو مشكلة؟ فريق الدعم متاح دائماً لمساعدتك.</p>
            <Link href="https://wa.me/201091515594" target="_blank">
              <button className="w-full py-3 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-50 transition shadow-lg">
                تحدث معنا الآن
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'الدروس التعليمية', desc: 'ابدأ درساً جديداً الآن', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/dashboard/student/lessons' },
          { title: 'بنك المفردات', desc: 'كلماتك التي تعلمتها', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/student/vocabulary' },
          { title: 'تدريب المحادثة', desc: 'مارس الإنجليزية مع AI', icon: Mic, color: 'text-rose-600', bg: 'bg-rose-50', link: '/dashboard/student/conversation-practice' },
        ].map((item, i) => (
          <Link key={i} href={item.link}>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-[#10B981]/50 hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h4 className="font-black text-gray-900 group-hover:text-[#10B981] transition-colors">{item.title}</h4>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

