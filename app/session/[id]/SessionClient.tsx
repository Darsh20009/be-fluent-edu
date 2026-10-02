'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Video, ArrowLeft, Circle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import SessionLoginModal from './SessionLoginModal'
import SessionPasswordModal from './SessionPasswordModal'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import LanguageToggle from '@/components/LanguageToggle'

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
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
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
        toast.error(t('الجلسة غير موجودة أو لا تملك صلاحية الوصول', 'Session not found or you do not have access'))
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      toast.error(t('خطأ في تحميل الجلسة', 'Error loading session'))
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
      <div className="min-h-[100dvh] bg-[#f4f1e8] flex items-center justify-center p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md border border-[#d9d6c8] bg-[#fbfaf5] p-8 text-center shadow-[0_20px_60px_rgba(25,52,43,.08)]">
          <div className="mx-auto mb-5 h-10 w-10 border-2 border-[#174c3c]/20 border-t-[#174c3c] rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#19372d]">{t('يتم تجهيز مساحة التعلّم', 'Preparing your learning space')}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-[#18211d] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#f7f5ed] border-b border-[#d6d2c3] px-4 sm:px-7 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="bg-transparent text-[#19372d] hover:bg-[#e8eee7] border-[#bfc8bd] rounded-none shrink-0"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">{t('الخروج', 'Exit')}</span>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[.22em] uppercase text-[#718075] mb-0.5">Be Fluent / {t('غرفة مباشرة', 'Live room')}</p>
            <h1 className="text-base sm:text-lg font-bold text-[#17352c] truncate">
              {session.title}
            </h1>
            <p className="text-xs text-[#637168]">
              {session.teacher.name} <span className="mx-1">·</span> {new Date(session.startTime).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'TEACHER' && session.sessionPassword && (
            <div className="hidden sm:block bg-[#edf1e9] border border-[#cbd5c8] px-3 py-1.5 text-left" dir="ltr">
              <p className="text-[10px] text-[#657466] font-medium">ROOM PASSCODE</p>
              <p className="text-sm font-bold text-[#174c3c] tracking-[.18em]">{session.sessionPassword}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-[#174c3c]">
            <Circle className="h-2.5 w-2.5 fill-[#b54c39] text-[#b54c39] animate-pulse" />
            <span className="text-xs font-bold tracking-wide">{t('مباشر', 'LIVE')}</span>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Meet Video Container */}
      <div className="flex-1 w-full bg-[#18211d] relative">
        {!canJoinSession() ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="bg-[#f7f5ed] border border-[#d6d2c3] p-8 sm:p-10 max-w-lg w-full text-center shadow-[0_24px_80px_rgba(0,0,0,.22)]">
              <div className="w-16 h-16 bg-[#e6eee7] border border-[#c8d3c7] flex items-center justify-center mx-auto mb-6">
                <Video className="h-8 w-8 text-[#174c3c]" />
              </div>
              <h2 className="text-2xl font-bold text-[#19372d] mb-3">
                {t('لم تبدأ الحصة بعد', 'The session has not started yet')}
              </h2>
              <p className="text-[#667268] mb-5 leading-relaxed">
                {t('يمكنك الانضمام قبل موعد الحصة بعشر دقائق.', 'You can join 10 minutes before the scheduled time.')}
              </p>
              <div className="text-[#174c3c] font-mono text-xl bg-[#edf1e9] p-4 border border-[#c8d3c7]" dir="ltr">
                {new Date(session.startTime).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ) : session.externalLink ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="bg-[#f7f5ed] border border-[#d6d2c3] p-8 sm:p-10 max-w-lg w-full text-center shadow-[0_24px_80px_rgba(0,0,0,.22)]">
              <div className="w-16 h-16 bg-[#e6eee7] border border-[#c8d3c7] flex items-center justify-center mx-auto mb-6">
                <Video className="h-8 w-8 text-[#174c3c]" />
              </div>
              <h2 className="text-2xl font-bold text-[#19372d] mb-3">
                {session.externalLinkType || t('جلسة خارجية', 'External session')}
              </h2>
              <p className="text-[#667268] mb-8 leading-relaxed">
                {t('تقام هذه الحصة عبر منصة خارجية. اضغط أدناه للانتقال إلى الاجتماع.', 'This session is hosted on an external platform. Click below to join the meeting.')}
              </p>
              <Button
                size="lg"
                className="w-full bg-[#174c3c] hover:bg-[#0f392c] text-[#f7f5ed] py-6 text-lg font-bold rounded-none"
                onClick={() => window.open(session.externalLink, '_blank')}
              >
                {t('دخول الحصة', 'Join session')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
             <div className="bg-[#f7f5ed] border border-[#d6d2c3] p-8 sm:p-10 max-w-lg w-full text-center shadow-[0_24px_80px_rgba(0,0,0,.22)]">
               <div className="w-16 h-16 bg-[#f1e8df] border border-[#dfcabc] flex items-center justify-center mx-auto mb-6">
                 <Video className="h-8 w-8 text-[#a65b45]" />
              </div>
               <h2 className="text-2xl font-bold text-[#19372d] mb-3">
                  {t('لا يوجد رابط للحصة', 'No session link')}
              </h2>
               <p className="text-[#667268] mb-4 leading-relaxed">
                  {t('لم يتم توفير رابط لهذه الحصة بعد. يرجى التواصل مع المعلم.', 'No meeting link has been provided for this session yet. Please contact your teacher.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
