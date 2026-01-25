'use client'

import { useState } from 'react'
import Link from "next/link";
import { Check, ArrowLeft, Star, Users } from 'lucide-react'
import Image from "next/image";
import FloatingContactButtons from '@/components/FloatingContactButtons'
import AppHeader from '@/components/layout/AppHeader'

const BASIC_PACKAGES = [
  { id: '1', title: 'Basic - 1 Month', titleAr: 'شهر واحد', price: 1500, lessons: 8, duration: '1 Month' },
  { id: '2', title: 'Basic - 3 Months', titleAr: '3 شهور', price: 3500, lessons: 24, duration: '3 Months' },
  { id: '3', title: 'Basic - 6 Months', titleAr: '6 شهور', price: 6000, lessons: 48, duration: '6 Months' },
]

const GOLD_PACKAGES = [
  { id: '4', title: 'Gold - 1 Month', titleAr: 'شهر واحد', price: 3000, lessons: 8, duration: '1 Month' },
  { id: '5', title: 'Gold - 3 Months', titleAr: '3 شهور', price: 7500, lessons: 24, duration: '3 Months' },
  { id: '6', title: 'Gold - 6 Months', titleAr: '6 شهور', price: 12000, lessons: 48, duration: '6 Months' },
]

export default function PackagesPage() {
  const [tier, setTier] = useState<'BASIC' | 'GOLD'>('BASIC')
  const currentPackages = tier === 'BASIC' ? BASIC_PACKAGES : GOLD_PACKAGES

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937]">
      <AppHeader variant="marketing">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Be Fluent" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-bold text-[#1F2937]">Be Fluent</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 mr-auto px-8">
          <Link href="/" className="text-gray-600 hover:text-[#10B981] font-medium transition-colors">الرئيسية</Link>
          <Link href="/placement-test" className="text-gray-600 hover:text-[#10B981] font-medium transition-colors">اختبار المستوى</Link>
        </nav>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة للرئيسية</span>
        </Link>
      </AppHeader>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">اختر خطتك التعليمية</h1>
          <p className="text-xl text-gray-600 mb-8">استثمارك في مستقبلك يبدأ من هنا</p>

          {/* Tier Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-2xl shadow-lg border border-gray-200 flex">
              <button
                onClick={() => setTier('BASIC')}
                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  tier === 'BASIC' 
                    ? 'bg-[#10B981] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                اشتراك Basic (جروب)
              </button>
              <button
                onClick={() => setTier('GOLD')}
                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  tier === 'GOLD' 
                    ? 'bg-[#1F2937] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Star className="w-5 h-5" />
                اشتراك Gold (برايفت)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {currentPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-3xl p-8 shadow-xl border-2 transition-all hover:scale-105 ${
                tier === 'GOLD' ? 'border-[#1F2937]/20' : 'border-[#10B981]/10'
              }`}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.titleAr}</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-[#10B981]">{pkg.price}</span>
                <span className="text-xl font-bold text-gray-600 ml-2">جنيه</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">{pkg.lessons} حصة مباشرة</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">مدة البرنامج {pkg.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">{tier === 'GOLD' ? 'حصص برايفت (1-on-1)' : 'حصص تفاعلية جروب'}</span>
                </div>
              </div>

              <Link
                href="/auth/register"
                className={`block w-full py-4 rounded-xl text-center font-bold text-white transition-all ${
                  tier === 'GOLD' 
                    ? 'bg-[#1F2937] hover:bg-black hover:shadow-lg' 
                    : 'bg-[#10B981] hover:bg-[#059669]'
                }`}
              >
                ابدأ الآن
              </Link>
            </div>
          ))}
        </div>
      </main>
      <FloatingContactButtons />
    </div>
  )
}
