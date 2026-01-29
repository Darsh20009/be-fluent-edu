'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Video, ArrowLeft, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SessionLoginModal from './SessionLoginModal'
import SessionPasswordModal from './SessionPasswordModal'
import MeetVideo from '@/components/ZegoVideo'

interface SessionClientProps {
  sessionId: string
  user: {
    id: string
    name: string
    email: string
    role: string
  } | null
  isAuthenticated: boolean
}

interface SessionData {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  teacherId: string
  sessionPassword?: string
  teacher: {
    name: string
  }
}

interface MeetVideoProps {
  userId: string
  userName: string
  roomId: string
  role?: string
}

export default function SessionClient({ sessionId, user, isAuthenticated }: SessionClientProps) {
  const router = useRouter()
  const routerRef = useRef(router)
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [useZego, setUseZego] = useState(false)
  const [zegoToken, setZegoToken] = useState<any>(null)
  const [zegoLoading, setZegoLoading] = useState(false)

  const initializeZegoSession = async (sessionData: SessionData) => {
    try {
      setZegoLoading(true)
      const response = await fetch('/api/zego/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          roomId: sessionData.id
        })
      })
      if (response.ok) {
        const data = await response.json()
        setZegoToken(data)
      }
    } catch (error) {
      console.error('Error initializing Zego:', error)
    } finally {
      setZegoLoading(false)
    }
  }

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSession()
    } else {
      setLoading(false)
    }
  }, [sessionId, isAuthenticated, user])

  async function fetchSession(password?: string) {
    if (!user) return
    try {
      const endpoint = user.role === 'TEACHER' || user.role === 'ADMIN'
        ? `/api/teacher/sessions/${sessionId}`
        : `/api/student/sessions/${sessionId}${password ? `?password=${password}` : ''}`
      
      const response = await fetch(endpoint)
      if (response.status === 403) {
        const data = await response.json()
        if (data.passwordRequired) {
          setShowPasswordModal(true)
          setLoading(false)
          return
        }
      }
      
      if (response.ok) {
        const data = await response.json()
        setSession(data)
        setShowPasswordModal(false)
      } else {
        alert('Session not found or you do not have access')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      alert('Error loading session')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoginSuccess() {
    setRefreshing(true)
    setShowLoginModal(false)
    
    // Refresh the page to get updated session
    await new Promise(resolve => setTimeout(resolve, 500))
    router.refresh()
  }

  if (!isAuthenticated || !user) {
    return (
      <SessionLoginModal 
        onLoginSuccess={handleLoginSuccess}
        sessionId={sessionId}
      />
    )
  }

  if (showPasswordModal && session) {
    return (
      <SessionPasswordModal
        sessionId={session.id}
        sessionTitle={session.title}
        onPasswordSubmit={(password) => {
          fetchSession(password)
        }}
      />
    )
  }

  if (loading || refreshing) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-black/80 border-b border-neutral-700 px-4 py-3 flex items-center justify-between z-50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit / خروج
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white">
              {session.title}
            </h1>
            <p className="text-xs text-neutral-400">
              {session.teacher.name} • {new Date(session.startTime).toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (useZego) {
                setUseZego(false)
                return
              }
              const confirmZego = confirm('هل تريد استخدام ZegoCloud كخيار بديل؟ / Do you want to use ZegoCloud as backup?')
              if (confirmZego) {
                if (!zegoToken && session) {
                  await initializeZegoSession(session)
                }
                setUseZego(true)
              }
            }}
            className={`text-xs px-2 py-1 rounded transition-colors ${useZego ? 'bg-green-600 text-white' : 'text-neutral-400 hover:text-white underline'}`}
          >
            {useZego ? 'Using ZegoCloud / نستخدم Zego' : 'Switch to ZegoCloud / التبديل إلى Zego'}
          </button>
          {user?.role === 'TEACHER' && session.sessionPassword && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-300 font-medium">Password</p>
              <p className="text-lg font-bold text-blue-400 tracking-widest">{session.sessionPassword}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="text-sm font-medium text-red-500">Live</span>
          </div>
        </div>
      </div>

      {/* Meet Video Container */}
      <div className="flex-1 w-full bg-black relative">
        {useZego && zegoToken ? (
          <MeetVideo
            userId={user.id}
            userName={user.name}
            roomId={session.id}
            role={user.role}
            useZego={true}
            appId={zegoToken.appId}
            serverSecret={zegoToken.serverSecret}
          />
        ) : (
          <MeetVideo
            userId={user.id}
            userName={user.name}
            roomId={session.id}
            role={user.role}
          />
        )}
      </div>
    </div>
  )
}
