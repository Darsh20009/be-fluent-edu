'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const fullText = 'Be Fluent... طلاقتك تبدأ من هنا'

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setText(fullText.slice(0, i))
      i++
      if (i > fullText.length) {
        clearInterval(timer)
        setTimeout(() => setLoading(false), 1000)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F9FAFB] flex flex-col items-center justify-center transition-opacity duration-500">
      <div className="relative w-32 h-32 mb-8 animate-bounce">
        <Image src="/logo.png" alt="Be Fluent" fill className="object-contain" />
      </div>
      <div className="text-2xl font-bold text-[#1F2937] font-mono h-8">
        {text}
        <span className="animate-pulse">|</span>
      </div>
      <div className="mt-12 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#10B981] animate-progress"></div>
      </div>
      <style jsx>{`
        @keyframes progress {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
