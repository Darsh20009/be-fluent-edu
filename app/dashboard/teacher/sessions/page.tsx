'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, Calendar, Clock, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'

interface SessionData {
  id: string
  title: string
  startTime: string
  endTime: string
  status: string
  externalLink?: string
  SessionStudent: Array<{ User: { id: string, name: string, phone?: string } }>
}

export default function TeacherSessionsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ title: '', startTime: '', endTime: '' })
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
      setError('Failed to load sessions')
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
        setSuccess('Session updated successfully')
        setEditingId(null)
        fetchSessions()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to update session')
    }
  }

  async function handleDelete(sessionId: string) {
    try {
      const response = await fetch(`/api/teacher/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Session deleted successfully')
        setDeleteConfirm(null)
        fetchSessions()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to delete session')
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-300 mb-2">
          My Sessions / حصصي
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your sessions - edit, delete, or schedule new ones
        </p>
      </div>

      {error && <Alert variant="error"><p>{error}</p></Alert>}
      {success && <Alert variant="success"><p>{success}</p></Alert>}

      {sessions.length === 0 ? (
        <Alert variant="info">
          <p>No sessions scheduled yet.</p>
          <p>قم بإنشاء حصص جديدة</p>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => (
            <Card key={session.id} variant="elevated">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-primary-600 dark:text-primary-300 mb-2">
                    {session.title}
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
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
                      <span>
                        {session.SessionStudent.length} Student{session.SessionStudent.length !== 1 ? 's' : ''}
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
                            className="text-xs py-1 h-auto border-green-500 text-green-600 hover:bg-green-50"
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
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Join External / انضمام خارجي
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
                        endTime: session.endTime.slice(0, 16)
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
                <Modal isOpen={true} onClose={() => setEditingId(null)} title="Edit Session">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Session Title"
                      value={editData.title}
                      onChange={e => setEditData({ ...editData, title: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-neutral-800 dark:text-neutral-100"
                    />
                    <input
                      type="datetime-local"
                      value={editData.startTime}
                      onChange={e => setEditData({ ...editData, startTime: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-neutral-800 dark:text-neutral-100"
                    />
                    <input
                      type="datetime-local"
                      value={editData.endTime}
                      onChange={e => setEditData({ ...editData, endTime: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-neutral-800 dark:text-neutral-100"
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" onClick={() => handleEdit(session)}>Save</Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                </Modal>
              )}

              {/* Delete Confirmation */}
              {deleteConfirm === session.id && (
                <Modal isOpen={true} onClose={() => setDeleteConfirm(null)} title="Delete Session?">
                  <div className="space-y-4">
                    <p>Are you sure you want to delete this session? هل أنت متأكد من حذف هذه الحصة؟</p>
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(session.id)}
                      >
                        Delete / حذف
                      </Button>
                      <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel / إلغاء</Button>
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
