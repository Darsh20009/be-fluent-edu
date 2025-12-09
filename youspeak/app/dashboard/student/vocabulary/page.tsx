'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Calendar, 
  Layers, 
  GraduationCap,
  TrendingUp,
  Star,
  Clock,
  Target,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface VocabularyStats {
  totalWords: number
  dueForReview: number
  mastered: number
  totalCorrect: number
  totalIncorrect: number
}

export default function VocabularyPage() {
  const [stats, setStats] = useState<VocabularyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/vocabulary/flashcards?mode=all&limit=1')
      const data = await res.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
    setLoading(false)
  }

  const features = [
    {
      title: 'الكلمات اليومية',
      titleEn: 'Daily Words',
      description: '5 كلمات جديدة كل يوم لتوسيع مفرداتك',
      icon: Calendar,
      href: '/dashboard/student/vocabulary/daily',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'بطاقات التكرار',
      titleEn: 'Flashcards',
      description: 'راجع كلماتك باستخدام نظام التكرار المتباعد',
      icon: Layers,
      href: '/dashboard/student/vocabulary/flashcards',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      badge: stats?.dueForReview ? `${stats.dueForReview} للمراجعة` : undefined
    },
    {
      title: 'اختبار الكلمات',
      titleEn: 'Word Test',
      description: 'اختبر نفسك واكتشف مستواك الحقيقي',
      icon: GraduationCap,
      href: '/dashboard/student/vocabulary/test',
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة للوحة التحكم</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            نظام المفردات
          </h1>
          <p className="text-gray-600 text-lg">
            تعلم كلمات جديدة كل يوم وحسّن مفرداتك الإنجليزية
          </p>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalWords}</p>
                  <p className="text-sm text-gray-500">إجمالي الكلمات</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.dueForReview}</p>
                  <p className="text-sm text-gray-500">تحتاج مراجعة</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.mastered}</p>
                  <p className="text-sm text-gray-500">تم إتقانها</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalCorrect + stats.totalIncorrect > 0 
                      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalIncorrect)) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-500">نسبة النجاح</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {feature.titleEn}
                      </p>
                    </div>
                    {feature.badge && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>ابدأ الآن</span>
                    <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">نصيحة اليوم</h3>
              <p className="text-white/90">
                حاول مراجعة الكلمات الجديدة مرتين على الأقل يومياً - مرة في الصباح ومرة في المساء. 
                هذا يساعد على تثبيت الكلمات في الذاكرة طويلة المدى.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
