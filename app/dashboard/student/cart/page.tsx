'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, ArrowRight, PackageOpen } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

interface Package {
  id: string
  title: string
  titleAr: string
  price: number
  lessonsCount: number
  durationDays: number
}

interface CartItem {
  id: string
  Package: Package
}

interface Cart {
  id: string
  CartItem: CartItem[]
}

export default function CartPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCart(data)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveItem(packageId: string) {
    setRemoving(packageId)
    try {
      const response = await fetch(`/api/cart?packageId=${packageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCart()
      } else {
        toast.error(t('فشل حذف العنصر من السلة', 'Failed to remove item from cart'))
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error(t('حدث خطأ أثناء حذف العنصر من السلة', 'Error removing item from cart'))
    } finally {
      setRemoving(null)
    }
  }

  function handleCheckout(packageId: string) {
    router.push(`/dashboard/student/checkout?packageId=${packageId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const totalAmount = cart?.CartItem.reduce((sum, item) => sum + item.Package.price, 0) || 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="h-8 w-8 text-[#10B981]" />
          <h1 className="text-3xl font-bold text-[#10B981]">{t('سلة الشراء', 'Shopping cart')}</h1>
        </div>
        <p className="text-gray-600">{t('راجع الباقات التي اخترتها وتابع إلى الدفع', 'Review your selected packages and proceed to checkout')}</p>
      </div>

      {!cart || cart.CartItem.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <PackageOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('سلة التسوق فارغة', 'Your cart is empty')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('تصفح الباقات وأضفها إلى سلتك', 'Browse our packages and add them to your cart')}
          </p>
          <Button onClick={() => router.push('/dashboard/student')}>
            {t('تصفح الباقات', 'Browse packages')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {cart.CartItem.map((item) => (
              <Card key={item.id} variant="elevated">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#10B981] mb-2">
                      {language === 'ar' ? item.Package.titleAr || item.Package.title : item.Package.title}
                    </h3>
                    <div className="text-gray-700 space-y-1">
                      <p>{item.Package.lessonsCount} {t('حصة', 'lessons')}</p>
                      <p>{Math.ceil(item.Package.durationDays / 30)} {t('شهر', 'months')}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <p className="text-2xl font-bold text-[#10B981]">
                      {item.Package.price} SAR
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCheckout(item.Package.id)}
                      >
                        {t('الدفع', 'Checkout')}
                        <ArrowRight className="h-4 w-4 mr-1" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.Package.id)}
                        disabled={removing === item.Package.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card variant="elevated" className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{t('الإجمالي', 'Total')}</h3>
              <p className="text-3xl font-bold text-[#10B981]">{totalAmount} SAR</p>
            </div>
          </Card>

          <Alert variant="info">
            <div>
              <p className="font-semibold">{t('الخطوات التالية:', 'Next steps:')}</p>
              <p className="text-sm mt-1">{t('اضغط على "الدفع" لأي باقة للمتابعة. سيُطلب منك اختيار طريقة الدفع ورفع إيصال الدفع للتحقق.', 'Select Checkout on a package to continue. You will choose a payment method and upload a receipt for verification.')}</p>
            </div>
          </Alert>
        </div>
      )}
    </div>
  )
}
