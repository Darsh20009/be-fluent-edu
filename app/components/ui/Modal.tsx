'use client'

import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-bold text-[#10B981]">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-auto"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
