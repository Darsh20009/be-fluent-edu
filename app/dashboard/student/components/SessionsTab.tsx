'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, CheckCircle, XCircle, Video } from 'lucide-react'
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
    return startTime > new Date() && s.session.status === 'SCHEDULED'
  })
  
  const activeSessions = sessions.filter(s => {
    const now = new Date()
    const startTime = new Date(s.session.startTime)
    const minutesFromStart = (now.getTime() - startTime.getTime()) / (1000 * 60)
    return startTime <= now && minutesFromStart <= 10 && s.session.status === 'SCHEDULED'
  })
  
  const pastSessions = sessions.filter(s => {
    const now = new Date()
    const startTime = new Date(s.session.startTime)
    const minutesFromStart = (now.getTime() - startTime.getTime()) / (1000 * 60)
    return (startTime <= now && minutesFromStart > 10) || s.session.status !== 'SCHEDULED'
  })

  if (!isActive) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-300 mb-6">
          My Sessions / حصصي
        </h2>
        <Alert variant="warning">
          <p>Activate your account to book sessions / قم بتفعيل حسابك لحجز الحصص</p>
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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-300">
        My Sessions / حصصي
      </h2>

      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-green-600 mb-4">
            🟢 Join Now! / انضم الآن!
          </h3>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <Card key={session.id} variant="elevated" className="border-2 border-green-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-green-600">{session.session.title}</h3>
                      <Badge variant="success">Session Started / الحصة بدأت</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(session.session.startTime).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {' - '}
                          {new Date(session.session.endTime).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Teacher / المعلم: {session.session.teacher.user.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {session.session.externalLink ? (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => window.open(session.session.externalLink!, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join External / انضمام خارجي
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => router.push(`/session/${session.session.id}`)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Now / انضم
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Upcoming Sessions / الحصص القادمة ({upcomingSessions.length})
        </h3>
        {upcomingSessions.length === 0 ? (
          <Alert variant="info">
            <p>No upcoming sessions scheduled.</p>
            <p>لا توجد حصص مجدولة حالياً.</p>
          </Alert>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <Card key={session.id} variant="elevated">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-primary-600 dark:text-primary-300">{session.session.title}</h3>
                      <Badge variant="primary">Upcoming / قادمة</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(session.session.startTime).toLocaleDateString('ar-EG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(session.session.startTime).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {' - '}
                          {new Date(session.session.endTime).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Teacher / المعلم: {session.session.teacher.user.name}</span>
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const now = new Date()
                    const startTime = new Date(session.session.startTime)
                    const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60)
                    const isJoinable = minutesUntilStart <= 10 && minutesUntilStart >= 0
                    
                    return isJoinable ? (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => router.push(`/session/${session.session.id}`)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Session / انضم للحصة
                      </Button>
                    ) : (
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {minutesUntilStart > 0 
                          ? `Starts in ${Math.ceil(minutesUntilStart)} min / ستبدأ خلال ${Math.ceil(minutesUntilStart)} دقائق`
                          : 'Session ended / انتهت الحصة'
                        }
                      </div>
                    )
                  })()} 
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Past Sessions / الحصص السابقة ({pastSessions.length})
        </h3>
        {pastSessions.length === 0 ? (
          <Alert variant="info">
            <p>No past sessions yet.</p>
            <p>لا توجد حصص سابقة بعد.</p>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pastSessions.slice(0, 5).map((session) => (
              <Card key={session.id} variant="elevated">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{session.session.title}</h3>
                      {session.attended === true ? (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Attended / حضور
                        </Badge>
                      ) : session.attended === false ? (
                        <Badge variant="warning">
                          <XCircle className="h-3 w-3 mr-1" />
                          Absent / غياب
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending / قيد الانتظار
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(session.session.startTime).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{session.session.teacher.user.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
