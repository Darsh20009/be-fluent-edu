'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, XCircle, User, Eye, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'

type SubscriptionStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
type PaymentMethod = 'BANK_TRANSFER' | 'E_WALLET'

interface Subscription {
  id: string
  status: SubscriptionStatus
  paymentMethod: PaymentMethod
  eWalletProvider?: string
  receiptUrl: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  approvedAt: string | null
  rejectedAt: string | null
  adminNotes: string | null
  User: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  Package: {
    title: string
    titleAr: string
    price: number
    lessonsCount: number
    durationDays: number
  }
  AssignedTeacher?: {
    id: string
    User: {
      name: string
      email: string
    }
  }
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

export default function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState('')
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [subsRes, teachersRes] = await Promise.all([
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/teachers')
      ])

      if (subsRes.ok) {
        const data = await subsRes.json()
        setSubscriptions(data)
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

  async function handleApprove() {
    if (!selectedSub || !selectedTeacher) {
      alert('Please select a teacher')
      return
    }

    setProcessing(selectedSub.id)
    try {
      const response = await fetch(`/api/admin/subscriptions/${selectedSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          assignedTeacherId: selectedTeacher,
          adminNotes: adminNotes || undefined
        })
      })

      if (response.ok) {
        await fetchData()
        setSelectedSub(null)
        setSelectedTeacher('')
        setAdminNotes('')
        alert('✓ Subscription approved and teacher assigned!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to approve subscription')
      }
    } catch (error) {
      console.error('Error approving subscription:', error)
      alert('Error approving subscription')
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(subscriptionId: string) {
    const notes = prompt('Reason for rejection (optional):')
    
    setProcessing(subscriptionId)
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          adminNotes: notes || undefined
        })
      })

      if (response.ok) {
        await fetchData()
        alert('Subscription rejected')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reject subscription')
      }
    } catch (error) {
      console.error('Error rejecting subscription:', error)
      alert('Error rejecting subscription')
    } finally {
      setProcessing(null)
    }
  }

  function getStatusBadge(status: SubscriptionStatus) {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'UNDER_REVIEW':
        return <Badge variant="info"><AlertCircle className="h-3 w-3 mr-1" />Under Review</Badge>
      case 'APPROVED':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const pendingReview = subscriptions.filter(s => s.status === 'PENDING' || s.status === 'UNDER_REVIEW')
  const approved = subscriptions.filter(s => s.status === 'APPROVED')
  const rejected = subscriptions.filter(s => s.status === 'REJECTED')

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#004E89]">
        Subscription Management / إدارة الاشتراكات
      </h2>

      {pendingReview.length > 0 && (
        <Alert variant="warning" className="bg-orange-50 border-orange-300">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">⚠️ {pendingReview.length} subscription(s) awaiting review / اشتراك(ات) تنتظر المراجعة</p>
            <p className="text-sm">Please review and take action (approve or reject) on the pending subscriptions below.</p>
            <p className="text-sm">يرجى مراجعة واتخاذ إجراء (الموافقة أو الرفض) على الاشتراكات المعلقة أدناه.</p>
          </div>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{pendingReview.length}</p>
            <p className="text-sm text-gray-600">Pending Review / قيد المراجعة</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{approved.length}</p>
            <p className="text-sm text-gray-600">Approved / موافق عليها</p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{rejected.length}</p>
            <p className="text-sm text-gray-600">Rejected / مرفوضة</p>
          </div>
        </Card>
      </div>

      {selectedSub && (
        <Card variant="elevated" className="bg-blue-50 border-blue-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Approve & Assign Teacher / الموافقة وتعيين المدرس</h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Student: {selectedSub.User.name}</p>
              <p className="text-sm text-gray-600">Package: {selectedSub.Package.title} / {selectedSub.Package.titleAr}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Teacher / تعيين المدرس *
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional) / ملاحظات المدير
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E89]"
                rows={3}
                placeholder="Add any notes..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleApprove}
                disabled={!selectedTeacher || processing === selectedSub.id}
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                {processing === selectedSub.id ? 'Processing...' : 'Approve / موافقة'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSub(null)
                  setSelectedTeacher('')
                  setAdminNotes('')
                }}
              >
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      {viewingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Payment Receipt / إيصال الدفع</h3>
              <Button variant="outline" size="sm" onClick={() => setViewingReceipt(null)}>
                Close / إغلاق
              </Button>
            </div>
            <div className="p-4">
              <img src={viewingReceipt} alt="Payment Receipt" className="w-full" />
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Pending Review / قيد المراجعة ({pendingReview.length})
        </h3>
        {pendingReview.length === 0 ? (
          <Alert variant="success">
            <CheckCircle className="h-5 w-5" />
            <p>No subscriptions pending review!</p>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pendingReview.map((sub) => (
              <Card key={sub.id} variant="elevated" className="border-l-4 border-orange-500">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{sub.User.name}</h3>
                        {getStatusBadge(sub.status)}
                      </div>
                      <p className="text-sm text-gray-600">{sub.User.email}</p>
                      {sub.User.phone && <p className="text-sm text-gray-600">📱 {sub.User.phone}</p>}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {sub.Package.title} / {sub.Package.titleAr}
                    </p>
                    <p className="text-sm text-gray-700">
                      💰 {sub.Package.price} SAR • 📚 {sub.Package.lessonsCount} lessons • ⏱️ {Math.ceil(sub.Package.durationDays / 30)} month(s)
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p><strong>Payment Method:</strong> {sub.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer (eg00)' : `E-Wallet (${sub.eWalletProvider})`}</p>
                    <p><strong>Requested:</strong> {new Date(sub.createdAt).toLocaleString('ar-EG')}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedSub(sub)}
                      disabled={!!processing}
                    >
                      <User className="h-4 w-4 ml-2" />
                      Assign & Approve / تعيين وموافقة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(sub.id)}
                      disabled={!!processing}
                    >
                      <XCircle className="h-4 w-4 ml-2" />
                      Reject / رفض
                    </Button>
                    {sub.receiptUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingReceipt(sub.receiptUrl)}
                      >
                        <Eye className="h-4 w-4 ml-2" />
                        View Receipt / عرض الإيصال
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {approved.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Approved / موافق عليها ({approved.length})
          </h3>
          <div className="space-y-4">
            {approved.slice(0, 10).map((sub) => (
              <Card key={sub.id} variant="elevated" className="border-l-4 border-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{sub.User.name}</h3>
                      {getStatusBadge(sub.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{sub.User.email}</p>
                    <p className="font-medium text-gray-900">
                      {sub.Package.title} / {sub.Package.titleAr}
                    </p>
                    <p className="text-sm text-gray-600">{sub.Package.price} SAR</p>
                    {sub.AssignedTeacher && (
                      <p className="text-sm text-blue-600 mt-1">
                        👨‍🏫 Teacher: {sub.AssignedTeacher.User.name}
                      </p>
                    )}
                    {sub.startDate && sub.endDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        📅 {new Date(sub.startDate).toLocaleDateString('ar-EG')} - {new Date(sub.endDate).toLocaleDateString('ar-EG')}
                      </p>
                    )}
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
