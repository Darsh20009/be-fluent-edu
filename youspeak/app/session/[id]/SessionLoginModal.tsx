'use client'

import { useEffect, useRef } from 'react'

interface SessionLoginModalProps {
  onLoginSuccess: () => void
  sessionId: string
}

export default function SessionLoginModal({ onLoginSuccess, sessionId }: SessionLoginModalProps) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md mx-4 h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004E89] to-[#0066B2] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            تسجيل الدخول / Login
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
