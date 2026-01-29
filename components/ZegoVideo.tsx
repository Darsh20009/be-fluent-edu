'use client'

import { useEffect, useState } from 'react'

interface MeetVideoProps {
  userId: string
  userName: string
  roomId: string
  role?: string
  useZego?: boolean
  appId?: number
  serverSecret?: string
}

export default function MeetVideo({
  userId,
  userName,
  roomId,
  role = 'STUDENT',
  useZego = false,
  appId,
  serverSecret
}: MeetVideoProps) {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)

  useEffect(() => {
    if (useZego && appId && serverSecret) {
      // ZegoCloud integration logic would go here if we were using their SDK
      // For now, we still use our internal meet as the primary interface
      // but we could toggle between them based on useZego
    }
    
    const params = new URLSearchParams({
      roomId,
      userId,
      userName,
      role
    })
    setIframeSrc(`/meet/index.html?${params.toString()}`)
  }, [userId, userName, roomId, role, useZego, appId, serverSecret])

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
            borderTopColor: '#10B981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ marginTop: '16px' }}>Preparing BeFluent Meet...</p>
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
