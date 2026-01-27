'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, Calendar, CheckCircle, Clock, XCircle, 
  AlertCircle, Download, Eye, ArrowLeft, FileText, User
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'

interface Subscription {
  id: string
  packageId: string
  status: string
  paid: boolean
  paymentMethod: string | null
  eWalletProvider: string | null
  paymentReference: string | null
  receiptUrl: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  approvedAt: string | null
  adminNotes: string | null
  Package: {
    id: string
    title: string
    titleAr: string
    description: string
    descriptionAr: string
    price: number
    lessonsCount: number
    durationDays: number
  }
  AssignedTeacher: {
    User: {
      name: string
      email: string
    }
  } | null
}

export default function MyOrdersClient() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  async function fetchSubscriptions() {
    try {
      const response = await fetch('/api/student/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (subscription: Subscription) => {
    // Check if subscription is expired
    if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
      return (
        <Badge variant="neutral">
          <Clock className="h-3 w-3 mr-1" />
          Expired / منتهي الصلاحية
        </Badge>
      )
    }
    
    switch (subscription.status) {
      case 'APPROVED':
        return (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            {subscription.startDate && new Date(subscription.startDate) <= new Date() ? 'Active / نشط' : 'Approved / مفعّل'}
          </Badge>
        )
      case 'UNDER_REVIEW':
        return (
          <Badge variant="warning">
            <Clock className="h-3 w-3 mr-1" />
            Under Review / قيد المراجعة
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="info">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending Payment / بانتظار الدفع
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="error">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected / مرفوض
          </Badge>
        )
      default:
        return <Badge variant="neutral">{subscription.status}</Badge>
    }
  }

  const getPaymentMethodDisplay = (subscription: Subscription) => {
    if (!subscription.paymentMethod) return 'Not specified / غير محدد'
    
    if (subscription.paymentMethod === 'BANK_TRANSFER') {
      return 'Bank Transfer / تحويل بنكي'
    } else if (subscription.paymentMethod === 'E_WALLET') {
      const provider = subscription.eWalletProvider
      if (provider === 'INSTAPAY') return 'InstaPay'
      if (provider === 'ETISALAT_CASH') return 'Etisalat Cash'
      if (provider === 'VODAFONE_CASH') return 'Vodafone Cash'
      return 'E-Wallet / محفظة إلكترونية'
    }
    return subscription.paymentMethod
  }

  const handleDownloadInvoice = (subscription: Subscription) => {
    window.open(`/invoice/${subscription.id}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F5F5DC] to-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5DC] to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard / العودة للوحة التحكم
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#10B981] mb-2">
            My Orders & Subscriptions / طلباتي واشتراكاتي
          </h1>
          <p className="text-gray-600">
            Track your package purchases and subscription status
            <br />
            تتبع مشترياتك وحالة اشتراكاتك
          </p>
        </div>

        {/* Orders List */}
        {subscriptions.length === 0 ? (
          <Alert variant="info">
            <Package className="h-5 w-5" />
            <div>
              <p className="font-semibold">No orders yet / لا توجد طلبات بعد</p>
              <p className="text-sm mt-1">
                Browse our packages and make your first purchase!
                <br />
                تصفح الباقات وقم بأول عملية شراء!
              </p>
              <Link href="/dashboard/student">
                <Button variant="primary" size="sm" className="mt-3">
                  Browse Packages / تصفح الباقات
                </Button>
              </Link>
            </div>
          </Alert>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Side - Package Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-xl font-bold text-[#10B981]">
                            {subscription.Package.titleAr || subscription.Package.title}
                          </h3>
                          {getStatusBadge(subscription)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {subscription.Package.descriptionAr || subscription.Package.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>{subscription.Package.lessonsCount} حصة</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{subscription.Package.durationDays} يوم</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date / تاريخ الطلب:</span>
                        <span className="font-medium">
                          {new Date(subscription.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method / طريقة الدفع:</span>
                        <span className="font-medium">{getPaymentMethodDisplay(subscription)}</span>
                      </div>
                      {subscription.paymentReference && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference / المرجع:</span>
                          <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {subscription.paymentReference}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600">Total Amount / المبلغ الإجمالي:</span>
                        <span className="text-xl font-bold text-[#10B981]">
                          {subscription.Package.price} SAR
                        </span>
                      </div>
                    </div>

                    {/* Assigned Teacher */}
                    {subscription.AssignedTeacher && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>
                          Assigned Teacher / المعلم المعين:{' '}
                          <strong>{subscription.AssignedTeacher.User.name}</strong>
                        </span>
                      </div>
                    )}

                    {/* Active Period */}
                    {subscription.startDate && subscription.endDate && (
                      <div className="mt-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            <strong>Active Period / فترة النشاط:</strong>{' '}
                            {new Date(subscription.startDate).toLocaleDateString('ar-EG')} -{' '}
                            {new Date(subscription.endDate).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {subscription.adminNotes && (
                      <Alert variant="info" className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <div>
                          <p className="font-semibold text-sm">Admin Notes / ملاحظات الإدارة:</p>
                          <p className="text-sm mt-1">{subscription.adminNotes}</p>
                        </div>
                      </Alert>
                    )}
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex lg:flex-col gap-2">
                    {subscription.receiptUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(subscription.receiptUrl!, '_blank')}
                        className="flex-1 lg:flex-none"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Receipt / عرض الإيصال
                      </Button>
                    )}
                    {subscription.status === 'APPROVED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDownloadInvoice(subscription)}
                        className="flex-1 lg:flex-none"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Invoice / الفاتورة
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function InvoiceModal({ subscription, onClose }: { subscription: Subscription; onClose: () => void }) {
  const handlePrint = () => {
    window.print()
  }

  const invoiceDate = subscription.approvedAt 
    ? new Date(subscription.approvedAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(subscription.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

  return (
    <Modal isOpen={true} onClose={onClose} title="Invoice / الفاتورة" size="lg">
      <div id="invoice-content" className="bg-white p-0">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-1">Be Fluent</h1>
              <p className="text-blue-100 text-sm">Fluency Comes First</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold opacity-20 mb-2">INVOICE</div>
              <div className="text-2xl font-bold text-blue-100">فاتورة</div>
            </div>
          </div>
        </div>

        <div className="px-8 space-y-6">
          {/* INVOICE INFO */}
          <div className="grid grid-cols-4 gap-6 pb-6 border-b-2 border-gray-200">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Invoice Number</p>
              <p className="text-lg font-bold text-gray-900">#{subscription.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Invoice Date</p>
              <p className="text-lg font-bold text-gray-900">{invoiceDate}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Status</p>
              <p className="text-lg font-bold text-green-600">PAID</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Payment Method</p>
              <p className="text-lg font-bold text-gray-900">
                {subscription.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : subscription.eWalletProvider || 'E-Wallet'}
              </p>
            </div>
          </div>

          {/* BILL TO - CUSTOMER INFO */}
          <div className="grid grid-cols-2 gap-8 pb-6">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">Bill To</p>
              <div className="text-gray-900">
                <p className="font-bold text-lg mb-2">Customer</p>
                <p className="text-sm text-gray-600">Reference: {subscription.id.slice(0, 12)}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">Company</p>
              <div className="text-gray-900">
                <p className="font-bold text-lg mb-1">Be Fluent</p>
                <p className="text-sm text-gray-600">Fluency Comes First</p>
                <p className="text-sm text-gray-600">منصة تعليم اللغة الإنجليزية</p>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="pb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Description / الوصف</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Unit Price</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">{subscription.Package.titleAr || subscription.Package.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{subscription.Package.descriptionAr || subscription.Package.description}</p>
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      <p>• Lessons / الحصص: {subscription.Package.lessonsCount}</p>
                      <p>• Duration / المدة: {subscription.Package.durationDays} days</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-900 font-medium">1</td>
                  <td className="px-4 py-4 text-right text-gray-900 font-medium">{subscription.Package.price} SAR</td>
                  <td className="px-4 py-4 text-right text-gray-900 font-bold text-lg">{subscription.Package.price} SAR</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="flex justify-end pb-6 border-b-2 border-gray-200">
            <div className="w-72">
              <div className="flex justify-between mb-3 text-gray-700">
                <span className="font-medium">Subtotal / الإجمالي:</span>
                <span className="font-medium">{subscription.Package.price} SAR</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-700 text-sm">
                <span className="font-medium">Tax / الضريبة:</span>
                <span className="font-medium">0.00 SAR</span>
              </div>
              <div className="flex justify-between bg-gradient-to-r from-[#10B981] to-[#059669] text-white p-4 rounded-lg">
                <span className="font-bold text-lg">Total Amount / الإجمالي:</span>
                <span className="font-bold text-2xl">{subscription.Package.price} SAR</span>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION DETAILS */}
          {subscription.startDate && subscription.endDate && (
            <div className="grid grid-cols-2 gap-6 pb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">Subscription Start / بدء الاشتراك:</p>
                <p className="text-gray-900 font-bold">{new Date(subscription.startDate).toLocaleDateString('ar-EG')}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">Subscription Expires / انتهاء الاشتراك:</p>
                <p className="text-gray-900 font-bold">{new Date(subscription.endDate).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
          )}

          {/* PAYMENT REFERENCE */}
          {subscription.paymentReference && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
              <p className="text-gray-600 text-sm font-semibold mb-2">Payment Reference / مرجع الدفع:</p>
              <p className="font-mono text-gray-900 font-bold tracking-wider">{subscription.paymentReference}</p>
            </div>
          )}

          {/* NOTES */}
          <div className="text-center py-6 border-t-2 border-gray-200 space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-bold">Thank you for choosing Be Fluent!</span>
              <br />
              <span className="text-gray-600">شكراً لاختيارك منصة Be Fluent</span>
            </p>
            <p className="text-xs text-gray-500 mt-3">
              For any questions, contact: support@befluent.com
              <br />
              لأي استفسارات، تواصل معنا: support@befluent.com
            </p>
          </div>

          {/* FOOTER */}
          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
            <p>© 2025 Be Fluent Platform. All rights reserved.</p>
            <p className="mt-1">This is an electronically generated invoice. No signature required.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t print:hidden bg-gray-50 p-4 rounded-b-lg">
        <Button variant="primary" fullWidth onClick={handlePrint}>
          <Download className="h-4 w-4 mr-2" />
          Print / Download / طباعة / تحميل
        </Button>
        <Button variant="outline" fullWidth onClick={onClose}>
          Close / إغلاق
        </Button>
      </div>
    </Modal>
  )
}
