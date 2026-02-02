'use client'

import { useState, useEffect } from 'react'
import { Send, Mail, User, Users, CheckCircle, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Recipient {
  id: string
  name: string
  email: string
  role: string
}

export default function EmailTab() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [emailType, setEmailType] = useState<'custom' | 'select'>('custom')
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    fetchRecipients()
  }, [])

  async function fetchRecipients() {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setRecipients(data.filter((u: Recipient) => u.email))
      }
    } catch (error) {
      console.error('Error fetching recipients:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    
    const targetEmail = emailType === 'custom' ? customEmail : selectedRecipient
    
    if (!targetEmail || !subject || !message) {
      setStatus({ type: 'error', message: 'يرجى ملء جميع الحقول المطلوبة' })
      return
    }

    setSending(true)
    setStatus(null)

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject,
          message
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'تم إرسال البريد الإلكتروني بنجاح!' })
        setCustomEmail('')
        setSelectedRecipient('')
        setSubject('')
        setMessage('')
      } else {
        setStatus({ type: 'error', message: data.error || 'فشل في إرسال البريد الإلكتروني' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'حدث خطأ أثناء إرسال البريد الإلكتروني' })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#10B981]">
        Direct Email / البريد المباشر
      </h2>

      <Card variant="elevated" className="max-w-2xl">
        <form onSubmit={handleSendEmail} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع المستلم / Recipient Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEmailType('custom')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  emailType === 'custom'
                    ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className="h-5 w-5" />
                <span>بريد مخصص</span>
              </button>
              <button
                type="button"
                onClick={() => setEmailType('select')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  emailType === 'select'
                    ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>اختيار مستخدم</span>
              </button>
            </div>
          </div>

          {emailType === 'custom' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني / Email Address
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                dir="ltr"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر المستلم / Select Recipient
              </label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                <option value="">-- اختر مستخدم --</option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.email}>
                    {recipient.name} ({recipient.email}) - {recipient.role === 'STUDENT' ? 'طالب' : recipient.role === 'TEACHER' ? 'معلم' : 'مسؤول'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الموضوع / Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع الرسالة"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرسالة / Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
              dir="rtl"
            />
          </div>

          {status && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={sending}
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>جاري الإرسال...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                <span>إرسال البريد / Send Email</span>
              </div>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
