'use client'

import { useState, useEffect } from 'react'
import { UserPlus, CheckCircle, XCircle, Shield } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

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

export default function UsersTab({ canCreateEmployees }: { canCreateEmployees: boolean }) {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'STAFF'>('ALL')
  const [showCreateEmployee, setShowCreateEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    role: 'TEACHER' as 'TEACHER' | 'STAFF',
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

  async function toggleUserStatus(userId: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await fetchUsers()
        toast.success(t('تم تحديث حالة المستخدم بنجاح', 'User status updated'))
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`Failed to update user status: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Error updating user status')
    }
  }

  async function handleCreateEmployee() {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      toast.error(t('يرجى ملء جميع الحقول المطلوبة', 'Please fill in all required fields'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/people/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })

      if (response.ok) {
        await fetchUsers()
        setNewEmployee({ name: '', email: '', password: '', phone: '', bio: '', role: 'TEACHER' })
        setShowCreateEmployee(false)
        toast.success(t('تم إنشاء الحساب بنجاح', 'Account created'))
      } else {
        const data = await response.json()
        const code = data?.error?.code
        toast.error(code === 'EMAIL_IN_USE'
          ? t('هذا البريد مسجل بالفعل', 'This email is already in use')
          : code === 'INVALID_EMPLOYEE'
            ? t('تحقق من البيانات وكلمة المرور (12 حرفًا على الأقل)', 'Check the details and password (at least 12 characters)')
            : t('تعذر إنشاء الحساب', 'Could not create account'))
      }
    } catch (error) {
      console.error('Error creating employee:', error)
      toast.error(t('تعذر إنشاء الحساب', 'Could not create account'))
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
  const teachers = users.filter(u => u.role === 'TEACHER')
  const staff = users.filter(u => ['STAFF', 'ASSISTANT', 'MANAGER'].includes(u.role))

  return (
    <div className="space-y-6" dir={localeDirection(language)}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#10B981]">
          {t('المستخدمون', 'Users')}
        </h2>
        {canCreateEmployees && (
          <Button
            variant="primary"
            onClick={() => setShowCreateEmployee(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('إضافة موظف', 'Add employee')}
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981]">{users.length}</p>
            <p className="text-sm text-gray-600">{t('إجمالي المستخدمين', 'Total users')}</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981]">{students.length}</p>
            <p className="text-sm text-gray-600">{t('الطلاب', 'Students')}</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981]">{teachers.length}</p>
            <p className="text-sm text-gray-600">{t('المعلمون', 'Teachers')}</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981]">{staff.length}</p>
            <p className="text-sm text-gray-600">{t('الموظفون', 'Staff')}</p>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'ALL' ? 'primary' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          {t('الكل', 'All')} ({users.length})
        </Button>
        <Button
          variant={filter === 'STUDENT' ? 'primary' : 'outline'}
          onClick={() => setFilter('STUDENT')}
        >
          {t('الطلاب', 'Students')} ({students.length})
        </Button>
        <Button
          variant={filter === 'TEACHER' ? 'primary' : 'outline'}
          onClick={() => setFilter('TEACHER')}
        >
          {t('المعلمون', 'Teachers')} ({teachers.length})
        </Button>
        <Button
          variant={filter === 'STAFF' ? 'primary' : 'outline'}
          onClick={() => setFilter('STAFF')}
        >
          {t('الموظفون', 'Staff')} ({staff.length})
        </Button>
      </div>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Alert variant="info">
            <p>{t('لم يتم العثور على مستخدمين.', 'No users found.')}</p>
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
                          {t('نشط', 'Active')}
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t('غير نشط', 'Inactive')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-600">{t('الهاتف:', 'Phone:')} {user.phone}</p>
                    )}
                    {user.Subscription && user.Subscription[0] && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-bold text-blue-700">
                          {user.Subscription[0].Package.titleAr} ({user.Subscription[0].status})
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {t('تاريخ الانضمام:', 'Joined:')} {new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                </div>
                {user.role !== 'ADMIN' && (
                  <Button
                    variant={user.isActive ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.isActive ? t('تعطيل', 'Deactivate') : t('تفعيل', 'Activate')}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {canCreateEmployees && showCreateEmployee && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateEmployee(false)}
          title={t('إنشاء حساب موظف', 'Create employee account')}
        >
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900">
              {t('نوع الحساب', 'Account type')}
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                value={newEmployee.role}
                onChange={(event) => setNewEmployee({ ...newEmployee, role: event.target.value as 'TEACHER' | 'STAFF' })}
              >
                <option value="TEACHER">{t('معلم', 'Teacher')}</option>
                <option value="STAFF">{t('موظف', 'Staff')}</option>
              </select>
            </label>
            {newEmployee.role === 'STAFF' && <p className="text-sm text-gray-600">
              {t('يحتاج حساب STAFF إلى أن يحدد ADMIN صلاحياته قبل استخدام أدوات الموظفين.', 'An ADMIN must assign permissions before a STAFF account can use staff tools.')}
            </p>}
            <Input
              label={t('الاسم الكامل *', 'Full name *')}
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              placeholder="e.g., Ahmed Hassan"
            />
            <Input
              label={t('البريد الإلكتروني *', 'Email address *')}
              type="email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              placeholder="teacher@example.com"
            />
            <Input
              label={t('كلمة مرور أولية (12 حرفًا على الأقل) *', 'Initial password (at least 12 characters) *')}
              type="password"
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
              placeholder="Secure password"
            />
            <Input
              label={t('رقم الهاتف (اختياري)', 'Phone number (optional)')}
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              placeholder="+966XXXXXXXXX"
            />
            {newEmployee.role === 'TEACHER' && <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('السيرة الذاتية (اختياري)', 'Bio (optional)')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                value={newEmployee.bio}
                onChange={(e) => setNewEmployee({ ...newEmployee, bio: e.target.value })}
                placeholder="Teacher background and experience..."
                rows={3}
              />
            </div>}
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateEmployee}
                disabled={submitting}
              >
                {submitting ? t('جارٍ الإنشاء...', 'Creating…') : t('إنشاء الحساب', 'Create account')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCreateEmployee(false)}
              >
                {t('إلغاء', 'Cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
