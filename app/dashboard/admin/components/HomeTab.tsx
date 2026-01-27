'use client'

import { useState, useEffect } from 'react'
import { Users, UserCheck, Calendar, TrendingUp, Clock, AlertCircle, CreditCard, Activity } from 'lucide-react'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'

interface Stats {
  totalUsers: number
  totalStudents: number
  activeStudents: number
  totalTeachers: number
  totalSessions: number
  sessionsThisWeek: number
  pendingSubscriptions: number
  totalRevenue: number
}

export default function HomeTab() {
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

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#10B981]">
        Dashboard / لوحة التحكم
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#10B981]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Users</h3>
            <p className="text-2xl font-bold text-[#10B981]">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Active Students</h3>
            <p className="text-2xl font-bold text-[#10B981]">{stats?.activeStudents || 0}</p>
            <p className="text-sm text-gray-600">
              of {stats?.totalStudents || 0} / من {stats?.totalStudents || 0}
            </p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Sessions This Week</h3>
            <p className="text-2xl font-bold text-[#10B981]">{stats?.sessionsThisWeek || 0}</p>
            <p className="text-sm text-gray-600">حصص هذا الأسبوع</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-[#10B981]">{stats?.totalRevenue || 0} EGP</p>
            <p className="text-sm text-gray-600">الإيرادات</p>
          </div>
        </Card>
      </div>

      {stats && stats.pendingSubscriptions > 0 && (
        <Card variant="elevated" className="bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pending Subscription Approvals</h3>
              <p className="text-sm text-gray-700">
                {stats.pendingSubscriptions} subscription(s) waiting for payment verification
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <h3 className="text-xl font-bold text-[#10B981] mb-4">
            Platform Statistics / إحصائيات المنصة
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Teachers / المدرسين</span>
              <Badge variant="primary">{stats?.totalTeachers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Sessions / الحصص</span>
              <Badge variant="info">{stats?.totalSessions || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Pending Subscriptions / اشتراكات معلقة</span>
              <Badge variant="warning">{stats?.pendingSubscriptions || 0}</Badge>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-xl font-bold text-[#10B981] mb-4">
            Quick Actions / إجراءات سريعة
          </h3>
          <div className="grid gap-3">
            <div className="bg-white rounded-lg p-3 flex items-start gap-2 shadow-sm">
              <Users className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">Activate/deactivate accounts in Users tab / إدارة المستخدمين</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 flex items-start gap-2 shadow-sm">
              <CreditCard className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Approve Subscriptions</p>
                <p className="text-sm text-gray-600">Review payments in Subscriptions tab / مراجعة الدفعات</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 flex items-start gap-2 shadow-sm">
              <Activity className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Monitor System</p>
                <p className="text-sm text-gray-600">Track activity logs in System tab / مراقبة نشاط النظام</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
