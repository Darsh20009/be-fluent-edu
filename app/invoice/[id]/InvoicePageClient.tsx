'use client'

import { useEffect, useState } from 'react'
import { Download, Printer, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

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

export default function InvoicePageClient({ 
  subscriptionId
}: { 
  subscriptionId: string
}) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [subscriptionId])

  async function fetchSubscription() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/student/subscriptions/${subscriptionId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Subscription not found / الفاتورة غير موجودة')
        } else if (response.status === 403) {
          setError('You do not have access to this invoice / لا يحق لك الوصول إلى هذه الفاتورة')
        } else {
          setError('Failed to load invoice / فشل تحميل الفاتورة')
        }
        setSubscription(null)
      } else {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError('An error occurred / حدث خطأ ما')
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !subscription) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Invoice Not Found / الفاتورة غير موجودة'}
          </h1>
          <Link href="/dashboard/student/my-orders">
            <Button variant="primary" className="mt-4">
              العودة للطلبات / Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    )
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
    <div className="min-h-screen bg-white">
      {/* Header Toolbar - Only visible on screen, not printed */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/student/my-orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة / Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Invoice / الفاتورة</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              طباعة / Print
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              تحميل / Download
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white p-12 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold mb-2">Be Fluent</h1>
              <p className="text-blue-100 text-lg">Fluency Comes First</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold opacity-20 mb-2">INVOICE</div>
              <div className="text-3xl font-bold text-blue-100">فاتورة</div>
            </div>
          </div>
        </div>

        <div className="px-12 space-y-8 pb-12">
          {/* INVOICE INFO */}
          <div className="grid grid-cols-4 gap-8 pb-8 border-b-2 border-gray-300">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Invoice Number</p>
              <p className="text-2xl font-bold text-gray-900">#{subscription.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Invoice Date</p>
              <p className="text-2xl font-bold text-gray-900">{invoiceDate}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Status</p>
              <p className="text-2xl font-bold text-green-600">PAID ✓</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Payment Method</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscription.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : subscription.eWalletProvider || 'E-Wallet'}
              </p>
            </div>
          </div>

          {/* BILL TO - CUSTOMER INFO */}
          <div className="grid grid-cols-2 gap-12 pb-8">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-4">Bill To</p>
              <div className="text-gray-900">
                <p className="font-bold text-xl mb-3">Customer / العميل</p>
                <p className="text-base text-gray-700 mb-2">Reference: {subscription.id.slice(0, 12)}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-4">Company / الشركة</p>
              <div className="text-gray-900">
                <p className="font-bold text-xl mb-2">Be Fluent</p>
                <p className="text-base text-gray-700 mb-1">Fluency Comes First</p>
                <p className="text-base text-gray-700">منصة تعليم اللغة الإنجليزية</p>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="pb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 border-y-2 border-gray-400">
                  <th className="px-6 py-4 text-left text-base font-bold text-gray-900">Description / الوصف</th>
                  <th className="px-6 py-4 text-center text-base font-bold text-gray-900">Qty</th>
                  <th className="px-6 py-4 text-right text-base font-bold text-gray-900">Unit Price</th>
                  <th className="px-6 py-4 text-right text-base font-bold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b-2 border-gray-300">
                  <td className="px-6 py-6">
                    <p className="font-bold text-gray-900 text-lg">{subscription.Package.titleAr || subscription.Package.title}</p>
                    <p className="text-base text-gray-700 mt-2">{subscription.Package.descriptionAr || subscription.Package.description}</p>
                    <div className="text-sm text-gray-600 mt-3 space-y-1">
                      <p>• Lessons / الحصص: {subscription.Package.lessonsCount}</p>
                      <p>• Duration / المدة: {subscription.Package.durationDays} days</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center text-gray-900 font-bold text-lg">1</td>
                  <td className="px-6 py-6 text-right text-gray-900 font-bold text-lg">{subscription.Package.price} SAR</td>
                  <td className="px-6 py-6 text-right text-gray-900 font-bold text-xl">{subscription.Package.price} SAR</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="flex justify-end pb-8 border-b-2 border-gray-300">
            <div className="w-96">
              <div className="flex justify-between mb-4 text-gray-700">
                <span className="font-bold text-lg">Subtotal / الإجمالي:</span>
                <span className="font-bold text-lg">{subscription.Package.price} SAR</span>
              </div>
              <div className="flex justify-between mb-6 text-gray-700 text-lg">
                <span className="font-bold">Tax / الضريبة:</span>
                <span className="font-bold">0.00 SAR</span>
              </div>
              <div className="flex justify-between bg-gradient-to-r from-[#10B981] to-[#059669] text-white p-6 rounded-lg">
                <span className="font-bold text-xl">Total Amount / الإجمالي:</span>
                <span className="font-bold text-3xl">{subscription.Package.price} SAR</span>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION DETAILS */}
          {subscription.startDate && subscription.endDate && (
            <div className="grid grid-cols-2 gap-8 pb-8 bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
              <div>
                <p className="text-gray-700 text-sm font-bold mb-2">Subscription Start / بدء الاشتراك:</p>
                <p className="text-gray-900 font-bold text-lg">{new Date(subscription.startDate).toLocaleDateString('ar-EG')}</p>
              </div>
              <div>
                <p className="text-gray-700 text-sm font-bold mb-2">Subscription Expires / انتهاء الاشتراك:</p>
                <p className="text-gray-900 font-bold text-lg">{new Date(subscription.endDate).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
          )}

          {/* PAYMENT REFERENCE */}
          {subscription.paymentReference && (
            <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
              <p className="text-gray-700 text-sm font-bold mb-3">Payment Reference / مرجع الدفع:</p>
              <p className="font-mono text-gray-900 font-bold text-lg tracking-wider">{subscription.paymentReference}</p>
            </div>
          )}

          {/* NOTES */}
          <div className="text-center py-8 border-t-2 border-gray-300 space-y-3">
            <p className="text-base text-gray-800">
              <span className="font-bold text-lg">Thank you for choosing Be Fluent!</span>
              <br />
              <span className="text-gray-700">شكراً لاختيارك منصة Be Fluent</span>
            </p>
            <p className="text-sm text-gray-600 mt-4">
              For any questions, contact: support@befluent.com
              <br />
              لأي استفسارات، تواصل معنا: support@befluent.com
              <br />
              +20 109 151 5594
            </p>
          </div>

          {/* FOOTER */}
          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-300">
            <p className="font-semibold">© 2025 Be Fluent Platform. All rights reserved.</p>
            <p className="mt-2">This is an electronically generated invoice. No signature required.</p>
            <p className="mt-1 italic">هذه فاتورة مولدة إلكترونياً. لا تتطلب توقيع.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
