'use client'

import { AlertCircle, X } from 'lucide-react'

interface SessionDeleteConfirmModalProps {
  isOpen: boolean
  sessionTitle: string
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function SessionDeleteConfirmModal({
  isOpen,
  sessionTitle,
  onConfirm,
  onCancel,
  isLoading = false
}: SessionDeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 border border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Delete Session?</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-neutral-300 mb-4">
          Are you sure you want to delete <strong>{sessionTitle}</strong>? This action cannot be undone.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
