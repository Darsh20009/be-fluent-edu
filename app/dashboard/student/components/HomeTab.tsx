'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Trophy, BookOpen, Clock, Flame, Star, Medal } from 'lucide-react'
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

  useEffect(() => {
    fetchStats()
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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#10B981]">
        Dashboard / لوحة التحكم
      </h2>

      <GamificationHeader className="mb-2" />

      <LevelProgressWidget className="mb-4" />

      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-[#10B981]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Next Session</h3>
            {stats?.nextSession ? (
              <>
                <p className="text-sm text-gray-900 font-medium">{stats.nextSession.title}</p>
                <p className="text-xs text-gray-600">
                  {new Date(stats.nextSession.startTime).toLocaleString('ar-EG', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-600">مع {stats.nextSession.teacherName}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">No upcoming sessions</p>
                <p className="text-sm text-gray-600">لا توجد حصص قادمة</p>
              </>
            )}
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Words Learned</h3>
            <p className="text-2xl font-bold text-[#10B981]">{stats?.wordsLearned || 0}</p>
            <p className="text-sm text-gray-600">كلمة محفوظة</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Pending Assignments</h3>
            <p className="text-2xl font-bold text-[#10B981]">{stats?.pendingAssignments || 0}</p>
            <p className="text-sm text-gray-600">واجب مطلوب</p>
          </div>
        </Card>
      </div>

      {stats?.activeSubscription && (
        <Card variant="elevated" className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="text-xl font-bold text-[#10B981] mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-green-600" />
            Active Package / باقة نشطة
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Package Name / اسم الباقة</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.activeSubscription.packageTitle} / {stats.activeSubscription.packageTitleAr}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subscription Period / فترة الاشتراك</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(stats.activeSubscription.startDate).toLocaleDateString('ar-EG')} -{' '}
                  {new Date(stats.activeSubscription.endDate).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Remaining Lessons / حصص متبقية</p>
                <p className="text-3xl font-bold text-[#10B981]">
                  {stats.activeSubscription.lessonsRemaining}
                </p>
                <p className="text-sm text-gray-600">
                  of {stats.activeSubscription.lessonsTotal} / من {stats.activeSubscription.lessonsTotal}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Days Remaining / أيام متبقية</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeSubscription.daysRemaining}
                </p>
                <p className="text-sm text-gray-600">days / يوم</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card variant="elevated">
        <h3 className="text-xl font-bold text-[#10B981] mb-4">
          Quick Actions / إجراءات سريعة
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="https://wa.me/201091515594" target="_blank">
            <Button variant="outline" fullWidth>
              Contact Support / تواصل مع الدعم
            </Button>
          </Link>
          {isActive && (
            <Button variant="primary" fullWidth>
              View All Sessions / عرض جميع الحصص
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
