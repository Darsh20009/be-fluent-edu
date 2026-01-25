
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ShoppingCart, Package, Calendar, BookOpen, Check, X } from 'lucide-react'

interface Package {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  price: number
  lessonsCount: number
  durationDays: number
  isActive: boolean
}

interface Subscription {
  id: string
  packageId: string
  status: string
  package: Package
}

interface CartItem {
  id: string
  packageId: string
  package: Package
}

interface Cart {
  items: CartItem[]
}

interface PackagesTabProps {
  isActive?: boolean
  onCartUpdate?: () => Promise<void>
}

export default function PackagesTab({ isActive, onCartUpdate }: PackagesTabProps) {
  const [packages, setPackages] = useState<Package[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [packagesRes, subsRes, cartRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/subscriptions'),
        fetch('/api/cart')
      ])

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        console.log('Raw packages data:', packagesData)
        
        // Ensure we have a valid array and filter out any invalid items
        const validPackages = Array.isArray(packagesData) 
          ? packagesData.filter(pkg => {
              if (!pkg || typeof pkg !== 'object') {
                console.warn('Invalid package (not an object):', pkg)
                return false
              }
              
              const isValid = pkg.id && 
                             pkg.title && 
                             pkg.titleAr && 
                             pkg.price !== null &&
                             pkg.price !== undefined
              
              if (!isValid) {
                console.warn('Invalid package (missing fields):', pkg)
              }
              return isValid
            })
          : []
        
        console.log('Valid packages after filtering:', validPackages)
        setPackages(validPackages)
      } else {
        console.error('Failed to fetch packages:', packagesRes.status)
        setPackages([])
      }

      if (subsRes.ok) {
        const subsData = await subsRes.json()
        setSubscriptions(Array.isArray(subsData) ? subsData : [])
      } else {
        setSubscriptions([])
      }

      if (cartRes.ok) {
        const cartData = await cartRes.json()
        setCart(cartData)
      } else {
        setCart(null)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setPackages([])
      setSubscriptions([])
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (packageId: string) => {
    try {
      setActionLoading(packageId)
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })

      if (res.ok) {
        await fetchData()
        if (onCartUpdate) {
          await onCartUpdate()
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const removeFromCart = async (packageId: string) => {
    try {
      setActionLoading(packageId)
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })

      if (res.ok) {
        await fetchData()
        if (onCartUpdate) {
          await onCartUpdate()
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const isInCart = (packageId: string) => {
    return cart?.items?.some(item => item.packageId === packageId) || false
  }

  const hasActiveSubscription = (packageId: string) => {
    return subscriptions.some(
      sub => sub.packageId === packageId && sub.status === 'APPROVED'
    )
  }

  const [tier, setTier] = useState<'BASIC' | 'GOLD'>('BASIC')
  
  const filteredPackages = packages.filter(pkg => {
    if (tier === 'BASIC') return pkg.title.toLowerCase().includes('basic')
    return pkg.title.toLowerCase().includes('gold')
  }).sort((a, b) => a.price - b.price)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tier Switcher */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">
          <button
            onClick={() => setTier('BASIC')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              tier === 'BASIC' ? 'bg-white text-[#10B981] shadow-sm' : 'text-gray-500'
            }`}
          >
            Basic (جروب)
          </button>
          <button
            onClick={() => setTier('GOLD')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              tier === 'GOLD' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-gray-500'
            }`}
          >
            Gold (برايفت)
          </button>
        </div>
      </div>

      {cart && cart.items && cart.items.length > 0 && (
        <Alert variant="success">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>لديك {cart.items.length} باقة في السلة</span>
            </div>
            <Button
              onClick={() => router.push('/dashboard/student/cart')}
              size="sm"
            >
              عرض السلة
            </Button>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const inCart = isInCart(pkg.id)
          const hasSubscription = hasActiveSubscription(pkg.id)
          const isLoading = actionLoading === pkg.id

          return (
            <Card key={pkg.id} className={`flex flex-col border-2 ${tier === 'GOLD' ? 'border-[#1F2937]/20' : 'border-[#10B981]/10'}`}>
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {pkg.titleAr || pkg.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">{pkg.lessonsCount} حصة</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">صالحة لمدة {pkg.durationDays} يوم</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-[#10B981] mb-6">
                  {pkg.price} جنيه
                </div>
              </div>

              <div className="p-6 pt-0">
                {hasSubscription ? (
                  <Button fullWidth variant="success" disabled>
                    <Check className="w-4 h-4 ml-2" />
                    مشترك بالفعل
                  </Button>
                ) : inCart ? (
                  <Button fullWidth variant="outline" onClick={() => removeFromCart(pkg.id)} loading={isLoading}>
                    <X className="w-4 h-4 ml-2" />
                    إزالة
                  </Button>
                ) : (
                  <Button fullWidth onClick={() => addToCart(pkg.id)} loading={isLoading}>
                    <ShoppingCart className="w-4 h-4 ml-2" />
                    أضف للسلة
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
