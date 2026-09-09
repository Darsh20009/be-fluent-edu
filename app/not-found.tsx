'use client'

import Link from 'next/link'
import { ArrowRight, Compass, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#f4f1e8] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl w-full text-center space-y-8 relative">
        <div className="relative">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-[#e8eee7] border border-[#bed0bf] flex items-center justify-center">
              <Compass className="h-9 w-9 text-[#174c3c]" />
            </div>
          </div>

          <p className="text-[11px] font-semibold tracking-[.25em] uppercase text-[#718075] mb-3">Be Fluent / 404</p>
          <h1 className="text-7xl font-black text-[#174c3c] mb-2 tracking-tighter">404</h1>
          <h2 className="text-3xl font-bold text-[#19372d] mb-4">
            لم نعثر على هذه الصفحة
          </h2>
          
          <div className="bg-[#fbfaf5] border border-[#d6d2c3] p-6 mb-8">
            <p className="text-lg text-[#69756c] mb-2">
              قد يكون الرابط غير صحيح، أو أن الصفحة انتقلت إلى مكان آخر.
            </p>
            <p className="text-sm text-[#7b867d]" dir="ltr">The page you requested could not be found.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button variant="primary" size="lg" className="px-8 py-6 text-lg rounded-none bg-[#174c3c] hover:bg-[#0f392c]">
                <Home className="h-5 w-5 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-none border-[#9bab9c] bg-transparent hover:bg-[#e8eee7]">
                الدعم الفني
                <ArrowRight className="h-5 w-5 mr-2" />
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-[#718075] mt-12">
          Be Fluent Academy
        </p>
      </div>
      
    </div>
  )
}
