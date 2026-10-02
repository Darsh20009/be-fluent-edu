'use client'

import { useState } from 'react'
import Link from "next/link";
import { Check, Star, Users } from 'lucide-react'
import { MarketingFrame } from '@/components/marketing/MarketingFrame'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

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
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const durationLabel = (duration: string) => language === 'ar'
    ? duration.startsWith('1 ') ? 'شهر واحد' : duration.startsWith('3 ') ? '3 شهور' : '6 شهور'
    : duration
  const [tier, setTier] = useState<'BASIC' | 'GOLD'>('BASIC')
  const currentPackages = tier === 'BASIC' ? BASIC_PACKAGES : GOLD_PACKAGES

  return (
    <MarketingFrame>
      <main className="mx-auto max-w-[1130px] px-5 py-12 sm:py-16">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold tracking-[.2em] text-[#147050]">{t('الباقات والأسعار', 'PLANS & PRICING')}</p>
          <h1 className="mt-3 text-3xl font-extrabold text-[#1e2b29] md:text-4xl">{t('اختر خطتك التعليمية', 'Choose your learning plan')}</h1>
          <p className="mt-3 text-sm text-[#68756f]">{t('استثمار واضح في لغة تستخدمها بثقة.', 'A clear investment in a language you can use with confidence.')}</p>

          {/* Tier Toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex border border-[#d9e1da] bg-[#f5f7f2] p-1">
              <button
                onClick={() => setTier('BASIC')}
                className={`px-5 py-3 text-[11px] font-bold transition-all flex items-center gap-2 ${
                  tier === 'BASIC' 
                     ? 'bg-[#147050] text-white' 
                     : 'text-[#65736d] hover:bg-white'
                }`}
              >
                <Users className="w-5 h-5" />
                {t('اشتراك Basic (جماعي)', 'Basic subscription (group)')}
              </button>
              <button
                onClick={() => setTier('GOLD')}
                className={`px-5 py-3 text-[11px] font-bold transition-all flex items-center gap-2 ${
                  tier === 'GOLD' 
                     ? 'bg-[#1e2b29] text-white' 
                     : 'text-[#65736d] hover:bg-white'
                }`}
              >
                <Star className="w-5 h-5" />
                {t('اشتراك Gold (خاص)', 'Gold subscription (private)')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {currentPackages.map((pkg) => (
            <div
              key={pkg.id}
               className={`bg-[#fffefa] p-6 border transition-transform hover:-translate-y-1 ${
                 tier === 'GOLD' ? 'border-[#61706b]' : 'border-[#b7d5c6]'
              }`}
            >
                <p className="font-mono text-[10px] text-[#147050]">{durationLabel(pkg.duration)}</p>
                <h3 className="mt-2 text-xl font-bold text-[#1e2b29] mb-2">{language === 'ar' ? pkg.titleAr : pkg.title}</h3>
              <div className="mb-6">
                 <span className="text-4xl font-black text-[#147050]">{pkg.price}</span>
                  <span className="mr-2 text-xs font-bold text-[#68756f]">{t('جنيه', 'EGP')}</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#147050]" />
                   <span className="text-sm text-[#53615c]">{t(`${pkg.lessons} حصة مباشرة`, `${pkg.lessons} live lessons`)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#147050]" />
                   <span className="text-sm text-[#53615c]">{t(`مدة البرنامج ${durationLabel(pkg.duration)}`, `Program duration: ${durationLabel(pkg.duration)}`)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#147050]" />
                   <span className="text-sm text-[#53615c]">{tier === 'GOLD' ? t('حصص خاصة فردية', 'Private one-to-one lessons') : t('حصص تفاعلية جماعية', 'Interactive group lessons')}</span>
                </div>
              </div>

              <Link
                href="/auth/register"
               className={`block w-full py-3 text-center text-[11px] font-bold text-white transition-colors ${
                  tier === 'GOLD' 
                     ? 'bg-[#1e2b29] hover:bg-[#0f1c1a]' 
                     : 'bg-[#147050] hover:bg-[#0e5940]'
                }`}
              >
                {t('ابدأ الآن', 'Get started')}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </MarketingFrame>
  )
}
