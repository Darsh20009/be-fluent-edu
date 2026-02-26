'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, CheckCircle, XCircle, Shield } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  phone: string | null
  createdAt: string
  Subscription?: {
    status: string
    Package: {
      title: string
      titleAr: string
    }
  }[]
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL')
  const [showCreateTeacher, setShowCreateTeacher] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await fetchUsers()
        toast.success('تم تحديث حالة المستخدم بنجاح / User status updated')
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`Failed to update user status: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Error updating user status')
    }
  }

  async function handleCreateTeacher() {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة / Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher)
      })

      if (response.ok) {
        await fetchUsers()
        setNewTeacher({ name: '', email: '', password: '', phone: '', bio: '' })
        setShowCreateTeacher(false)
        toast.success('تم إنشاء حساب المدرس بنجاح! / Teacher account created!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create teacher')
      }
    } catch (error) {
      console.error('Error creating teacher:', error)
      toast.error('Error creating teacher')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const filteredUsers = users.filter(u => filter === 'ALL' || u.role === filter)
  const students = users.filter(u => u.role === 'STUDENT')
  const teachers = users.filter(u => u.role === 'TEACHER' || (u.role === 'ADMIN' && u.name === 'Be Fluent'))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#10B981]">
          Users / المستخدمين
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateTeacher(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Teacher / إضافة مدرس
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981]">{users.length}</p>
            <p className="text-sm text-gray-600">Total Users / المستخدمين</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981]">{students.length}</p>
            <p className="text-sm text-gray-600">Students / الطلاب</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981]">{teachers.length}</p>
            <p className="text-sm text-gray-600">Teachers / المدرسين</p>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'ALL' ? 'primary' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          All ({users.length})
        </Button>
        <Button
          variant={filter === 'STUDENT' ? 'primary' : 'outline'}
          onClick={() => setFilter('STUDENT')}
        >
          Students ({students.length})
        </Button>
        <Button
          variant={filter === 'TEACHER' ? 'primary' : 'outline'}
          onClick={() => setFilter('TEACHER')}
        >
          Teachers ({teachers.length})
        </Button>
      </div>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Alert variant="info">
            <p>No users found.</p>
          </Alert>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} variant="elevated">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <Badge variant={user.role === 'ADMIN' ? 'accent' : user.role === 'TEACHER' ? 'primary' : 'info'}>
                        {user.role === 'ADMIN' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                      {user.isActive ? (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-600">Phone: {user.phone}</p>
                    )}
                    {user.Subscription && user.Subscription[0] && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-bold text-blue-700">
                          📦 {user.Subscription[0].Package.titleAr} ({user.Subscription[0].status})
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Joined: {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                {user.role !== 'ADMIN' && (
                  <Button
                    variant={user.isActive ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                  >
                    {user.isActive ? 'Deactivate / تعطيل' : 'Activate / تفعيل'}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {showCreateTeacher && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateTeacher(false)}
          title="Create New Teacher Account / إنشاء حساب مدرس جديد"
        >
          <div className="space-y-4">
            <Input
              label="Full Name / الاسم الكامل *"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              placeholder="e.g., Ahmed Hassan"
            />
            <Input
              label="Email Address / البريد الإلكتروني *"
              type="email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              placeholder="teacher@example.com"
            />
            <Input
              label="Password / كلمة المرور *"
              type="password"
              value={newTeacher.password}
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
              placeholder="Secure password"
            />
            <Input
              label="Phone Number / رقم الهاتف (Optional)"
              value={newTeacher.phone}
              onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
              placeholder="+966XXXXXXXXX"
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Bio / السيرة الذاتية (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                value={newTeacher.bio}
                onChange={(e) => setNewTeacher({ ...newTeacher, bio: e.target.value })}
                placeholder="Teacher background and experience..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateTeacher}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Teacher / إنشاء'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCreateTeacher(false)}
              >
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
