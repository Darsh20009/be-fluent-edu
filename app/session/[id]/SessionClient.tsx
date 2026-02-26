'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Video, ArrowLeft, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SessionLoginModal from './SessionLoginModal'
import SessionPasswordModal from './SessionPasswordModal'

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
  status: string
  sessionPassword?: string
  externalLink?: string
  externalLinkType?: string
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
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const canJoinSession = useCallback(() => {
    if (!session) return false
    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') return true
    if (session.status === 'ACTIVE') return true
    
    const startTime = new Date(session.startTime)
    const tenMinutesBefore = new Date(startTime.getTime() - 10 * 60000)
    return currentTime >= tenMinutesBefore
  }, [session, user, currentTime])

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
        toast.error('الجلسة غير موجودة أو لا تملك صلاحية الوصول')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      toast.error('خطأ في تحميل الجلسة')
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
        {!canJoinSession() ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="h-10 w-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                الحصة لم تبدأ بعد / Session Not Started
              </h2>
              <p className="text-neutral-400 mb-4 leading-relaxed">
                يمكنك الانضمام قبل موعد الحصة بـ 10 دقائق.
                <br />
                You can join 10 minutes before the scheduled time.
              </p>
              <div className="text-[#10B981] font-mono text-xl bg-neutral-900/50 p-4 rounded-xl border border-neutral-700">
                {new Date(session.startTime).toLocaleTimeString('ar-EG', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ) : session.externalLink ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {session.externalLinkType || 'جلسة خارجية'} / External Session
              </h2>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                هذه الحصة تقام عبر منصة خارجية. اضغط على الزر أدناه للانتقال للاجتماع.
                <br />
                This session is hosted on an external platform. Click below to join.
              </p>
              <Button
                size="lg"
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-6 text-lg font-bold rounded-2xl shadow-xl shadow-emerald-500/20"
                onClick={() => window.open(session.externalLink, '_blank')}
              >
                Join Meeting / دخول الحصة
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
             <div className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                No Link Provided / لا يوجد رابط
              </h2>
              <p className="text-neutral-400 mb-4 leading-relaxed">
                لم يتم توفير رابط لهذه الحصة بعد. يرجى التواصل مع المعلم.
                <br />
                No meeting link has been provided for this session yet. Please contact the teacher.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
