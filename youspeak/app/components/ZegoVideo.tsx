'use client'

import { useEffect, useRef, useState } from 'react'

interface ZegoVideoProps {
  appId: number
  token: string
  userId: string
  userName: string
  roomId: string
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any
  }
}

export default function ZegoVideo({
  appId,
  token,
  userId,
  userName,
  roomId,
  onError
}: ZegoVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || initRef.current) return

    const initZego = async () => {
      try {
        // Load CSS if not already loaded
        if (!document.querySelector('link[href*="ZegoUIKitPrebuilt.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://source.zego.im/sdk/web/plugins/ZegoUIKitPrebuilt.css'
          document.head.appendChild(link)
        }

        // Load JS if not already loaded
        if (!window.ZegoUIKitPrebuilt) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://source.zego.im/sdk/web/plugins/ZegoUIKitPrebuilt.js'
            script.async = true
            script.onload = () => {
              console.log('✅ Zego SDK script loaded')
              resolve()
            }
            script.onerror = () => {
              console.error('❌ Failed to load Zego SDK script')
              reject(new Error('Failed to load Zego SDK'))
            }
            document.body.appendChild(script)
          })
        }

        // Wait for SDK to be available in window
        let attempts = 0
        while (!window.ZegoUIKitPrebuilt && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        if (!window.ZegoUIKitPrebuilt) {
          throw new Error('Zego SDK not available after loading')
        }

        console.log('🔧 Initializing Zego with AppID:', appId)

        const ZegoUIKitPrebuilt = window.ZegoUIKitPrebuilt

        // Initialize Zego
        const zp = ZegoUIKitPrebuilt.create(appId, token, roomId, {
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: ZegoUIKitPrebuilt.Host,
            },
          },
          showScreenSharingButton: true,
          userID: userId,
          userName: userName,
        })

        setLoaded(true)
        console.log('✅ Zego session created successfully')
      } catch (error) {
        console.error('❌ Error initializing Zego:', error)
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to initialize Zego'))
        }
      }
    }

    initRef.current = true
    initZego()
  }, [appId, token, userId, userName, roomId, onError])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%'
      }}
      className="bg-black"
    >
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <div className="animate-spin">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-white mt-4">جاري تحميل الفيديو... / Loading Video...</p>
        </div>
      )}
    </div>
  )
}
