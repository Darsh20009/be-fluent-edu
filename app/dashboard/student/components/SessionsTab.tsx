'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, CheckCircle, XCircle, Video, Play, ExternalLink, Timer } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'

interface Session {
  id: string
  sessionId: string
  attended: boolean | null
  session: {
    id: string
    title: string
    startTime: string
    endTime: string
    status: string
    roomId: string | null
    externalLink: string | null
    externalLinkType: string | null
    teacher: {
      user: {
        name: string
      }
    }
  }
}

export default function SessionsTab({ isActive }: { isActive: boolean }) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isActive) {
      fetchSessions()
      const interval = setInterval(() => {
        fetchSessions()
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [isActive])

  async function fetchSessions() {
    try {
      const response = await fetch('/api/sessions/student')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingSessions = sessions.filter(s => {
    const startTime = new Date(s.session.startTime)
    return startTime > now && s.session.status === 'SCHEDULED'
  })
  
  const activeSessions = sessions.filter(s => {
    const startTime = new Date(s.session.startTime)
    const minutesFromStart = (now.getTime() - startTime.getTime()) / (1000 * 60)
    return startTime <= now && minutesFromStart <= 10 && s.session.status === 'SCHEDULED'
  })
  
  const pastSessions = sessions.filter(s => {
    const startTime = new Date(s.session.startTime)
    const minutesFromStart = (now.getTime() - startTime.getTime()) / (1000 * 60)
    return (startTime <= now && minutesFromStart > 10) || s.session.status !== 'SCHEDULED'
  })

  if (!isActive) {
    return (
      <div dir="rtl">
        <h2 className="text-3xl font-black text-gray-900 mb-6">حصصي المباشرة</h2>
        <Alert variant="warning">
          <p>قم بتفعيل حسابك لحجز الحصص والوصول للبث المباشر.</p>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-10" dir="rtl">
      <div>
        <h2 className="text-3xl font-black text-gray-900">حصصي المباشرة</h2>
        <p className="text-gray-500 mt-1">تابع حصصك المجدولة وانضم للبث المباشر</p>
      </div>

      {activeSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
            <h3 className="text-xl font-black">الحصص الجارية الآن</h3>
          </div>
          <div className="grid gap-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="relative overflow-hidden bg-white border-2 border-emerald-500 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-emerald-100 group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full -translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Video className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-gray-900">{session.session.title}</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase">LIVE</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>المعلم: {session.session.teacher.user.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(session.session.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.session.externalLink ? (
                      <Button 
                        variant="primary" 
                        className="!rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 px-8 py-4 h-auto text-base font-black"
                        onClick={() => window.open(session.session.externalLink!, '_blank')}
                      >
                        <ExternalLink className="h-5 w-5 ml-2" />
                        انضم عبر الرابط الخارجي
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        className="!rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 px-8 py-4 h-auto text-base font-black animate-bounce"
                        onClick={() => router.push(`/session/${session.session.id}`)}
                      >
                        <Play className="h-5 w-5 ml-2" />
                        انضم للحصة الآن
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#10B981]" />
          الحصص القادمة ({upcomingSessions.length})
        </h3>
        {upcomingSessions.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-black text-gray-900">لا توجد حصص قادمة</p>
            <p className="text-sm text-gray-400 mt-1">بمجرد جدولة حصة جديدة ستظهر هنا</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingSessions.map((session) => {
              const startTime = new Date(session.session.startTime)
              const diff = startTime.getTime() - now.getTime()
              const days = Math.floor(diff / (1000 * 60 * 60 * 24))
              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
              
              return (
                <div key={session.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-[#10B981]/5 transition-colors">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          {startTime.toLocaleDateString('ar-EG', { month: 'short' })}
                        </span>
                        <span className="text-xl font-black text-gray-900">
                          {startTime.getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-gray-900 mb-1">{session.session.title}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{startTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>{session.session.teacher.user.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#10B981]/5 px-6 py-3 rounded-2xl border border-[#10B981]/10 text-center">
                      <div className="flex items-center gap-2 text-[#10B981] mb-1">
                        <Timer className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">يبدأ خلال</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {days > 0 && (
                          <div className="text-center">
                            <span className="block text-lg font-black text-gray-900 leading-none">{days}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">يوم</span>
                          </div>
                        )}
                        <div className="text-center">
                          <span className="block text-lg font-black text-gray-900 leading-none">{hours}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase">ساعة</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-lg font-black text-gray-900 leading-none">{minutes}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase">دقيقة</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gray-400" />
          الحصص السابقة
        </h3>
        <div className="grid gap-3">
          {pastSessions.slice(0, 5).map((session) => (
            <div key={session.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">{session.session.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {new Date(session.session.startTime).toLocaleDateString('ar-EG')} • {session.session.teacher.user.name}
                  </p>
                </div>
              </div>
              <div>
                {session.attended === true ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                    <CheckCircle className="w-3 h-3" />
                    حضور
                  </div>
                ) : session.attended === false ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase">
                    <XCircle className="w-3 h-3" />
                    غياب
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase">
                    <Clock className="w-3 h-3" />
                    انتظار
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
