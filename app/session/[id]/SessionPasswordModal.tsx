'use client'

import { useState } from 'react'
import { AlertCircle, Lock } from 'lucide-react'

interface SessionPasswordModalProps {
  sessionId: string
  sessionTitle: string
  onPasswordSubmit: (password: string) => void
}

export default function SessionPasswordModal({
  sessionId,
  sessionTitle,
  onPasswordSubmit
}: SessionPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter the password')
      return
    }
    onPasswordSubmit(password)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-lg p-8 max-w-md w-full mx-4 border border-neutral-700 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-500/20 p-3 rounded-full">
            <Lock className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Session Password Required
        </h2>
        <p className="text-neutral-400 text-center mb-6 text-sm">
          كلمة مرور الحصة مطلوبة
        </p>

        <p className="text-neutral-300 text-center mb-6 font-medium">
          {sessionTitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              Enter Session Password
            </label>
            <input
              id="password"
              type="text"
              placeholder="Enter 4-digit password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              maxLength={4}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-bold"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-neutral-500 text-center mt-6">
          This password was provided at the beginning of the session.
        </p>
      </div>
    </div>
  )
}
