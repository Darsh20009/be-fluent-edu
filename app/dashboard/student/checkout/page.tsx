'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Upload, CheckCircle, AlertCircle, Wallet, Tag } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'

interface Package {
  id: string
  title: string
  titleAr: string
  price: number
  lessonsCount: number
  durationDays: number
}

type PaymentMethod = 'BANK_TRANSFER' | 'E_WALLET'
type EWalletProvider = 'INSTAPAY' | 'ETISALAT_CASH'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get('packageId')

  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [eWalletProvider, setEWalletProvider] = useState<EWalletProvider | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [step, setStep] = useState<'method' | 'receipt' | 'success'>('method')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([])
  const [showCouponSelector, setShowCouponSelector] = useState(false)

  useEffect(() => {
    fetchAvailableCoupons()
  }, [])

  async function fetchAvailableCoupons() {
    try {
      const response = await fetch('/api/coupons/active')
      if (response.ok) {
        const data = await response.json()
        setAvailableCoupons(data)
      }
    } catch (error) {
      console.error('Error fetching active coupons:', error)
    }
  }

  async function handleApplyCoupon(code: string) {
    if (!code) return
    try {
      const response = await fetch(`/api/coupons/validate?code=${code.toUpperCase()}&packageId=${packageId}`)
      if (response.ok) {
        const data = await response.json()
        setAppliedCoupon({ code: data.code, discount: parseInt(data.discount) })
        toast.success('Coupon applied! / تم تطبيق الكوبون')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Invalid coupon / كوبون غير صالح')
      }
    } catch (error) {
      toast.error('Error applying coupon')
    }
  }

  const finalPrice = pkg ? (appliedCoupon ? Math.floor(pkg.price * (1 - appliedCoupon.discount / 100)) : pkg.price) : 0

  useEffect(() => {
    if (packageId) {
      fetchPackage()
    }
  }, [packageId])

  async function fetchPackage() {
    try {
      const response = await fetch(`/api/packages/${packageId}`)
      if (response.ok) {
        const data = await response.json()
        setPkg(data)
      } else {
        alert('Package not found')
        router.push('/dashboard/student/cart')
      }
    } catch (error) {
      console.error('Error fetching package:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateSubscription() {
    if (!paymentMethod || !pkg) return
    if (paymentMethod === 'E_WALLET' && !eWalletProvider) {
      alert('Please select an e-wallet provider')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          paymentMethod,
          eWalletProvider
        })
      })

      if (response.ok) {
        const subscription = await response.json()
        setSubscriptionId(subscription.id)
        setStep('receipt')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Error creating subscription')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUploadReceipt() {
    if (!receiptFile || !subscriptionId) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('subscriptionId', subscriptionId)
      formData.append('receipt', receiptFile)

      const response = await fetch('/api/upload/receipt', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setStep('success')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload receipt')
      }
    } catch (error) {
      console.error('Error uploading receipt:', error)
      alert('Error uploading receipt')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!pkg) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#10B981] mb-2">Checkout / الدفع</h1>
        <p className="text-gray-600">Complete your subscription purchase</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {step === 'method' && (
            <>
              <Card variant="elevated">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Select Payment Method / اختر طريقة الدفع
                </h2>

                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`w-full p-4 border-2 rounded-lg text-right transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-[#10B981] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CreditCard className={`h-6 w-6 ${
                        paymentMethod === 'BANK_TRANSFER' ? 'text-[#10B981]' : 'text-gray-600'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Bank Transfer / تحويل بنكي</h3>
                        <p className="text-sm text-gray-600">Transfer to our bank account</p>
                      </div>
                      {paymentMethod === 'BANK_TRANSFER' && (
                        <CheckCircle className="h-5 w-5 text-[#10B981]" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('E_WALLET')}
                    className={`w-full p-4 border-2 rounded-lg text-right transition-all ${
                      paymentMethod === 'E_WALLET'
                        ? 'border-[#10B981] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Wallet className={`h-6 w-6 ${
                        paymentMethod === 'E_WALLET' ? 'text-[#10B981]' : 'text-gray-600'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">E-Wallet / محفظة إلكترونية</h3>
                        <p className="text-sm text-gray-600">Pay via InstaPay or Etisalat Cash</p>
                      </div>
                      {paymentMethod === 'E_WALLET' && (
                        <CheckCircle className="h-5 w-5 text-[#10B981]" />
                      )}
                    </div>
                  </button>

                  {paymentMethod === 'E_WALLET' && (
                    <div className="pr-10 space-y-3">
                      <button
                        onClick={() => setEWalletProvider('INSTAPAY')}
                        className={`w-full p-3 border-2 rounded-lg text-right transition-all ${
                          eWalletProvider === 'INSTAPAY'
                            ? 'border-[#10B981] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">InstaPay</span>
                          {eWalletProvider === 'INSTAPAY' && (
                            <CheckCircle className="h-4 w-4 text-[#10B981]" />
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setEWalletProvider('ETISALAT_CASH')}
                        className={`w-full p-3 border-2 rounded-lg text-right transition-all ${
                          eWalletProvider === 'ETISALAT_CASH'
                            ? 'border-[#10B981] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Etisalat Cash</span>
                          {eWalletProvider === 'ETISALAT_CASH' && (
                            <CheckCircle className="h-4 w-4 text-[#10B981]" />
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCreateSubscription}
                    disabled={!paymentMethod || (paymentMethod === 'E_WALLET' && !eWalletProvider) || submitting}
                  >
                    {submitting ? 'Processing...' : 'Upload Receipt / رفع الإيصال'}
                  </Button>
                </div>
              </Card>
            </>
          )}


          {step === 'receipt' && (
            <>
              {paymentMethod === 'BANK_TRANSFER' && (
                <Card variant="elevated" className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Bank Transfer Details / تفاصيل التحويل البنكي
                  </h2>
                  <Alert variant="info">
                    <div>
                      <p className="font-semibold mb-3">Please transfer to / يرجى التحويل إلى:</p>
                      <div className="space-y-2 text-sm bg-blue-50 p-3 rounded">
                        <p><strong>Bank Account Number / رقم الحساب البنكي:</strong><br/>eg0123456789</p>
                        <p><strong>Amount / المبلغ:</strong><br/>{pkg.price} SAR</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">After completing the transfer, please upload a clear photo of the receipt below.</p>
                      <p className="text-xs text-gray-600">بعد إتمام التحويل، يرجى رفع صورة واضحة للإيصال أدناه.</p>
                    </div>
                  </Alert>
                </Card>
              )}

              {paymentMethod === 'E_WALLET' && (
                <Card variant="elevated" className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    E-Wallet Payment Details / تفاصيل دفع المحفظة الإلكترونية
                  </h2>
                  <Alert variant="info">
                    <div>
                      <p className="font-semibold mb-3">Please send payment to / يرجى إرسال الدفع إلى:</p>
                      <div className="space-y-2 text-sm bg-blue-50 p-3 rounded">
                        <p><strong>Provider / المزود:</strong><br/>{eWalletProvider === 'INSTAPAY' ? 'InstaPay' : 'Etisalat Cash'}</p>
                        <p><strong>Wallet Number / رقم المحفظة:</strong><br/>01155201921</p>
                        <p><strong>Amount / المبلغ:</strong><br/>{pkg.price} SAR</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">After completing the transfer, please upload a clear screenshot of the confirmation below.</p>
                      <p className="text-xs text-gray-600">بعد إتمام التحويل، يرجى رفع صورة واضحة لتأكيد العملية أدناه.</p>
                    </div>
                  </Alert>
                </Card>
              )}

              <Card variant="elevated">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Upload Payment Proof / رفع إثبات الدفع
                </h2>

                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Important / مهم:</p>
                    <p className="text-sm">Please upload a clear photo or screenshot of your payment receipt for verification.</p>
                    <p className="text-sm">يرجى رفع صورة واضحة أو لقطة شاشة لإثبات الدفع للتحقق.</p>
                  </div>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Receipt / إيصال الدفع
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    />
                    {receiptFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ File selected: {receiptFile.name}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleUploadReceipt}
                    disabled={!receiptFile || submitting}
                  >
                    {submitting ? 'Uploading...' : (
                      <>
                        <Upload className="h-4 w-4 ml-2" />
                        Submit Receipt / إرسال الإيصال
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </>
          )}

          {step === 'success' && (
            <Card variant="elevated" className="text-center py-8 bg-green-50 border-green-200">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subscription Submitted! / تم إرسال الاشتراك!
              </h2>
              <p className="text-gray-700 mb-6">
                Your subscription is now under review. We will verify your payment and activate your subscription within 24 hours.
              </p>
              <p className="text-gray-700 mb-6">
                اشتراكك الآن قيد المراجعة. سنتحقق من دفعتك وننشط اشتراكك خلال 24 ساعة.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => router.push('/dashboard/student')}
                >
                  Back to Dashboard / العودة للوحة التحكم
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card variant="elevated" className="sticky top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary / ملخص الطلب</h3>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm text-gray-600">Package / الباقة</p>
                <p className="font-semibold text-gray-900">{pkg.title} / {pkg.titleAr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lessons / الحصص</p>
                <p className="font-semibold text-gray-900">{pkg.lessonsCount} lessons</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration / المدة</p>
                <p className="font-semibold text-gray-900">{Math.ceil(pkg.durationDays / 30)} month(s)</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Coupon Code / كود الخصم</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button size="sm" onClick={() => handleApplyCoupon(couponCode)}>Apply</Button>
                </div>
                
                <button 
                  onClick={() => setShowCouponSelector(!showCouponSelector)}
                  className="text-xs text-emerald-600 font-bold hover:underline text-left mt-1"
                >
                  Explore our discounts / اكتشف خصوماتنا
                </button>

                {showCouponSelector && availableCoupons.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border">
                    {availableCoupons.filter(c => c.applicablePackageId === 'ALL' || c.applicablePackageId === packageId).map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setCouponCode(c.code);
                          handleApplyCoupon(c.code);
                          setShowCouponSelector(false);
                        }}
                        className="p-2 bg-white border rounded cursor-pointer hover:bg-emerald-50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-emerald-700 text-sm">{c.code}</p>
                          <p className="text-xs text-gray-500">Discount: {c.discount}%</p>
                        </div>
                        <Tag className="w-4 h-4 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-600 font-bold text-sm bg-emerald-50 p-2 rounded">
                  <span>Discount Applied / تم تطبيق الخصم:</span>
                  <span>-{appliedCoupon.discount}%</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-lg font-bold text-gray-900">Total / الإجمالي</span>
                <span className="text-2xl font-bold text-[#10B981]">{finalPrice} SAR</span>
              </div>
            </div>

            {paymentMethod && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Payment Method:</strong>
                </p>
                <Badge variant="primary" className="mt-1">
                  {paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer / تحويل بنكي' : 
                   `E-Wallet: ${eWalletProvider === 'INSTAPAY' ? 'InstaPay' : 'Etisalat Cash'}`}
                </Badge>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
