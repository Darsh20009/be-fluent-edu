'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import { Calendar, Clock, Users, Plus, Video, Edit, Trash2, CheckCircle, XCircle, Clock3 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'
import SessionPasswordDisplayModal from '../../../components/SessionPasswordDisplayModal'

interface Session {
  id: string
  title: string
  startTime: string
  endTime: string
  status: string
  roomId: string | null
  sessionPassword?: string
  SessionStudent: Array<{
    id: string
    attended: boolean | null
    User: {
      name: string
    }
  }>
}

interface Student {
  id: string
  name: string
  email: string
}

export default function SessionsTab({ teacherProfileId }: { teacherProfileId: string }) {
  const { language } = useTheme()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [sessionPassword, setSessionPassword] = useState('')
  const [sessionMeetingUrl, setSessionMeetingUrl] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [attendanceSession, setAttendanceSession] = useState<Session | null>(null)
  const [attendanceStatuses, setAttendanceStatuses] = useState<{ [studentId: string]: string }>({})
  const [alertAttendanceSession, setAlertAttendanceSession] = useState<Session | null>(null)
  const [newSession, setNewSession] = useState({
    title: '',
    startTime: '',
    endTime: '',
    selectedStudents: [] as string[],
    externalLink: '',
    externalLinkType: 'ZOOM'
  })
  const [submitting, setSubmitting] = useState(false)
  const [shownAlertSessionIds, setShownAlertSessionIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSessions()
    fetchStudents()
    const interval = setInterval(() => {
      fetchSessions()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Check for sessions needing attendance alert after fetching
  useEffect(() => {
    if (sessions.length === 0) return
    
    const now = new Date()
    const alertSession = sessions.find(s => {
      const startTime = new Date(s.startTime)
      const minutesFromStart = (now.getTime() - startTime.getTime()) / (1000 * 60)
      return (
        minutesFromStart > 10 && 
        minutesFromStart <= 15 && 
        s.status === 'SCHEDULED' && 
        !shownAlertSessionIds.has(s.id)
      )
    })
    
    if (alertSession) {
      setAlertAttendanceSession(alertSession)
      setShownAlertSessionIds(prev => new Set([...Array.from(prev), alertSession.id]))
    }
  }, [sessions, shownAlertSessionIds])

  async function fetchStudents() {
    try {
      const response = await fetch('/api/teacher/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/teacher/sessions')
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

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    try {
      const res = await fetch(`/api/teacher/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchSessions()
        toast.success(localeText(language, 'تم تحديث الحالة بنجاح', 'Status updated successfully'))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  async function handleCreateSession() {
    // Validate all required fields
    if (!newSession.title || !newSession.title.trim()) {
      toast.error(localeText(language, 'يرجى إدخال عنوان الحصة', 'Enter a session title'))
      return
    }
    if (!newSession.startTime) {
      toast.error(localeText(language, 'يرجى اختيار وقت البداية', 'Select a start time'))
      return
    }
    if (!newSession.endTime) {
      toast.error(localeText(language, 'يرجى اختيار وقت النهاية', 'Select an end time'))
      return
    }

    // Validate date format
    const startDate = new Date(newSession.startTime)
    const endDate = new Date(newSession.endTime)
    
    if (isNaN(startDate.getTime())) {
      toast.error(localeText(language, 'وقت بداية غير صحيح', 'Invalid start time'))
      return
    }
    if (isNaN(endDate.getTime())) {
      toast.error(localeText(language, 'وقت نهاية غير صحيح', 'Invalid end time'))
      return
    }
    if (startDate >= endDate) {
      toast.error(localeText(language, 'يجب أن يكون وقت البداية قبل وقت النهاية', 'The start time must be before the end time'))
      return
    }

    setSubmitting(true)
    try {
      const useQMeet = newSession.externalLinkType === 'QMEET'
      // Convert local time directly to UTC (datetime-local input is parsed as local time)
      const utcStartTime = startDate.toISOString()
      const utcEndTime = endDate.toISOString()

      console.log('Creating session:', { title: newSession.title, localStart: newSession.startTime, utcStart: utcStartTime, localEnd: newSession.endTime, utcEnd: utcEndTime })

      const response = await fetch('/api/teacher/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSession.title.trim(),
          startTime: utcStartTime,
          endTime: utcEndTime,
          studentIds: newSession.selectedStudents,
          externalLink: useQMeet ? undefined : newSession.externalLink.trim() || undefined,
          externalLinkType: !useQMeet && newSession.externalLink ? newSession.externalLinkType : undefined
        })
      })

      if (response.ok) {
        const createdSession = await response.json()
        console.log('✅ Session created successfully:', createdSession.id)
        let meetingUrl = ''
        let qmeetError = ''
        if (useQMeet) {
          try {
            const qmeetResponse = await fetch(`/api/teacher/classes/sessions/${encodeURIComponent(createdSession.id)}/qmeet`, {
              method: 'POST'
            })
            const qmeetBody = await qmeetResponse.json().catch(() => ({}))
            if (!qmeetResponse.ok) {
              qmeetError = typeof qmeetBody?.error?.message === 'string'
                ? qmeetBody.error.message
                : localeText(language, 'تعذر إنشاء اجتماع QMeet.', 'Could not create the QMeet meeting.')
            } else {
              const meeting = qmeetBody.meeting
              meetingUrl = typeof meeting?.hostUrl === 'string' ? meeting.hostUrl : typeof meeting?.joinUrl === 'string' ? meeting.joinUrl : ''
              if (!meetingUrl) qmeetError = localeText(language, 'لم يُرجع QMeet رابطًا للاجتماع.', 'QMeet did not return a meeting link.')
            }
          } catch {
            qmeetError = localeText(language, 'تعذر الاتصال بخدمة QMeet.', 'Could not reach QMeet.')
          }
        }
        await fetchSessions()
        setSessionTitle(newSession.title)
        setSessionPassword(createdSession.sessionPassword || '')
        setSessionMeetingUrl(meetingUrl)
        setShowPasswordModal(true)
        setNewSession({ 
          title: '', 
          startTime: '', 
          endTime: '', 
          selectedStudents: [],
          externalLink: '',
          externalLinkType: 'ZOOM'
        })
        setShowCreateForm(false)
        if (qmeetError) {
          toast.error(`${localeText(language, 'حُفظت الحصة لكن تعذر إنشاء اجتماع QMeet:', 'The class was saved, but QMeet could not be created:')} ${qmeetError}`)
        }
      } else {
        const error = await response.json()
        console.error('Session creation error:', error)
        toast.error(`${localeText(language, 'فشل إنشاء الحصة:', 'Could not create session:')} ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error(localeText(language, 'خطأ في إنشاء الحصة', 'Error creating session'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateSession() {
    if (!editingSessionId) {
      toast.error(localeText(language, 'لم يتم اختيار حصة', 'No session selected'))
      return
    }
    if (!newSession.title || !newSession.title.trim()) {
      toast.error(localeText(language, 'يرجى إدخال عنوان الحصة', 'Enter a session title'))
      return
    }
    if (!newSession.startTime) {
      toast.error(localeText(language, 'يرجى اختيار وقت البداية', 'Select a start time'))
      return
    }
    if (!newSession.endTime) {
      toast.error(localeText(language, 'يرجى اختيار وقت النهاية', 'Select an end time'))
      return
    }

    // Validate date format
    const startDate = new Date(newSession.startTime)
    const endDate = new Date(newSession.endTime)
    
    if (isNaN(startDate.getTime())) {
      toast.error(localeText(language, 'وقت بداية غير صحيح', 'Invalid start time'))
      return
    }
    if (isNaN(endDate.getTime())) {
      toast.error(localeText(language, 'وقت نهاية غير صحيح', 'Invalid end time'))
      return
    }
    if (startDate >= endDate) {
      toast.error(localeText(language, 'يجب أن يكون وقت البداية قبل وقت النهاية', 'The start time must be before the end time'))
      return
    }

    setSubmitting(true)
    try {
      // Convert local time directly to UTC (datetime-local input is parsed as local time)
      const utcStartTime = startDate.toISOString()
      const utcEndTime = endDate.toISOString()

      console.log('Updating session:', { id: editingSessionId, title: newSession.title, localStart: newSession.startTime, utcStart: utcStartTime })

      const response = await fetch(`/api/teacher/sessions/${editingSessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSession.title.trim(),
          startTime: utcStartTime,
          endTime: utcEndTime,
          externalLink: newSession.externalLink.trim() || null,
          externalLinkType: newSession.externalLink ? newSession.externalLinkType : null
        })
      })

      if (response.ok) {
        console.log('✅ Session updated successfully')
        await fetchSessions()
        setNewSession({ title: '', startTime: '', endTime: '', selectedStudents: [], externalLink: '', externalLinkType: 'ZOOM' })
        setEditingSessionId(null)
        setShowEditForm(false)
        toast.success(localeText(language, 'تم تحديث الحصة بنجاح', 'Session updated successfully'))
      } else {
        const error = await response.json()
        console.error('Session update error:', error)
        toast.error(`${localeText(language, 'فشل تحديث الحصة:', 'Could not update session:')} ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating session:', error)
      toast.error(localeText(language, 'خطأ في تحديث الحصة', 'Error updating session'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteSession() {
    if (!deletingSessionId) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/teacher/sessions/${deletingSessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log(`✅ Session ${deletingSessionId} canceled successfully`)
        await fetchSessions()
        setDeletingSessionId(null)
        setShowDeleteConfirm(false)
        toast.success(localeText(language, 'تم إلغاء الحصة بنجاح', 'Session canceled successfully'))
      } else {
        const error = await response.json()
        console.error('Cancel session error:', error)
        toast.error(`${localeText(language, 'فشل إلغاء الحصة:', 'Could not cancel session:')} ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error canceling session:', error)
      toast.error(localeText(language, 'خطأ في إلغاء الحصة', 'Error canceling session'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetAttendance(sessionId: string, studentId: string, status: 'PRESENT' | 'ABSENT' | 'POSTPONED') {
    setSubmitting(true)
    try {
      const statusLabels = {
        'PRESENT': localeText(language, 'حاضر', 'Present'),
        'ABSENT': localeText(language, 'غائب', 'Absent'),
        'POSTPONED': localeText(language, 'مؤجل', 'Postponed')
      }
      
      const response = await fetch(`/api/teacher/sessions/${sessionId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, status })
      })

      if (response.ok) {
        console.log(`✅ Attendance set to ${status} for student ${studentId}`)
        setAttendanceStatuses({ ...attendanceStatuses, [studentId]: status })
        await fetchSessions()
        if (status === 'POSTPONED') {
          toast.success(localeText(language, 'تم تأجيل الحصة بنجاح', 'Session postponed successfully'))
        }
      } else {
        const error = await response.json()
        console.error('Attendance error:', error)
        toast.error(`${localeText(language, 'فشل تحديث الحضور:', 'Could not update attendance:')} ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error setting attendance:', error)
      toast.error(localeText(language, 'خطأ في تحديث الحضور', 'Error updating attendance'))
    } finally {
      setSubmitting(false)
    }
  }

  function openEditForm(session: Session) {
    setEditingSessionId(session.id)
    setNewSession({
      title: session.title,
      startTime: new Date(session.startTime).toISOString().slice(0, 16),
      endTime: new Date(session.endTime).toISOString().slice(0, 16),
      selectedStudents: session.SessionStudent.map(s => s.id),
      externalLink: (session as any).externalLink || '',
      externalLinkType: (session as any).externalLinkType || 'ZOOM'
    })
    setShowEditForm(true)
  }

  function openAttendanceModal(session: Session) {
    setAttendanceSession(session)
    setAttendanceStatuses({})
    setShowAttendanceModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const now = new Date()
  const upcomingSessions = sessions.filter(s => {
    try {
      return new Date(s.startTime) > now && s.status === 'SCHEDULED'
    } catch {
      return false
    }
  })
  
  const activeSessions = sessions.filter(s => {
    try {
      const startTime = new Date(s.startTime)
      const endTime = new Date(s.endTime)
      const minutesFromStart = (now.getTime() - startTime.getTime()) / (1000 * 60)
      return startTime <= now && endTime >= now && minutesFromStart <= 10
    } catch {
      return false
    }
  })

  const pastSessions = sessions.filter(s => {
    try {
      const startTime = new Date(s.startTime)
      return startTime <= now
    } catch {
      return false
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#10B981]">
          {localeText(language, 'الحصص', 'Sessions')}
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {localeText(language, 'حصة جديدة', 'New session')}
        </Button>
      </div>

      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            🔴 {localeText(language, 'الحصص الجارية - حدد الحضور', 'Active sessions - mark attendance')}
          </h3>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <Card key={session.id} variant="elevated" className="border-2 border-red-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-red-600">{session.title}</h3>
                      <Badge variant="primary">{localeText(language, 'جاري', 'In progress')}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {session.SessionStudent.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium text-gray-700">{student.User.name}</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetAttendance(session.id, student.id, 'PRESENT')}
                                disabled={submitting}
                                className={attendanceStatuses[student.id] === 'PRESENT' ? 'bg-green-100' : ''}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {localeText(language, 'حاضر', 'Present')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetAttendance(session.id, student.id, 'ABSENT')}
                                disabled={submitting}
                                className={attendanceStatuses[student.id] === 'ABSENT' ? 'bg-red-100' : ''}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {localeText(language, 'غائب', 'Absent')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetAttendance(session.id, student.id, 'POSTPONED')}
                                disabled={submitting}
                                className={attendanceStatuses[student.id] === 'POSTPONED' ? 'bg-yellow-100' : ''}
                              >
                                <Clock3 className="h-4 w-4 mr-1" />
                                {localeText(language, 'أجّل', 'Postpone')}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => router.push(`/session/${session.id}`)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {localeText(language, 'انضم', 'Join')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          {localeText(language, 'الحصص القادمة', 'Upcoming sessions')} ({upcomingSessions.length})
        </h3>
        {upcomingSessions.length === 0 ? (
          <Alert variant="info">
            <p>No upcoming sessions scheduled.</p>
            <p>{localeText(language, 'لا توجد حصص قادمة مجدولة.', 'No upcoming sessions are scheduled.')}</p>
          </Alert>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <Card key={session.id} variant="elevated">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{session.title}</h3>
                      <Badge variant="success">Upcoming</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(session.startTime).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(session.startTime).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {' - '}
                          {new Date(session.endTime).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{session.SessionStudent.length} student(s) enrolled</span>
                      </div>
                    </div>
                  </div>
                    <div className="flex flex-col gap-2">
                      {session.status === 'SCHEDULED' && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {localeText(language, 'إنهاء', 'Complete')}
                        </Button>
                      )}
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => router.push(`/session/${session.id}`)}
                      >
                      <Video className="h-4 w-4 mr-2" />
                      {localeText(language, 'ابدأ', 'Start')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditForm(session)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {localeText(language, 'عدّل', 'Edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDeletingSessionId(session.id)
                        setShowDeleteConfirm(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {localeText(language, 'احذف', 'Delete')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          {localeText(language, 'الحصص السابقة', 'Past sessions')} ({pastSessions.length})
        </h3>
        {pastSessions.length === 0 ? (
          <Alert variant="info">
            <p>No past sessions yet.</p>
            <p>{localeText(language, 'لا توجد حصص سابقة بعد.', 'No past sessions yet.')}</p>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pastSessions.slice(0, 10).map((session) => (
              <Card key={session.id} variant="elevated">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{session.title}</h3>
                      <Badge variant="neutral">Completed</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(session.startTime).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{session.SessionStudent.length} student(s)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateForm(false)}
          title={localeText(language, 'إنشاء حصة جديدة', 'Create new session')}
        >
          <div className="space-y-4">
            <Input
              label={localeText(language, 'عنوان الحصة', 'Session title')}
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              placeholder="e.g., English Conversation - Lesson 1"
            />
            <Input
              label={localeText(language, 'وقت البداية', 'Start time')}
              type="datetime-local"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
            />
            <Input
              label={localeText(language, 'وقت النهاية', 'End time')}
              type="datetime-local"
              value={newSession.endTime}
              onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {localeText(language, 'اختر الطلاب', 'Select students')}
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={newSession.selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewSession({
                            ...newSession,
                            selectedStudents: [...newSession.selectedStudents, student.id]
                          })
                        } else {
                          setNewSession({
                            ...newSession,
                            selectedStudents: newSession.selectedStudents.filter(id => id !== student.id)
                          })
                        }
                      }}
                      className="w-4 h-4 cursor-pointer text-[#10B981] focus:ring-[#10B981]"
                    />
                    <span className="text-sm text-gray-700">{student.name} ({student.email})</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {newSession.selectedStudents.length} student(s) selected
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-[#10B981] mb-3 uppercase tracking-wider">{localeText(language, 'رابط خارجي', 'External link')}</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                   <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">{localeText(language, 'المنصة', 'Platform')}</label>
                    <select
                      value={newSession.externalLinkType}
                      onChange={(e) => setNewSession({ ...newSession, externalLinkType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="ZOOM">Zoom</option>
                       <option value="QMEET">QMeet</option>
                      <option value="GOOGLE_MEET">Google Meet</option>
                      <option value="TEAMS">Microsoft Teams</option>
                      <option value="OTHER">{localeText(language, 'أخرى', 'Other')}</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex items-end">
                     <p className="text-[10px] text-gray-500 leading-tight">{newSession.externalLinkType === 'QMEET'
                       ? localeText(language, 'سيُنشأ رابط QMeet تلقائيًا عند حفظ الحصة', 'A QMeet link will be created automatically when the class is saved.')
                       : localeText(language, 'سيتم توجيه الطلاب لهذا الرابط عند انضمامهم', 'Students will be directed to this link when they join.')}</p>
                  </div>
                </div>
                {newSession.externalLinkType !== 'QMEET' && <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{localeText(language, 'رابط الاجتماع', 'Meeting link')}</label>
                  <input
                    type="url"
                    value={newSession.externalLink}
                    onChange={(e) => setNewSession({ ...newSession, externalLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateSession}
                disabled={submitting}
              >
                {submitting ? localeText(language, 'جارٍ الإنشاء…', 'Creating…') : localeText(language, 'إنشاء', 'Create')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCreateForm(false)}
              >
                {localeText(language, 'إلغاء', 'Cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showEditForm && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowEditForm(false)
            setEditingSessionId(null)
            setNewSession({ title: '', startTime: '', endTime: '', selectedStudents: [], externalLink: '', externalLinkType: 'ZOOM' })
          }}
          title={localeText(language, 'تعديل الحصة', 'Edit session')}
        >
          <div className="space-y-4">
            <Input
              label={localeText(language, 'عنوان الحصة', 'Session title')}
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
            />
            <Input
              label={localeText(language, 'وقت البداية', 'Start time')}
              type="datetime-local"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
            />
            <Input
              label={localeText(language, 'وقت النهاية', 'End time')}
              type="datetime-local"
              value={newSession.endTime}
              onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
            />
            
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-[#10B981] mb-3 uppercase tracking-wider">{localeText(language, 'رابط خارجي', 'External link')}</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                   <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">{localeText(language, 'المنصة', 'Platform')}</label>
                    <select
                      value={newSession.externalLinkType}
                      onChange={(e) => setNewSession({ ...newSession, externalLinkType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="ZOOM">Zoom</option>
                      <option value="GOOGLE_MEET">Google Meet</option>
                      <option value="TEAMS">Microsoft Teams</option>
                      <option value="OTHER">{localeText(language, 'أخرى', 'Other')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{localeText(language, 'رابط الاجتماع', 'Meeting link')}</label>
                  <input
                    type="url"
                    value={newSession.externalLink}
                    onChange={(e) => setNewSession({ ...newSession, externalLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleUpdateSession}
                disabled={submitting}
              >
                {submitting ? localeText(language, 'جارٍ التحديث…', 'Updating…') : localeText(language, 'حدّث', 'Update')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowEditForm(false)
                  setEditingSessionId(null)
                  setNewSession({ title: '', startTime: '', endTime: '', selectedStudents: [], externalLink: '', externalLinkType: 'ZOOM' })
                }}
              >
                {localeText(language, 'إلغاء', 'Cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowDeleteConfirm(false)
            setDeletingSessionId(null)
          }}
          title={localeText(language, 'حذف الحصة', 'Delete session')}
        >
          <div className="space-y-4">
            <p className="text-gray-700">{localeText(language, 'هل أنت متأكد من حذف هذه الحصة؟', 'Are you sure you want to delete this session?')}</p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleDeleteSession}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? localeText(language, 'جارٍ الحذف…', 'Deleting…') : localeText(language, 'احذف', 'Delete')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingSessionId(null)
                }}
              >
                {localeText(language, 'إلغاء', 'Cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {alertAttendanceSession && (
        <Modal
          isOpen={true}
          onClose={() => setAlertAttendanceSession(null)}
          title={localeText(language, 'تنبيه الحضور - مرت 10 دقائق', 'Attendance alert - 10 minutes passed')}
        >
          <div className="space-y-4">
            <p className="text-gray-700 font-semibold">
              Session: {alertAttendanceSession.title}
            </p>
            <p className="text-gray-600">
              10 minutes have passed since the session started. Please mark attendance for students who have not joined.
              <br />
              {localeText(language, 'مرت 10 دقائق على بدء الحصة. يرجى تحديد حالة الطلاب الذين لم ينضموا.', 'Ten minutes have passed since the session started. Please set the status of students who have not joined.')}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alertAttendanceSession.SessionStudent.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{student.User.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetAttendance(alertAttendanceSession.id, student.id, 'PRESENT')}
                      disabled={submitting}
                      className={attendanceStatuses[student.id] === 'PRESENT' ? 'bg-green-100' : ''}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetAttendance(alertAttendanceSession.id, student.id, 'ABSENT')}
                      disabled={submitting}
                      className={attendanceStatuses[student.id] === 'ABSENT' ? 'bg-red-100' : ''}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetAttendance(alertAttendanceSession.id, student.id, 'POSTPONED')}
                      disabled={submitting}
                      className={attendanceStatuses[student.id] === 'POSTPONED' ? 'bg-yellow-100' : ''}
                    >
                      <Clock3 className="h-4 w-4 mr-1" />
                      Postpone
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setAlertAttendanceSession(null)}
            >
              {localeText(language, 'تم', 'Done')}
            </Button>
          </div>
        </Modal>
      )}

      <SessionPasswordDisplayModal
        isOpen={showPasswordModal}
        sessionTitle={sessionTitle}
        password={sessionPassword}
        meetingUrl={sessionMeetingUrl || undefined}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}
