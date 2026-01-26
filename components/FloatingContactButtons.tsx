'use client'

import { MessageCircle } from 'lucide-react'

export default function FloatingContactButtons() {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50">
      <a
        href="https://api.whatsapp.com/send/?phone=201091515594"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center"
      >
        {/* Creative Pulse Effect */}
        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute -inset-2 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
        
        {/* Main Button */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.6)] transform transition-all duration-500 hover:scale-110 active:scale-95 group-hover:rotate-12">
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 sm:w-8 sm:h-8 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.554 4.197 1.604 6.01L0 24l6.149-1.613a11.973 11.973 0 005.897 1.559h.005c6.632 0 12.046-5.414 12.05-12.051a11.85 11.85 0 00-3.513-8.514z"/>
          </svg>
        </div>

        {/* Floating Text Label */}
        <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
          <p className="text-[#1F2937] font-bold text-sm">تواصل معنا الآن 💬</p>
        </div>
      </a>
    </div>
  )
}
