'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface SessionPasswordDisplayModalProps {
  isOpen: boolean
  sessionTitle: string
  password: string
  onClose: () => void
}

export default function SessionPasswordDisplayModal({
  isOpen,
  sessionTitle,
  password,
  onClose
}: SessionPasswordDisplayModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-lg p-8 max-w-md w-full mx-4 border border-neutral-700 shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Session Created!</h2>
          <p className="text-neutral-400 mt-2">الحصة تم إنشاؤها بنجاح</p>
        </div>

        <div className="bg-neutral-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-400 mb-2">Session Title</p>
          <p className="text-white font-semibold mb-4">{sessionTitle}</p>

          <p className="text-sm text-neutral-400 mb-2">Session Password</p>
          <div className="bg-neutral-900 border-2 border-blue-500 rounded-lg p-4 flex items-center justify-between">
            <p className="text-4xl font-bold text-blue-400 tracking-widest">{password}</p>
            <button
              onClick={handleCopy}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              title="Copy password"
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-500 text-center mb-6">
          Share this password with your students at the time of the session for them to join.
          <br />
          شارك هذه الكلمة مع طلابك وقت الحصة لكي يتمكنوا من الانضمام
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Got it! / حسناً
        </button>
      </div>
    </div>
  )
}
