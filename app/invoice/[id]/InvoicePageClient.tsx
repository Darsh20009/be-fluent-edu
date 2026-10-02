'use client'

import { useEffect, useState } from 'react'
import { Download, Printer, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import LanguageToggle from '@/components/LanguageToggle'

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
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
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
          setError(t('الفاتورة غير موجودة', 'Invoice not found'))
        } else if (response.status === 403) {
          setError(t('لا يحق لك الوصول إلى هذه الفاتورة', 'You do not have access to this invoice'))
        } else {
          setError(t('فشل تحميل الفاتورة', 'Failed to load invoice'))
        }
        setSubscription(null)
      } else {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(t('حدث خطأ ما', 'An error occurred'))
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
      <div className="min-h-[100dvh] bg-[#f4f1e8] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4 rounded-full border-2 border-[#174c3c]/20 border-t-[#174c3c] animate-spin" />
          <p className="text-sm font-medium text-[#19372d]">{t('يتم إعداد الفاتورة...', 'Preparing invoice...')}</p>
        </div>
      </div>
    )
  }

  if (error || !subscription) {
    return (
      <div className="min-h-[100dvh] bg-[#f4f1e8] flex items-center justify-center p-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center bg-[#fbfaf5] border border-[#d6d2c3] p-10 max-w-md">
          <h1 className="text-2xl font-bold text-[#19372d] mb-2">
            {error || t('الفاتورة غير موجودة', 'Invoice not found')}
          </h1>
          <Link href="/dashboard/student/my-orders">
            <Button variant="primary" className="mt-4">
              {t('العودة للطلبات', 'Back to orders')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const invoiceDate = subscription.approvedAt 
    ? new Date(subscription.approvedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(subscription.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

  return (
    <div className="min-h-[100dvh] bg-[#f4f1e8]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Toolbar - Only visible on screen, not printed */}
      <div className="print:hidden bg-[#f7f5ed] border-b border-[#d6d2c3] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/student/my-orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('العودة', 'Back')}
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-[#19372d]">{t('الفاتورة', 'Invoice')}</h1>
          </div>
          <div className="flex gap-2">
            <LanguageToggle />
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t('طباعة', 'Print')}
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              {t('تحميل', 'Download')}
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" className="max-w-4xl mx-auto bg-[#fbfaf5] shadow-[0_18px_50px_rgba(25,52,43,.08)]">
        {/* HEADER */}
        <div className="bg-[#174c3c] text-[#f7f5ed] p-8 sm:p-12 mb-8 border-b-4 border-[#a3b7a4]">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold mb-2">Be Fluent</h1>
              <p className="text-[#d8e0d7] text-lg">Fluency Comes First</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold opacity-20 mb-2">INVOICE</div>
              <div className="text-3xl font-bold text-[#d8e0d7]">{t('فاتورة', 'Invoice')}</div>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-12 space-y-8 pb-12">
          {/* INVOICE INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-[#d6d2c3]">
            <div>
              <p className="text-[#718075] text-xs uppercase tracking-wide font-bold mb-2">{t('رقم الفاتورة', 'Invoice number')}</p>
              <p className="text-xl font-bold text-[#19372d]">#{subscription.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[#718075] text-xs uppercase tracking-wide font-bold mb-2">{t('تاريخ الفاتورة', 'Invoice date')}</p>
              <p className="text-xl font-bold text-[#19372d]">{invoiceDate}</p>
            </div>
            <div>
              <p className="text-[#718075] text-xs uppercase tracking-wide font-bold mb-2">{t('الحالة', 'Status')}</p>
              <p className="text-xl font-bold text-[#174c3c]">{t('مدفوع', 'PAID')}</p>
            </div>
            <div>
              <p className="text-[#718075] text-xs uppercase tracking-wide font-bold mb-2">{t('طريقة الدفع', 'Payment method')}</p>
              <p className="text-xl font-bold text-[#19372d]">
                {subscription.paymentMethod === 'BANK_TRANSFER' ? t('تحويل بنكي', 'Bank transfer') : subscription.eWalletProvider || t('محفظة إلكترونية', 'E-Wallet')}
              </p>
            </div>
          </div>

          {/* BILL TO - CUSTOMER INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 pb-8">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-4">{t('فاتورة إلى', 'Bill to')}</p>
              <div className="text-gray-900">
                <p className="font-bold text-xl mb-3">{t('العميل', 'Customer')}</p>
                <p className="text-base text-gray-700 mb-2">{t('المرجع:', 'Reference:')} {subscription.id.slice(0, 12)}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-4">{t('الشركة', 'Company')}</p>
              <div className="text-gray-900">
                <p className="font-bold text-xl mb-2">Be Fluent</p>
                <p className="text-base text-gray-700 mb-1">Fluency Comes First</p>
                <p className="text-base text-gray-700">{t('منصة تعليم اللغة الإنجليزية', 'English language learning platform')}</p>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="pb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-[#e8eee7] border-y border-[#bacaba]">
                  <th className="px-6 py-4 text-left text-base font-bold text-gray-900">{t('الوصف', 'Description')}</th>
                  <th className="px-6 py-4 text-center text-base font-bold text-gray-900">{t('الكمية', 'Qty')}</th>
                  <th className="px-6 py-4 text-right text-base font-bold text-gray-900">{t('سعر الوحدة', 'Unit price')}</th>
                  <th className="px-6 py-4 text-right text-base font-bold text-gray-900">{t('المبلغ', 'Amount')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b-2 border-gray-300">
                  <td className="px-6 py-6">
                    <p className="font-bold text-gray-900 text-lg">{language === 'ar' ? subscription.Package.titleAr || subscription.Package.title : subscription.Package.title}</p>
                    <p className="text-base text-gray-700 mt-2">{language === 'ar' ? subscription.Package.descriptionAr || subscription.Package.description : subscription.Package.description}</p>
                    <div className="text-sm text-gray-600 mt-3 space-y-1">
                      <p>{t('الحصص:', 'Lessons:')} {subscription.Package.lessonsCount}</p>
                      <p>{t('المدة:', 'Duration:')} {subscription.Package.durationDays} {t('يوماً', 'days')}</p>
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
                <span className="font-bold text-lg">{t('الإجمالي الفرعي:', 'Subtotal:')}</span>
                <span className="font-bold text-lg">{subscription.Package.price} SAR</span>
              </div>
              <div className="flex justify-between mb-6 text-gray-700 text-lg">
                <span className="font-bold">{t('الضريبة:', 'Tax:')}</span>
                <span className="font-bold">0.00 SAR</span>
              </div>
              <div className="flex justify-between bg-[#174c3c] text-[#f7f5ed] p-6">
                <span className="font-bold text-xl">{t('الإجمالي الكلي:', 'Total amount:')}</span>
                <span className="font-bold text-3xl">{subscription.Package.price} SAR</span>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION DETAILS */}
          {subscription.startDate && subscription.endDate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-8 bg-[#edf1e9] p-6 border border-[#c8d3c7]">
              <div>
                <p className="text-gray-700 text-sm font-bold mb-2">{t('بدء الاشتراك:', 'Subscription start:')}</p>
                <p className="text-gray-900 font-bold text-lg">{new Date(subscription.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
              </div>
              <div>
                <p className="text-gray-700 text-sm font-bold mb-2">{t('انتهاء الاشتراك:', 'Subscription expires:')}</p>
                <p className="text-gray-900 font-bold text-lg">{new Date(subscription.endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
              </div>
            </div>
          )}

          {/* PAYMENT REFERENCE */}
          {subscription.paymentReference && (
            <div className="bg-[#f1eee4] p-6 border border-[#d6d0bd]">
              <p className="text-gray-700 text-sm font-bold mb-3">{t('مرجع الدفع:', 'Payment reference:')}</p>
              <p className="font-mono text-gray-900 font-bold text-lg tracking-wider">{subscription.paymentReference}</p>
            </div>
          )}

          {/* NOTES */}
          <div className="text-center py-8 border-t-2 border-gray-300 space-y-3">
            <p className="text-base text-gray-800">
              <span className="font-bold text-lg">{t('شكراً لاختيارك منصة Be Fluent', 'Thank you for choosing Be Fluent!')}</span>
            </p>
            <p className="text-sm text-gray-600 mt-4">
              {t('لأي استفسارات، تواصل معنا:', 'For questions, contact:')} support@befluent.com
              <br />
              +20 109 151 5594
            </p>
          </div>

          {/* FOOTER */}
          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-300">
            <p className="font-semibold">© 2025 Be Fluent Platform. {t('جميع الحقوق محفوظة.', 'All rights reserved.')}</p>
            <p className="mt-2">{t('هذه فاتورة مولدة إلكترونياً. لا تتطلب توقيعاً.', 'This is an electronically generated invoice. No signature required.')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
