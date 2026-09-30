'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import BrandLockup from '@/components/brand/BrandLockup'

export default function LatestCouponPopup() {
  const [coupon, setCoupon] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenCouponPopup')
    if (hasSeenPopup) return

    async function fetchLatestCoupon() {
      try {
        const response = await fetch('/api/coupons/active')
        if (response.ok) {
          const coupons = await response.json()
          if (coupons && coupons.length > 0) {
            // Get the most recently created active coupon
            const latest = coupons[0]
            setCoupon(latest)
            // Show after a short delay
            setTimeout(() => setIsOpen(true), 2000)
          }
        }
      } catch (error) {
        console.error('Error fetching latest coupon:', error)
      }
    }

    fetchLatestCoupon()
  }, [])

  const closePopup = () => {
    setIsOpen(false)
    sessionStorage.setItem('hasSeenCouponPopup', 'true')
  }

  const copyCode = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.code)
      toast.success('تم نسخ الكود! 🎉')
    }
  }

  if (!coupon) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-100"
          >
            {/* Top Design Element */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600" />
            
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative pt-12 pb-8 px-8 text-center">
              <BrandLockup size="md" className="mx-auto mb-6 justify-center rounded-xl bg-white px-4 py-3" />

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                هدية خاصة لك! 🎁
              </h2>
              <p className="text-gray-600 mb-6 font-medium">
                استخدم هذا الكود للحصول على خصم حصري
                <br />
                <span className="text-emerald-600 font-bold text-xl">{coupon.discount}% Discount</span>
              </p>

              {/* Coupon Card */}
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl p-4 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-widest">كود الخصم / Coupon Code</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-gray-800 tracking-tighter">{coupon.code}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={copyCode}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <Tag className="w-5 h-5" />
                  نسخ الكود
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      window.location.href = '/dashboard/student/checkout';
                      closePopup();
                    }}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    اكتشف باقتنا
                  </button>
                  <button
                    onClick={closePopup}
                    className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all"
                  >
                    تخطي
                  </button>
                </div>
              </div>
              
              <p className="mt-4 text-xs text-gray-400">
                * العرض متاح لفترة محدودة
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
