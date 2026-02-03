'use client'

import Link from 'next/link'
import { Wrench, Settings, Hammer, AlertCircle, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 relative">
        {/* Animated Background Elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#10B981]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#10B981]/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <AlertCircle className="h-32 w-32 text-orange-500 animate-bounce" />
              <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <Wrench className="h-8 w-8 text-[#10B981] animate-spin-slow" />
              </div>
            </div>
          </div>

          <h1 className="text-8xl font-black text-[#10B981] mb-2 tracking-tighter">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Under Construction / نأسف، نحن نصلح هذا العطل
          </h2>
          
          <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-[#10B981]/30 rounded-2xl p-6 mb-8">
            <p className="text-lg text-gray-600 mb-4">
              يبدو أن الصفحة التي تبحث عنها تخضع لبعض التعديلات والتحسينات لنقدم لك أفضل تجربة تعليمية.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm font-medium text-[#10B981]">
              <div className="flex items-center gap-1">
                <Hammer className="h-4 w-4" />
                <span>Fixing...</span>
              </div>
              <div className="flex items-center gap-1">
                <Settings className="h-4 w-4 animate-spin" />
                <span>Optimizing...</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button variant="primary" size="lg" className="px-8 py-6 text-lg rounded-full shadow-xl hover:scale-105 transition-transform">
                <Home className="h-5 w-5 mr-2" />
                Go Home / العودة للرئيسية
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-full border-2 bg-white/50 hover:bg-white transition-all">
                Contact Support / الدعم الفني
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          Be Fluent Academy - We make language learning smooth.
        </p>
      </div>
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
