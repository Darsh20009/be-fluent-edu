'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, Send, Mail, X, Clock } from 'lucide-react'

export default function FloatingContactButtons() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const pathname = usePathname()
  
  // Hide on AI Assistant page
  const shouldHide = pathname?.includes('/ai-assistant')
  
  if (shouldHide) return null
  
  // تحديد ساعات العمل
  const isWithinWorkingHours = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()
    
    // ساعات العمل: الأحد-الخميس 9 صباحًا - 9 مساءً
    const isWeekday = currentDay >= 0 && currentDay <= 4
    const isWorkingHour = currentHour >= 9 && currentHour < 21
    
    return isWeekday && isWorkingHour
  }

  const handleWhatsAppSend = () => {
    const phoneNumber = '201091515594' // +20 109 151 5594
    const text = encodeURIComponent(message || 'مرحباً، أحتاج إلى المساعدة')
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank')
  }

  const handleEmailSend = () => {
    const email = 'youspeak.help@gmail.com'
    const subject = encodeURIComponent('استفسار - Youspeak')
    const body = encodeURIComponent(message || 'مرحباً،\n\nأحتاج إلى المساعدة في...')
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  const isAvailable = isWithinWorkingHours()

  return (
    <>
      {/* زر الدعم الفني العائم */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-[#004E89] rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          aria-label="الدعم الفني"
        >
          {/* أيقونة الرسالة */}
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
          
          {/* مؤشر الحالة */}
          <div className="absolute -top-1 -right-1">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full border-2 border-white`}>
              <div className={`w-full h-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full animate-ping opacity-75`}></div>
            </div>
          </div>
        </button>
      </div>

      {/* النافذة المنبثقة */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-28 left-2 right-2 sm:left-auto sm:right-8 z-50 w-auto sm:w-80 md:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* العنوان */}
          <div className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg">الدعم الفني</h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm opacity-90">
                    <Clock className="w-3 h-3" />
                    <span>
                      {isAvailable ? 'متاح الآن ✅' : 'غير متاح حالياً 🟡'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* المحتوى */}
          <div className="p-3 sm:p-5">
            {/* ساعات العمل */}
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">⏰ ساعات العمل:</p>
              <p className="text-[10px] sm:text-xs text-gray-600">الأحد - الخميس: 9 صباحاً - 9 مساءً</p>
              <p className="text-[10px] sm:text-xs text-gray-600">الجمعة - السبت: عطلة</p>
            </div>

            {/* حقل الرسالة */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                كيف يمكننا مساعدتك؟
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E89] focus:border-transparent resize-none text-right text-sm sm:text-base"
                rows={3}
                dir="rtl"
              />
            </div>

            {/* أزرار الإرسال */}
            <div className="space-y-2">
              {/* زر YouSpeak AI */}
              <a
                href="/dashboard/student/ai-assistant"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
              >
                <MessageCircle className="w-4 h-4" />
                <span>YouSpeak AI المساعد الذكي</span>
                <span className="text-base sm:text-lg">🤖</span>
              </a>

              {/* زر WhatsApp */}
              <button
                onClick={handleWhatsAppSend}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
              >
                <Send className="w-4 h-4" />
                <span>إرسال عبر واتساب</span>
                <span className="text-base sm:text-lg">💬</span>
              </button>

              {/* زر البريد الإلكتروني */}
              <button
                onClick={handleEmailSend}
                className="w-full bg-[#004E89] hover:bg-[#003A6A] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
              >
                <Mail className="w-4 h-4" />
                <span>إرسال عبر البريد</span>
                <span className="text-base sm:text-lg">✉️</span>
              </button>
            </div>

            {/* ملاحظة */}
            {!isAvailable && (
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[10px] sm:text-xs text-amber-800 text-center">
                  نحن خارج ساعات العمل حالياً. سنرد عليك في أقرب وقت ممكن!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
