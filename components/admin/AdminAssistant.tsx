'use client'

import { useState, type FormEvent } from 'react'
import { Bot, Check, LoaderCircle, MessageCircle, Send, X } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import type { AdminAssistantAction } from '@/lib/admin-assistant-contract'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type Proposal = {
  id: string
  action: AdminAssistantAction
  context?: Record<string, string | number | boolean | null>
}

const actionTitles: Record<AdminAssistantAction['type'], [string, string]> = {
  student_profile_update: ['تحديث ملف طالب', 'Update student profile'],
  subscription_create: ['إنشاء اشتراك قيد المراجعة', 'Create pending subscription'],
  subscription_update: ['تحديث حالة اشتراك', 'Update subscription status'],
  session_create: ['إنشاء حصة', 'Create class session'],
  session_transition: ['تحديث حالة الحصة', 'Update class status'],
  attendance_update: ['تحديث الحضور', 'Update attendance'],
  package_create: ['إنشاء باقة', 'Create package'],
  whatsapp_send: ['إرسال رسالة WhatsApp', 'Send WhatsApp message'],
  email_send: ['إرسال بريد إلكتروني', 'Send email'],
}

const fieldTitles: Record<string, [string, string]> = {
  studentId: ['معرّف الطالب', 'Student ID'],
  subscriptionId: ['معرّف الاشتراك', 'Subscription ID'],
  sessionId: ['معرّف الحصة', 'Session ID'],
  userId: ['معرّف المستخدم', 'User ID'],
  conversationId: ['معرّف المحادثة', 'Conversation ID'],
  packageId: ['معرّف الباقة', 'Package ID'],
  name: ['الاسم', 'Name'],
  status: ['الحالة', 'Status'],
  age: ['العمر', 'Age'],
  goal: ['الهدف', 'Goal'],
  subscriptionType: ['نوع الاشتراك', 'Subscription type'],
  assignedTeacherId: ['معرّف المعلم', 'Teacher profile ID'],
  groupId: ['معرّف المجموعة', 'Group ID'],
  capacity: ['السعة', 'Capacity'],
  startDate: ['تاريخ البداية', 'Start date'],
  endDate: ['تاريخ النهاية', 'End date'],
  adminNotes: ['ملاحظات الإدارة', 'Admin notes'],
  title: ['العنوان', 'Title'],
  titleAr: ['العنوان بالعربية', 'Arabic title'],
  teacherProfileId: ['معرّف ملف المعلم', 'Teacher profile ID'],
  groupScheduleId: ['معرّف جدول المجموعة', 'Group schedule ID'],
  levelId: ['معرّف المستوى', 'Level ID'],
  stageId: ['معرّف المرحلة', 'Stage ID'],
  startTime: ['وقت البداية', 'Start time'],
  endTime: ['وقت النهاية', 'End time'],
  participantIds: ['معرّفات المشاركين', 'Participant IDs'],
  joinedAt: ['وقت الحضور', 'Join time'],
  leftAt: ['وقت المغادرة', 'Leave time'],
  note: ['ملاحظة الحضور', 'Attendance note'],
  description: ['الوصف', 'Description'],
  descriptionAr: ['الوصف بالعربية', 'Arabic description'],
  durationDays: ['مدة الباقة بالأيام', 'Duration in days'],
  lessonsCount: ['عدد الدروس', 'Lesson count'],
  price: ['السعر', 'Price'],
  discountPrice: ['سعر الخصم', 'Discount price'],
  features: ['المزايا', 'Features'],
  isActive: ['مفعّلة', 'Active'],
  body: ['نص الرسالة', 'Message'],
  to: ['إلى', 'To'],
  subject: ['الموضوع', 'Subject'],
  message: ['محتوى البريد', 'Email body'],
  recordLabel: ['السجل', 'Record'],
  studentName: ['الطالب', 'Student'],
  packageName: ['الباقة', 'Package'],
  packagePrice: ['السعر المعروض', 'Listed price'],
  packageActive: ['الباقة مفعّلة', 'Package active'],
  resultingStatus: ['الحالة بعد الإنشاء', 'Status after creation'],
  currentStatus: ['الحالة الحالية', 'Current status'],
  teacherName: ['المعلم', 'Teacher'],
  teacherActive: ['حساب المعلم نشط', 'Teacher account active'],
  groupName: ['المجموعة', 'Group'],
  groupStatus: ['حالة المجموعة', 'Group status'],
  participants: ['المشاركون', 'Participants'],
  sessionTitle: ['الحصة', 'Session'],
  participantStatus: ['حالة المشاركة', 'Participant status'],
  recipientName: ['المستلم', 'Recipient'],
  recipientPhone: ['رقم المستلم', 'Recipient number'],
}

function previewValue(value: unknown, language: 'ar' | 'en') {
  if (value === null) return localeText(language, 'لا تغيير', 'No change')
  if (typeof value === 'boolean') return value
    ? localeText(language, 'نعم', 'Yes')
    : localeText(language, 'لا', 'No')
  if (Array.isArray(value)) return value.length ? value.join('، ') : localeText(language, 'لا يوجد', 'None')
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    }
  }
  return String(value)
}

function getActionRequest(proposal: Proposal) {
  const action = proposal.action
  const body = { ...action } as Record<string, unknown>
  delete body.type

  switch (action.type) {
    case 'student_profile_update':
      return { url: `/api/admin/people/students/${encodeURIComponent(action.studentId)}`, method: 'PATCH', body }
    case 'subscription_create':
      return { url: '/api/admin/commerce/subscriptions', method: 'POST', body }
    case 'subscription_update':
      return { url: `/api/admin/commerce/subscriptions/${encodeURIComponent(action.subscriptionId)}`, method: 'PATCH', body }
    case 'session_create':
      return { url: '/api/admin/classes/sessions', method: 'POST', body }
    case 'session_transition':
      return {
        url: `/api/admin/classes/sessions/${encodeURIComponent(action.sessionId)}/transition`,
        method: 'POST',
        body: { status: action.status },
      }
    case 'attendance_update':
      return {
        url: `/api/admin/classes/sessions/${encodeURIComponent(action.sessionId)}/attendance`,
        method: 'POST',
        body: {
          userId: action.userId,
          status: action.status,
          joinedAt: action.joinedAt,
          leftAt: action.leftAt,
          note: action.note,
        },
      }
    case 'package_create':
      return { url: '/api/admin/commerce/packages', method: 'POST', body }
    case 'whatsapp_send':
      return {
        url: `/api/admin/whatsapp/conversations/${encodeURIComponent(action.conversationId)}/messages`,
        method: 'POST',
        body: { body: action.body, idempotencyKey: `admin-assistant:${proposal.id}` },
      }
    case 'email_send':
      return { url: '/api/admin/send-email', method: 'POST', body }
  }
}

export default function AdminAssistant() {
  const { language } = useTheme()
  const isArabic = language === 'ar'
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content || busy || proposal) return
    const nextMessages = [...messages.slice(-14), { role: 'user' as const, content }]
    setMessages(nextMessages)
    setDraft('')
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ language, messages: nextMessages }),
      })
      const result: unknown = await response.json().catch(() => null)
      const data = result && typeof result === 'object'
        ? result as { reply?: unknown; error?: unknown; proposal?: unknown }
        : null
      if (!response.ok || typeof data?.reply !== 'string') {
        throw new Error(typeof data?.error === 'string'
          ? data.error
          : t('تعذر الاتصال بالمساعد. حاول مرة أخرى.', 'The assistant is unavailable. Please try again.'))
      }
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
      if (data.proposal && typeof data.proposal === 'object') {
        const candidate = data.proposal as { id?: unknown; action?: unknown }
        if (typeof candidate.id === 'string' && candidate.action && typeof candidate.action === 'object') {
          setProposal(candidate as Proposal)
        }
      }
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : t('تعذر الاتصال بالمساعد. حاول مرة أخرى.', 'The assistant is unavailable. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const confirmAction = async () => {
    if (!proposal || busy) return
    setBusy(true)
    setError('')
    try {
      const request = getActionRequest(proposal)
      const response = await fetch(request.url, {
        method: request.method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(request.body),
      })
      const result: unknown = await response.json().catch(() => null)
      const data = result && typeof result === 'object'
        ? result as { error?: unknown; message?: unknown }
        : null
      if (!response.ok) {
        const serverMessage = typeof data?.message === 'string'
          ? data.message
          : typeof data?.error === 'string'
            ? data.error
            : null
        throw new Error(serverMessage || t('رفض النظام هذا الإجراء. راجع البيانات وحاول من لوحة الإدارة.', 'The system rejected this action. Review the details and try from the admin dashboard.'))
      }
      setProposal(null)
      setMessages((current) => [...current, {
        role: 'assistant',
        content: t('تم تنفيذ الإجراء بنجاح.', 'The action completed successfully.'),
      }])
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : t('تعذر تنفيذ الإجراء. حاول مرة أخرى.', 'The action could not be completed. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const cancelAction = () => {
    if (busy) return
    setProposal(null)
    setMessages((current) => [...current, {
      role: 'assistant',
      content: t('أُلغِي الإجراء ولم تُرسل أي تغييرات.', 'The action was cancelled. No changes were sent.'),
    }])
  }

  return (
    <>
      {open && (
        <section
          aria-label={t('مساعد الإدارة', 'Admin assistant')}
          className="fixed inset-x-3 bottom-3 z-[60] flex h-[min(78dvh,680px)] flex-col border border-[#dce4dc] bg-white shadow-lg sm:inset-x-auto sm:end-5 sm:bottom-5 sm:w-[410px]"
          dir={isArabic ? 'rtl' : 'ltr'}
          role="dialog"
        >
          <header className="flex min-h-14 items-center justify-between border-b border-[#e5eae5] px-4">
            <div className="flex items-center gap-2 text-[#26332e]">
              <Bot size={18} aria-hidden="true" />
              <h2 className="text-sm font-bold">{t('مساعد الإدارة', 'Admin assistant')}</h2>
            </div>
            <button
              type="button"
              aria-label={t('إغلاق المساعد', 'Close assistant')}
              onClick={() => setOpen(false)}
              className="grid h-11 w-11 place-items-center text-[#68756e] hover:bg-[#f3f6f3]"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.length === 0 && (
              <p className="border border-[#e5eae5] bg-[#f7f9f7] p-3 text-sm leading-6 text-[#58675d]">
                {t(
                  'اسأل عن إجراءات النظام أو اطلب إجراءً إدارياً. سيطلب المساعد تأكيدك قبل أي تغيير أو إرسال.',
                  'Ask about system procedures or request an admin action. The assistant asks for confirmation before any change or send.',
                )}
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`max-w-[92%] whitespace-pre-wrap break-words px-3 py-2 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'ms-auto bg-[#24714f] text-white'
                    : 'me-auto border border-[#e5eae5] bg-[#f7f9f7] text-[#344239]'
                }`}
              >
                {message.content}
              </div>
            ))}

            {proposal && (
              <div className="border border-[#d7e5da] bg-[#f8fbf8] p-3">
                <h3 className="text-sm font-bold text-[#2b4637]">
                  {t(...actionTitles[proposal.action.type])}
                </h3>
                <dl className="mt-2 space-y-2 text-xs leading-5">
                  {Object.entries(proposal.context || {}).map(([key, value]) => (
                    <div key={`context-${key}`} className="border-t border-[#e5ece6] pt-2">
                      <dt className="font-semibold text-[#5b6b60]">
                        {fieldTitles[key] ? t(...fieldTitles[key]) : key}
                      </dt>
                      <dd className="mt-0.5 break-words text-[#344239]">
                        {previewValue(value, language)}
                      </dd>
                    </div>
                  ))}
                  {Object.entries(proposal.action)
                    .filter(([key]) => key !== 'type')
                    .map(([key, value]) => (
                      <div key={key} className="border-t border-[#e5ece6] pt-2">
                        <dt className="font-semibold text-[#5b6b60]">
                          {fieldTitles[key] ? t(...fieldTitles[key]) : key}
                        </dt>
                        <dd className="mt-0.5 break-words text-[#344239]">
                          {previewValue(value, language)}
                        </dd>
                      </div>
                    ))}
                </dl>
                {proposal.action.type === 'subscription_update' && proposal.action.status === 'APPROVED' && (
                  <p className="mt-3 border-s-2 border-[#a27625] bg-[#fbf7ee] px-3 py-2 text-xs leading-5 text-[#6d5424]">
                    {t('تنبيه: اعتماد الاشتراك يضبط حالته كمدفوع في النظام.', 'Warning: approving this subscription marks it as paid in the system.')}
                  </p>
                )}
                {proposal.action.type === 'whatsapp_send' && (
                  <p className="mt-3 text-xs leading-5 text-[#58675d]">
                    {t('ستُضاف الرسالة إلى قائمة الإرسال بعد التأكيد.', 'The message will be queued after confirmation.')}
                  </p>
                )}
                {proposal.action.type === 'email_send' && (
                  <p className="mt-3 text-xs leading-5 text-[#58675d]">
                    {t('سيُرسل البريد إلى العنوان الظاهر أعلاه بعد التأكيد.', 'The email will be sent to the address above after confirmation.')}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void confirmAction()}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-[#24714f] px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {busy
                      ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                      : <Check size={15} aria-hidden="true" />}
                    {t('تأكيد وتنفيذ', 'Confirm and execute')}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={cancelAction}
                    className="min-h-11 border border-[#d7e0d8] px-3 text-xs font-semibold text-[#48574e] disabled:opacity-60"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                </div>
              </div>
            )}
            {error && (
              <p className="border border-[#eed7d4] bg-[#fff8f6] px-3 py-2 text-sm leading-6 text-[#874039]" role="alert">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={(event) => void sendMessage(event)} className="border-t border-[#e5eae5] p-3">
            <label htmlFor="admin-assistant-message" className="sr-only">
              {t('اكتب سؤالك', 'Write your question')}
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="admin-assistant-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                maxLength={4000}
                rows={2}
                disabled={busy || Boolean(proposal)}
                placeholder={t('اكتب سؤالاً أو إجراءً مطلوباً', 'Ask a question or request an action')}
                className="min-h-11 flex-1 resize-y border border-[#dce4dc] px-3 py-2 text-sm leading-5 outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15 disabled:bg-[#f4f6f4]"
              />
              <button
                type="submit"
                disabled={busy || Boolean(proposal) || !draft.trim()}
                aria-label={t('إرسال', 'Send')}
                className="grid min-h-11 min-w-11 place-items-center bg-[#24714f] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                  : <Send size={16} aria-hidden="true" />}
              </button>
            </div>
          </form>
        </section>
      )}

      {!open && (
        <button
          type="button"
          aria-label={t('فتح مساعد الإدارة', 'Open admin assistant')}
          onClick={() => setOpen(true)}
          className="fixed bottom-4 end-4 z-[60] inline-flex min-h-12 items-center gap-2 border border-[#d3e0d5] bg-white px-4 text-sm font-semibold text-[#285b40] shadow-md hover:bg-[#f5f8f5]"
        >
          <MessageCircle size={17} aria-hidden="true" />
          {t('مساعد الإدارة', 'Admin assistant')}
        </button>
      )}
    </>
  )
}