'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

interface SessionLoginModalProps {
  onLoginSuccess: () => void
  sessionId: string
}

export default function SessionLoginModal({ onLoginSuccess, sessionId }: SessionLoginModalProps) {
  const { language } = useTheme()
  const title = localeText(language, 'تسجيل الدخول', 'Sign in')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data)
      
      // Check for login success message from iframe
      if (event.data?.type === 'LOGIN_SUCCESS') {
        console.log('✅ Login successful from iframe, calling onLoginSuccess...')
        onLoginSuccess()
      }
    }

    // Listen for messages from iframe
    window.addEventListener('message', handleMessage)
    
    return () => window.removeEventListener('message', handleMessage)
  }, [onLoginSuccess])

  return (
    <div className="fixed inset-0 bg-[#18211d]/70 flex items-center justify-center z-50 backdrop-blur-sm p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-[#f7f5ed] border border-[#d6d2c3] shadow-[0_24px_80px_rgba(0,0,0,.28)] w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#174c3c] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#f7f5ed]">
            {title}
          </h2>
        </div>

        {/* iframe */}
        <iframe
          ref={iframeRef}
          src={`/auth/login?embedded=true`}
          className="flex-1 w-full border-0 overflow-hidden"
          title="Login Form"
          sandbox="allow-same-origin allow-forms allow-scripts allow-popups allow-top-navigation-by-user-activation"
          allow="camera; microphone"
        />
      </div>
    </div>
  )
}
