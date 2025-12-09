'use client'

import { useState, useEffect } from 'react'
import { Users, UserCheck, BookOpen } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'

interface Student {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  Subscription: Subscription[]
}

interface Subscription {
  id: string
  Package: {
    title: string
    titleAr: string
  }
  AssignedTeacher: {
    id: string
    User: {
      name: string
      email: string
    }
  } | null
}

interface Teacher {
  id: string
  userId: string
  specialization: string | null
  User: {
    name: string
    email: string
  }
}

export default function StudentsManagementTab() {
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/teachers')
      ])

      if (studentsRes.ok) {
        const data = await studentsRes.json()
        setStudents(data)
      }

      if (teachersRes.ok) {
        const data = await teachersRes.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssignTeacher() {
    if (!selectedStudent || !selectedTeacherId) {
      alert('Please select a teacher')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/students/assign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          teacherId: selectedTeacherId
        })
      })

      if (response.ok) {
        alert('✓ Teacher assigned successfully! / تم تعيين المدرس بنجاح!')
        setSelectedStudent(null)
        setSelectedTeacherId('')
        await fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign teacher')
      }
    } catch (error) {
      console.error('Error assigning teacher:', error)
      alert('Error assigning teacher')
    } finally {
      setProcessing(false)
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
        Students Management / إدارة الطلاب
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#004E89]">{students.length}</p>
            <p className="text-sm text-gray-600">Total Students / إجمالي الطلاب</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {students.filter(s => {
                const activeSub = s.Subscription.find(sub => sub.AssignedTeacher)
                return activeSub !== undefined
              }).length}
            </p>
            <p className="text-sm text-gray-600">With Teacher / مع مدرس</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {students.filter(s => {
                const hasSubscription = s.Subscription.length > 0
                const hasTeacher = s.Subscription.some(sub => sub.AssignedTeacher)
                return hasSubscription && !hasTeacher
              }).length}
            </p>
            <p className="text-sm text-gray-600">Without Teacher / بدون مدرس</p>
          </div>
        </Card>
      </div>

      {selectedStudent && (
        <Card variant="elevated" className="bg-blue-50 border-blue-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Assign Teacher / تعيين مدرس
          </h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Student / الطالب: {selectedStudent.name}
              </p>
              <p className="text-sm text-gray-600">{selectedStudent.email}</p>
              {selectedStudent.Subscription.length > 0 && selectedStudent.Subscription[0] && (
                <p className="text-sm text-gray-600 mt-1">
                  📦 {selectedStudent.Subscription[0].Package.title} / {selectedStudent.Subscription[0].Package.titleAr}
                </p>
              )}
              {selectedStudent.Subscription.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ No active subscription / لا يوجد اشتراك نشط
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Teacher / اختر المدرس *
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E89]"
              >
                <option value="">Select a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.User.name} - {teacher.specialization || 'No specialization'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleAssignTeacher}
                disabled={!selectedTeacherId || processing}
              >
                <UserCheck className="h-4 w-4 ml-2" />
                {processing ? 'Processing...' : 'Assign / تعيين'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStudent(null)
                  setSelectedTeacherId('')
                }}
              >
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          All Students / جميع الطلاب ({students.length})
        </h3>
        <div className="space-y-4">
          {students.map((student) => {
            const subscription = student.Subscription.length > 0 ? student.Subscription[0] : null
            const hasTeacher = subscription?.AssignedTeacher !== null && subscription?.AssignedTeacher !== undefined

            return (
              <Card key={student.id} variant="elevated" className={`border-l-4 ${hasTeacher ? 'border-green-500' : 'border-orange-500'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                      {hasTeacher ? (
                        <Badge variant="success">
                          <UserCheck className="h-3 w-3 mr-1" />
                          With Teacher
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Users className="h-3 w-3 mr-1" />
                          No Teacher
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">{student.email}</p>
                    {student.phone && <p className="text-sm text-gray-600">📱 {student.phone}</p>}

                    {subscription && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-700">
                          <strong>Package:</strong> {subscription.Package.title} / {subscription.Package.titleAr}
                        </p>
                        {hasTeacher && subscription.AssignedTeacher && (
                          <p className="text-sm text-blue-600">
                            👨‍🏫 <strong>Teacher:</strong> {subscription.AssignedTeacher.User.name}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Joined: {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudent(student)}
                      disabled={!subscription}
                    >
                      <BookOpen className="h-4 w-4 ml-2" />
                      {hasTeacher ? 'Change Teacher' : 'Assign Teacher'}
                    </Button>
                    {!subscription && (
                      <p className="text-xs text-red-600 mt-1">
                        No subscription / لا يوجد اشتراك
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {students.length === 0 && (
          <Alert variant="info">
            <Users className="h-5 w-5" />
            <p>No students found</p>
          </Alert>
        )}
      </div>
    </div>
  )
}
