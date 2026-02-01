'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface SessionEditModalProps {
  isOpen: boolean
  session: {
    id: string
    title: string
    startTime: string
    endTime: string
    status?: string
    sessionPassword?: string
    externalLink?: string
    externalLinkType?: string
  }
  onClose: () => void
  onSave: (data: { 
    title: string; 
    startTime: string; 
    endTime: string;
    status?: string;
    sessionPassword?: string;
    externalLink?: string;
    externalLinkType?: string;
  }) => Promise<void>
}

export default function SessionEditModal({
  isOpen,
  session,
  onClose,
  onSave
}: SessionEditModalProps) {
  const [title, setTitle] = useState(session.title)
  const [startTime, setStartTime] = useState(new Date(session.startTime).toISOString().slice(0, 16))
  const [endTime, setEndTime] = useState(new Date(session.endTime).toISOString().slice(0, 16))
  const [sessionPassword, setSessionPassword] = useState(session.sessionPassword || '')
  const [externalLink, setExternalLink] = useState(session.externalLink || '')
  const [externalLinkType, setExternalLinkType] = useState(session.externalLinkType || 'ZOOM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allowEarlyJoin, setAllowEarlyJoin] = useState(session.status === 'ACTIVE')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startTime || !endTime) {
      setError('Please fill all fields')
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('Start time must be before end time')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onSave({
        title: title.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        sessionPassword: sessionPassword.trim() || undefined,
        externalLink: externalLink.trim() || undefined,
        externalLinkType: externalLink ? externalLinkType : undefined,
        status: allowEarlyJoin ? 'ACTIVE' : 'SCHEDULED'
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 border border-neutral-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Edit Session / تعديل الحصة</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Session Title / العنوان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="E.g., English Lesson 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-700">
            <h3 className="text-sm font-bold text-[#10B981] mb-4 uppercase tracking-wider">External Link / رابط خارجي</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-800/50 border border-neutral-700 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-white block">
                    Allow Early Join / تفعيل الدخول المبكر
                  </label>
                  <p className="text-[10px] text-neutral-500">
                    يسمح للطلاب بالدخول في أي وقت حتى قبل الموعد
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowEarlyJoin(!allowEarlyJoin)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${allowEarlyJoin ? 'bg-[#10B981]' : 'bg-neutral-700'}`}
                >
                  <span
                    className={`${allowEarlyJoin ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Platform / المنصة
                </label>
                <select
                  value={externalLinkType}
                  onChange={(e) => setExternalLinkType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ZOOM">Zoom</option>
                  <option value="GOOGLE_MEET">Google Meet</option>
                  <option value="TEAMS">Microsoft Teams</option>
                  <option value="OTHER">Other / أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Meeting Link / رابط الاجتماع
                </label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://zoom.us/j/..."
                />
                <p className="text-[10px] text-neutral-500 mt-1">ترك الحقل فارغاً سيعيد تفعيل مشغل المنصة الداخلي</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Internal Password / كلمة سر داخلية
            </label>
            <input
              type="text"
              value={sessionPassword}
              onChange={(e) => setSessionPassword(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="Optional"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded transition-colors disabled:opacity-50 font-bold"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
