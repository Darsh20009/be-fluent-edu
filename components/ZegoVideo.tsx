'use client'

import { useEffect, useState } from 'react'

interface ZegoVideoProps {
  appId: number
  serverSecret: string
  userId: string
  userName: string
  roomId: string
  role?: string
  onError?: (error: Error) => void
}

export default function ZegoVideo({
  appId,
  serverSecret,
  userId,
  userName,
  roomId,
  role = 'STUDENT',
  onError
}: ZegoVideoProps) {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams({
      appId: appId.toString(),
      serverSecret,
      roomId,
      userId,
      userName,
      role
    })
    setIframeSrc(`/zego-room.html?${params.toString()}`)

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'zegoJoined') {
        console.log('Received Zego joined message from iframe')
      } else if (event.data?.type === 'zegoLeft') {
        console.log('Received Zego left message from iframe')
      } else if (event.data?.type === 'zegoError') {
        onError?.(new Error(event.data.error || 'Unknown Zego error'))
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [appId, serverSecret, userId, userName, roomId, onError])

  if (!iframeSrc) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: 'white',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #333',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ marginTop: '16px' }}>Preparing video conference...</p>
        <p style={{ color: '#9ca3af' }}>جاري تجهيز الحصة...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <iframe
      src={iframeSrc}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#1a1a1a'
      }}
      allow="camera; microphone; display-capture; autoplay; clipboard-write"
      allowFullScreen
    />
  )
}
