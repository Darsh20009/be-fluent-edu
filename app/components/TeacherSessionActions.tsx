'use client'

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import SessionEditModal from './SessionEditModal'
import SessionDeleteConfirmModal from './SessionDeleteConfirmModal'

interface SessionActionProps {
  sessionId: string
  sessionTitle: string
  startTime: string
  endTime: string
  onSessionUpdated?: () => void
  onSessionDeleted?: () => void
}

export default function TeacherSessionActions({
  sessionId,
  sessionTitle,
  startTime,
  endTime,
  onSessionUpdated,
  onSessionDeleted
}: SessionActionProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleEdit = async (data: { title: string; startTime: string; endTime: string }) => {
    const response = await fetch(`/api/teacher/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to update session')
    }

    onSessionUpdated?.()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/teacher/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }

      onSessionDeleted?.()
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          title="Edit session"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          title="Delete session"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <SessionEditModal
        isOpen={showEditModal}
        session={{ id: sessionId, title: sessionTitle, startTime, endTime }}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
      />

      <SessionDeleteConfirmModal
        isOpen={showDeleteModal}
        sessionTitle={sessionTitle}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={deleting}
      />
    </>
  )
}
