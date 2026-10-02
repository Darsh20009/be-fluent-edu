'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, Calendar, Clock, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import { Phase4Nav } from '@/app/phase4/nav'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

interface SessionData {
  id: string
  title: string
  startTime: string
  endTime: string
  status: string
  externalLink?: string
  externalLinkType?: string
  SessionStudent: Array<{ User: { id: string, name: string, phone?: string } }>
}

export default function TeacherSessionsPage() {
  const { language } = useTheme()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ 
    title: '', 
    startTime: '', 
    endTime: '',
    externalLink: '',
    externalLinkType: 'OTHER'
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const response = await fetch('/api/teacher/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (err) {
      setError(localeText(language, 'تعذر تحميل الحصص.', 'Failed to load sessions.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(session: SessionData) {
    try {
      const response = await fetch(`/api/teacher/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        setSuccess(localeText(language, 'تم تحديث الحصة بنجاح.', 'Session updated successfully.'))
        setEditingId(null)
        fetchSessions()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(localeText(language, 'تعذر تحديث الحصة.', 'Failed to update session.'))
    }
  }

  async function handleDelete(sessionId: string) {
    try {
      const response = await fetch(`/api/teacher/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess(localeText(language, 'تم حذف الحصة بنجاح.', 'Session deleted successfully.'))
        setDeleteConfirm(null)
        fetchSessions()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(localeText(language, 'تعذر حذف الحصة.', 'Failed to delete session.'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 bg-[#f4f1e9] p-4 text-[#1f2924] sm:p-6" dir={localeDirection(language)}>
      <div className="border-b border-[#d7d4ca] pb-5">
        <p className="mb-1 text-[10px] font-bold tracking-[0.18em] text-[#758178]">{localeText(language, 'إدارة التدريس', 'TEACHING OPERATIONS')}</p>
        <h1 className="mb-2 text-3xl font-black tracking-tight text-[#174d3a]">
          {localeText(language, 'حصصي', 'My sessions')}
        </h1>
        <p className="text-sm text-[#667168]">
          {localeText(language, 'أدر حصصك: عدّلها أو احذفها أو جدْول حصصاً جديدة.', 'Manage your sessions: edit, delete, or schedule new ones.')}
        </p>
        <Phase4Nav area="teacher" />
      </div>

      {error && <Alert variant="error"><p>{error}</p></Alert>}
      {success && <Alert variant="success"><p>{success}</p></Alert>}

      {sessions.length === 0 ? (
        <Alert variant="info">
          <p>{localeText(language, 'لم تتم جدولة أي حصص بعد.', 'No sessions scheduled yet.')}</p>
          <p>{localeText(language, 'قم بإنشاء حصص جديدة', 'Create new sessions')}</p>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => (
            <Card key={session.id} variant="elevated" className="!rounded-none !border-[#d7d4ca] !bg-[#f8f6f0] !shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-3 text-lg font-bold text-[#174d3a]">
                    {session.title}
                  </h3>
                  <div className="space-y-2 text-sm text-[#667168]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                        <span>{new Date(session.startTime).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(session.startTime).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {' - '}
                        {new Date(session.endTime).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {session.SessionStudent.length} {localeText(language, 'طالب', session.SessionStudent.length !== 1 ? 'Students' : 'Student')}
                        {session.SessionStudent.length > 0 && `: ${session.SessionStudent.map(s => s.User.name).join(', ')}`}
                      </span>
                    </div>
                    {session.SessionStudent.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {session.SessionStudent.map((s: any) => (
                          <Button
                            key={s.User.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const msg = `مرحباً ${s.User.name}، نذكركم بموعد حصة: ${session.title} الآن.`
                              window.open(`https://wa.me/${s.User.phone || ''}?text=${encodeURIComponent(msg)}`, '_blank')
                            }}
                             className="h-auto !rounded-none !border-[#8ba98e] !py-1 text-xs !text-[#174d3a] hover:!bg-[#e8eee8]"
                          >
                            WhatsApp {s.User.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {session.externalLink && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.open(session.externalLink!, '_blank')}
                       className="!rounded-none !bg-[#174d3a] hover:!bg-[#123c2d]"
                    >
                      {localeText(language, 'انضمام خارجي', 'Join external')}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingId(session.id)
                      setEditData({
                        title: session.title,
                        startTime: session.startTime.slice(0, 16),
                        endTime: session.endTime.slice(0, 16),
                        externalLink: session.externalLink || '',
                        externalLinkType: session.externalLinkType || 'OTHER'
                      })
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteConfirm(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Edit Modal */}
              {editingId === session.id && (
                <Modal isOpen={true} onClose={() => setEditingId(null)} title={localeText(language, 'تعديل الحصة', 'Edit session')}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={localeText(language, 'عنوان الحصة', 'Session title')}
                      value={editData.title}
                      onChange={e => setEditData({ ...editData, title: e.target.value })}
                       className="w-full border border-[#c9c7bc] bg-[#f8f6f0] p-2 text-[#1f2924] outline-none focus:border-[#174d3a]"
                    />
                    <input
                      type="datetime-local"
                      value={editData.startTime}
                      onChange={e => setEditData({ ...editData, startTime: e.target.value })}
                       className="w-full border border-[#c9c7bc] bg-[#f8f6f0] p-2 text-[#1f2924] outline-none focus:border-[#174d3a]"
                    />
                    <input
                      type="datetime-local"
                      value={editData.endTime}
                      onChange={e => setEditData({ ...editData, endTime: e.target.value })}
                       className="w-full border border-[#c9c7bc] bg-[#f8f6f0] p-2 text-[#1f2924] outline-none focus:border-[#174d3a]"
                    />
                    <div className="space-y-2">
                       <label className="text-sm font-medium">{localeText(language, 'رابط الاجتماع الخارجي (اختياري)', 'External meeting link (optional)')}</label>
                      <input
                        type="url"
                        placeholder="https://zoom.us/j/..."
                        value={editData.externalLink || ''}
                        onChange={e => setEditData({ ...editData, externalLink: e.target.value })}
                       className="w-full border border-[#c9c7bc] bg-[#f8f6f0] p-2 text-[#1f2924] outline-none focus:border-[#174d3a]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{localeText(language, 'نوع الرابط', 'Link type')}</label>
                      <select
                        value={editData.externalLinkType || 'OTHER'}
                        onChange={e => setEditData({ ...editData, externalLinkType: e.target.value })}
                         className="w-full border border-[#c9c7bc] bg-[#f8f6f0] p-2 text-[#1f2924] outline-none focus:border-[#174d3a]"
                      >
                        <option value="ZOOM">Zoom</option>
                        <option value="GOOGLE_MEET">Google Meet</option>
                        <option value="TEAMS">Microsoft Teams</option>
                        <option value="OTHER">{localeText(language, 'أخرى', 'Other')}</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" onClick={() => handleEdit(session)}>{localeText(language, 'حفظ', 'Save')}</Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>{localeText(language, 'إلغاء', 'Cancel')}</Button>
                    </div>
                  </div>
                </Modal>
              )}

              {/* Delete Confirmation */}
              {deleteConfirm === session.id && (
                <Modal isOpen={true} onClose={() => setDeleteConfirm(null)} title={localeText(language, 'حذف الحصة؟', 'Delete session?')}>
                  <div className="space-y-4">
                    <p>{localeText(language, 'هل أنت متأكد من حذف هذه الحصة؟', 'Are you sure you want to delete this session?')}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(session.id)}
                      >
                        {localeText(language, 'حذف', 'Delete')}
                      </Button>
                      <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>{localeText(language, 'إلغاء', 'Cancel')}</Button>
                    </div>
                  </div>
                </Modal>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
