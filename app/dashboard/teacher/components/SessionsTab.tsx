'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Users, Plus, Video, Edit, Trash2, CheckCircle, XCircle, Clock3 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
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
    selectedStudents: [] as string[]
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

  async function fetchSessions() {
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

  async function handleCreateSession() {
    // Validate all required fields
    if (!newSession.title || !newSession.title.trim()) {
      alert('⚠️ Please enter session title / يرجى إدخال عنوان الحصة')
      return
    }
    if (!newSession.startTime) {
      alert('⚠️ Please select start time / يرجى اختيار وقت البداية')
      return
    }
    if (!newSession.endTime) {
      alert('⚠️ Please select end time / يرجى اختيار وقت النهاية')
      return
    }

    // Validate date format
    const startDate = new Date(newSession.startTime)
    const endDate = new Date(newSession.endTime)
    
    if (isNaN(startDate.getTime())) {
      alert('⚠️ Invalid start time / وقت بداية غير صحيح')
      return
    }
    if (isNaN(endDate.getTime())) {
      alert('⚠️ Invalid end time / وقت نهاية غير صحيح')
      return
    }
    if (startDate >= endDate) {
      alert('⚠️ Start time must be before end time / يجب أن يكون وقت البداية قبل وقت النهاية')
      return
    }

    setSubmitting(true)
    try {
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
          studentIds: newSession.selectedStudents
        })
      })

      if (response.ok) {
        const createdSession = await response.json()
        console.log('✅ Session created successfully:', createdSession.id)
        await fetchSessions()
        setSessionTitle(newSession.title)
        setSessionPassword(createdSession.sessionPassword || '')
        setShowPasswordModal(true)
        setNewSession({ title: '', startTime: '', endTime: '', selectedStudents: [] })
        setShowCreateForm(false)
      } else {
        const error = await response.json()
        console.error('Session creation error:', error)
        alert(`❌ Failed to create session: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert(`❌ Error creating session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateSession() {
    if (!editingSessionId) {
      alert('⚠️ No session selected / لم يتم اختيار حصة')
      return
    }
    if (!newSession.title || !newSession.title.trim()) {
      alert('⚠️ Please enter session title / يرجى إدخال عنوان الحصة')
      return
    }
    if (!newSession.startTime) {
      alert('⚠️ Please select start time / يرجى اختيار وقت البداية')
      return
    }
    if (!newSession.endTime) {
      alert('⚠️ Please select end time / يرجى اختيار وقت النهاية')
      return
    }

    // Validate date format
    const startDate = new Date(newSession.startTime)
    const endDate = new Date(newSession.endTime)
    
    if (isNaN(startDate.getTime())) {
      alert('⚠️ Invalid start time / وقت بداية غير صحيح')
      return
    }
    if (isNaN(endDate.getTime())) {
      alert('⚠️ Invalid end time / وقت نهاية غير صحيح')
      return
    }
    if (startDate >= endDate) {
      alert('⚠️ Start time must be before end time / يجب أن يكون وقت البداية قبل وقت النهاية')
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
          endTime: utcEndTime
        })
      })

      if (response.ok) {
        console.log('✅ Session updated successfully')
        await fetchSessions()
        setNewSession({ title: '', startTime: '', endTime: '', selectedStudents: [] })
        setEditingSessionId(null)
        setShowEditForm(false)
        alert('✅ Session updated successfully / تم تحديث الحصة بنجاح')
      } else {
        const error = await response.json()
        console.error('Session update error:', error)
        alert(`❌ Failed to update session: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating session:', error)
      alert(`❌ Error updating session: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        alert('✅ Session canceled successfully / تم إلغاء الحصة بنجاح')
      } else {
        const error = await response.json()
        console.error('Cancel session error:', error)
        alert(`Failed to cancel session: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error canceling session:', error)
      alert('Error canceling session')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetAttendance(sessionId: string, studentId: string, status: 'PRESENT' | 'ABSENT' | 'POSTPONED') {
    setSubmitting(true)
    try {
      const statusLabels = {
        'PRESENT': 'حاضر / Present',
        'ABSENT': 'غائب / Absent',
        'POSTPONED': 'مؤجل / Postponed'
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
          alert(`✅ Lesson postponed / تم تأجيل الحصة`)
        }
      } else {
        const error = await response.json()
        console.error('Attendance error:', error)
        alert(`Failed to update attendance: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error setting attendance:', error)
      alert('Error updating attendance')
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
      selectedStudents: session.SessionStudent.map(s => s.id)
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
          Sessions / الحصص
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session / حصة جديدة
        </Button>
      </div>

      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            🔴 Active Sessions - Mark Attendance / الحصص الجارية - حدد الحضور
          </h3>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <Card key={session.id} variant="elevated" className="border-2 border-red-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-red-600">{session.title}</h3>
                      <Badge variant="primary">In Progress / جاري</Badge>
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
                                Present / حاضر
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetAttendance(session.id, student.id, 'ABSENT')}
                                disabled={submitting}
                                className={attendanceStatuses[student.id] === 'ABSENT' ? 'bg-red-100' : ''}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent / غائب
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetAttendance(session.id, student.id, 'POSTPONED')}
                                disabled={submitting}
                                className={attendanceStatuses[student.id] === 'POSTPONED' ? 'bg-yellow-100' : ''}
                              >
                                <Clock3 className="h-4 w-4 mr-1" />
                                Postpone / أجل
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
                    Join / انضم
                  </Button>
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
            <p>لا توجد حصص قادمة مجدولة.</p>
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
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => router.push(`/session/${session.id}`)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Start / ابدأ
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditForm(session)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit / عدّل
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
                      Delete / احذف
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
          Past Sessions / الحصص السابقة ({pastSessions.length})
        </h3>
        {pastSessions.length === 0 ? (
          <Alert variant="info">
            <p>No past sessions yet.</p>
            <p>لا توجد حصص سابقة بعد.</p>
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
          title="Create New Session / إنشاء حصة جديدة"
        >
          <div className="space-y-4">
            <Input
              label="Session Title / عنوان الحصة"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              placeholder="e.g., English Conversation - Lesson 1"
            />
            <Input
              label="Start Time / وقت البداية"
              type="datetime-local"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
            />
            <Input
              label="End Time / وقت النهاية"
              type="datetime-local"
              value={newSession.endTime}
              onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Students / اختر الطلاب
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-2 mb-2">
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
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{student.name} ({student.email})</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {newSession.selectedStudents.length} student(s) selected
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateSession}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create / إنشاء'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCreateForm(false)}
              >
                Cancel / إلغاء
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
            setNewSession({ title: '', startTime: '', endTime: '', selectedStudents: [] })
          }}
          title="Edit Session / تعديل الحصة"
        >
          <div className="space-y-4">
            <Input
              label="Session Title / عنوان الحصة"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
            />
            <Input
              label="Start Time / وقت البداية"
              type="datetime-local"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
            />
            <Input
              label="End Time / وقت النهاية"
              type="datetime-local"
              value={newSession.endTime}
              onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleUpdateSession}
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update / حدّث'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowEditForm(false)
                  setEditingSessionId(null)
                  setNewSession({ title: '', startTime: '', endTime: '', selectedStudents: [] })
                }}
              >
                Cancel / إلغاء
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
          title="Delete Session / حذف الحصة"
        >
          <div className="space-y-4">
            <p className="text-gray-700">Are you sure you want to delete this session? / هل أنت متأكد من حذف هذه الحصة؟</p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleDeleteSession}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? 'Deleting...' : 'Delete / احذف'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingSessionId(null)
                }}
              >
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {alertAttendanceSession && (
        <Modal
          isOpen={true}
          onClose={() => setAlertAttendanceSession(null)}
          title="Attendance Alert - 10 Minutes Passed / تنبيه الحضور - مرت 10 دقائق"
        >
          <div className="space-y-4">
            <p className="text-gray-700 font-semibold">
              Session: {alertAttendanceSession.title}
            </p>
            <p className="text-gray-600">
              10 minutes have passed since the session started. Please mark attendance for students who have not joined.
              <br />
              مرت 10 دقائق على بدء الحصة. يرجى تحديد حالة الطلاب الذين لم ينضموا.
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
              Done / تم
            </Button>
          </div>
        </Modal>
      )}

      <SessionPasswordDisplayModal
        isOpen={showPasswordModal}
        sessionTitle={sessionTitle}
        password={sessionPassword}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}
