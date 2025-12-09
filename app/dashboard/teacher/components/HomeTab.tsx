'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, BookOpen, Clock, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'

interface Stats {
  totalStudents: number
  totalSessions: number
  upcomingSessions: number
  pendingGrading: number
  nextSession: {
    id: string
    title: string
    startTime: Date
    endTime: Date
    studentsCount: number
  } | null
}

export default function HomeTab({ teacherProfileId }: { teacherProfileId: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/teacher/stats')
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
      <h2 className="text-3xl font-bold text-[#004E89]">
        Dashboard / لوحة التحكم
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#004E89]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Students</h3>
            <p className="text-2xl font-bold text-[#004E89]">{stats?.totalStudents || 0}</p>
            <p className="text-sm text-gray-600">إجمالي الطلاب</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Sessions</h3>
            <p className="text-2xl font-bold text-[#004E89]">{stats?.totalSessions || 0}</p>
            <p className="text-sm text-gray-600">إجمالي الحصص</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Upcoming Sessions</h3>
            <p className="text-2xl font-bold text-[#004E89]">{stats?.upcomingSessions || 0}</p>
            <p className="text-sm text-gray-600">حصص قادمة</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Pending Grading</h3>
            <p className="text-2xl font-bold text-[#004E89]">{stats?.pendingGrading || 0}</p>
            <p className="text-sm text-gray-600">في انتظار التصحيح</p>
          </div>
        </Card>
      </div>

      {stats?.nextSession && (
        <Card variant="elevated">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-[#004E89]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Next Session / الحصة القادمة
                <Badge variant="primary">Upcoming</Badge>
              </h3>
              <p className="text-sm text-gray-700 font-medium">{stats.nextSession.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(stats.nextSession.startTime).toLocaleString('ar-EG', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} • {stats.nextSession.studentsCount} students enrolled
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-xl font-bold text-[#004E89] mb-4">
          Quick Actions / إجراءات سريعة
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 flex items-start gap-2 shadow-sm">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Create Sessions</p>
              <p className="text-sm text-gray-600">Schedule new classes in Sessions tab / جدولة حصص جديدة</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-start gap-2 shadow-sm">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Grade Assignments</p>
              <p className="text-sm text-gray-600">Review homework in Assignments tab / مراجعة الواجبات</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-start gap-2 shadow-sm">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Manage Students</p>
              <p className="text-sm text-gray-600">View student progress / عرض تقدم الطلاب</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-start gap-2 shadow-sm">
            <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Track Progress</p>
              <p className="text-sm text-gray-600">Monitor attendance and performance / متابعة الحضور والأداء</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
