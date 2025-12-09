'use client'

import { useState, useEffect } from 'react'
import { User, CheckCircle, XCircle, Calendar, BookOpen, Trophy, Phone, Mail } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'

interface Student {
  id: string
  name: string
  email: string
  isActive: boolean
  phone: string | null
  studentProfile: {
    levelCurrent: string | null
    levelInitial: string | null
    goal: string | null
    targetLevel: string | null
  }
  sessionsCount: number
  wordsCount: number
  activeSubscription: {
    packageTitle: string
    endDate: string
    lessonsRemaining: number
  } | null
}

export default function StudentsTab({ teacherProfileId }: { teacherProfileId: string }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
    
    // Auto-refresh every 5 seconds to see new approvals
    const interval = setInterval(() => {
      fetchStudents()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  async function fetchStudents() {
    try {
      const response = await fetch('/api/teacher/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
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

  const activeStudents = students.filter(s => s.isActive)
  const inactiveStudents = students.filter(s => !s.isActive)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#004E89]">
        My Students / طلابي
      </h2>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Active Students / طلاب نشطون ({activeStudents.length})
        </h3>
        {activeStudents.length === 0 ? (
          <Alert variant="info">
            <p>No active students yet.</p>
            <p>لا يوجد طلاب نشطون بعد.</p>
          </Alert>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeStudents.map((student) => (
              <Card key={student.id} variant="elevated" padding="lg" className="hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#004E89] to-[#1A5F7A] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{student.name}</h3>
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active / نشط
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </div>

                    {student.activeSubscription && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="text-xs font-semibold text-blue-900 mb-1">
                          📦 {student.activeSubscription.packageTitle}
                        </div>
                        <div className="text-xs text-blue-700">
                          حصص متبقية: {student.activeSubscription.lessonsRemaining} | 
                          ينتهي: {new Date(student.activeSubscription.endDate).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-600 mb-1">المستوى</div>
                        <div className="text-sm font-bold text-[#004E89]">
                          {student.studentProfile?.levelCurrent || 'غير محدد'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <BookOpen className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                        <div className="text-sm font-bold text-gray-900">
                          {student.sessionsCount || 0}
                        </div>
                        <div className="text-xs text-gray-600">الحصص</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <Trophy className="h-4 w-4 mx-auto text-yellow-600 mb-1" />
                        <div className="text-sm font-bold text-gray-900">
                          {student.wordsCount || 0}
                        </div>
                        <div className="text-xs text-gray-600">الكلمات</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {inactiveStudents.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Inactive Students / طلاب غير نشطين ({inactiveStudents.length})
          </h3>
          <div className="space-y-4">
            {inactiveStudents.map((student) => (
              <Card key={student.id} variant="elevated" className="opacity-60">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-lg font-bold">
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-700">{student.name}</h3>
                      <Badge variant="warning">
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending Activation
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
