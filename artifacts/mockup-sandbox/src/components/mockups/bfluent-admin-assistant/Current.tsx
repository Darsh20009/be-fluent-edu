'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import './_group.css'
import { BookOpenText, Bot, Check, LoaderCircle, MessageCircle, Send } from 'lucide-react'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type AssistantActionType =
  | 'student_profile_update'
  | 'subscription_create'
  | 'subscription_update'
  | 'session_create'
  | 'session_transition'
  | 'attendance_update'
  | 'package_create'
  | 'whatsapp_send'
  | 'email_send'
type AssistantAction = { type: AssistantActionType; [key: string]: unknown }
type Proposal = {
  id: string
  action: AssistantAction
  context?: Record<string, string | number | boolean | null>
}

const actionTitles: Record<AssistantActionType, [string, string]> = {
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

const localeText = (language: 'ar' | 'en', arabic: string, english: string) =>
  language === 'ar' ? arabic : english

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

export function Current() {
  const [language] = useState<'ar' | 'en'>('ar')
  const isArabic = language === 'ar'
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [activePanel, setActivePanel] = useState<'chat' | 'knowledge'>('chat')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [knowledgeDraft, setKnowledgeDraft] = useState('مواعيد خدمة العملاء: من الأحد إلى الخميس، ٩:٠٠ صباحاً حتى ٥:٠٠ مساءً بتوقيت الرياض.\n\nسياسة الحصص: يمكن للمعلم إضافة ملاحظات تعلم بنّاءة بعد كل حصة. عند وجود مشكلة في الجدول، راجع تفاصيل الحصة قبل اقتراح تغيير.\n\nالاشتراكات: الطلبات الجديدة تبقى قيد المراجعة إلى أن يتحقق فريق الإدارة من الباقة والجدول المناسبين.')
  const [knowledgeState, setKnowledgeState] = useState<'loading' | 'ready' | 'error'>('ready')
  const [knowledgeSaving, setKnowledgeSaving] = useState(false)
  const [knowledgeFeedback, setKnowledgeFeedback] = useState<'saved' | 'error' | ''>('')
  const [knowledgeUpdatedAt, setKnowledgeUpdatedAt] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

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
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      const wantsAction = /إنشاء|تحديث|إرسال|اشتراك|create|update|send|message/i.test(content)
      const reply = wantsAction
        ? t('حضّرت اقتراحاً تجريبياً لمراجعته. لن يتغير أي سجل؛ يمكنك التأكيد محلياً أو الإلغاء.', 'I prepared a demo proposal for review. No records will change; confirm locally or cancel.')
        : /حصص|جلسات|classes|sessions/i.test(content)
          ? t('لديك حصتان تجريبيتان قادمتان: محادثة إنجليزية للمبتدئين مع سارة، ومراجعة مفردات مع عمر. هذه بيانات عرض توضيحي.', 'Two upcoming demo classes: beginner conversation with Sara, and a vocabulary review with Omar. This is sample content.')
          : t('يسعدني المساعدة. أستطيع تلخيص الحصص التجريبية أو شرح السياسات أو إعداد اقتراح لمراجعته قبل التنفيذ.', 'Happy to help. I can summarize sample classes, explain policies, or prepare a proposal for your review.')
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
      if (wantsAction) {
        setProposal({
          id: 'demo-proposal-01',
          action: { type: 'student_profile_update', studentId: 'DEMO-STU-018', name: 'ليان مراد' },
          context: { recordLabel: 'ملف تجريبي', studentName: 'ليان مراد', currentStatus: 'ACTIVE' },
        })
      }
    } finally {
      setBusy(false)
    }
  }

  const confirmAction = async () => {
    if (!proposal || busy) return
    setBusy(true)
    setError('')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      setProposal(null)
      setMessages((current) => [...current, {
        role: 'assistant',
        content: t('تم تأكيد الاقتراح في هذا العرض التوضيحي فقط؛ لم تُرسل أي تغييرات إلى النظام.', 'Proposal confirmed in this local demo only; no changes were sent to the system.'),
      }])
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

  const saveKnowledge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (knowledgeSaving) return
    setKnowledgeSaving(true)
    setKnowledgeFeedback('')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      setKnowledgeDraft(knowledgeDraft.trim())
      setKnowledgeUpdatedAt(new Date().toISOString())
      setKnowledgeState('ready')
      setKnowledgeFeedback('saved')
    } catch {
      setKnowledgeFeedback('error')
    } finally {
      setKnowledgeSaving(false)
    }
  }

  const retryKnowledgeLoad = async () => {
    setKnowledgeState('loading')
    setKnowledgeFeedback('')
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    setKnowledgeState('ready')
    setKnowledgeFeedback('')
  }

  return (
    <div className="bfluent-current-admin min-h-screen bg-[#f5f7f4] p-4 text-[#26332e] sm:p-6">
    <section className="space-y-5" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="flex flex-wrap items-center gap-4 rounded-xl border border-[#dce5de] bg-white p-4 sm:p-5">
        <img
          src="/__mockup/images/be-fluent-mark-2026.png"
          alt=""
          width={52}
          height={52}
          className="h-12 w-12 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#718078]">Be Fluent</p>
          <h1 className="mt-1 text-xl font-bold text-[#26332e] sm:text-2xl">
            {t('مساعد Be Fluent', 'Be Fluent assistant')}
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#68756e]">
            {t('مساعد الإدارة وإجاباته مستندة إلى بيانات النظام والمعرفة التي تضيفها هنا.', 'An admin assistant grounded in system records and the reference knowledge you add here.')}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto" role="tablist" aria-label={t('أقسام المساعد', 'Assistant sections')}>
          <button
            type="button"
            role="tab"
            aria-selected={activePanel === 'chat'}
            onClick={() => setActivePanel('chat')}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold sm:flex-none ${
              activePanel === 'chat' ? 'bg-[#24714f] text-white' : 'border border-[#dce5de] text-[#526158] hover:bg-[#f5f8f5]'
            }`}
          >
            <MessageCircle size={16} aria-hidden="true" />
            {t('المحادثة', 'Conversation')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePanel === 'knowledge'}
            onClick={() => setActivePanel('knowledge')}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold sm:flex-none ${
              activePanel === 'knowledge' ? 'bg-[#24714f] text-white' : 'border border-[#dce5de] text-[#526158] hover:bg-[#f5f8f5]'
            }`}
          >
            <BookOpenText size={16} aria-hidden="true" />
            {t('قاعدة المعرفة', 'Knowledge base')}
          </button>
        </div>
      </header>

      {activePanel === 'knowledge' ? (
        <section className="rounded-xl border border-[#dce5de] bg-white p-4 sm:p-6" role="tabpanel">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-[#26332e]">{t('أضف معلومات Be Fluent', 'Add Be Fluent reference information')}</h2>
            <p className="mt-2 text-sm leading-6 text-[#68756e]">
              {t('أدخل إجراءات النظام وسياساته والمعلومات التي يحتاجها المساعد. تُحفظ التغييرات وتستخدم في المحادثات الجديدة.', 'Add system procedures, policies, and facts the assistant should use. Saved content is included in new conversations.')}
            </p>
          </div>
          {knowledgeState === 'error' && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#eed7d4] bg-[#fff8f6] p-3 text-sm text-[#874039]" role="alert">
              <span>{t('تعذر تحميل قاعدة المعرفة. يمكنك إعادة المحاولة قبل الحفظ.', 'The knowledge base could not be loaded. Retry before saving to avoid overwriting existing content.')}</span>
              <button type="button" onClick={() => void retryKnowledgeLoad()} className="min-h-10 rounded-lg border border-[#d7bdb8] px-3 font-semibold">
                {t('إعادة المحاولة', 'Retry')}
              </button>
            </div>
          )}
          <form onSubmit={(event) => void saveKnowledge(event)} className="mt-5 max-w-4xl space-y-3">
            <label htmlFor="assistant-knowledge-content" className="block text-sm font-semibold text-[#344239]">
              {t('المعلومات المرجعية', 'Reference information')}
            </label>
            <textarea
              id="assistant-knowledge-content"
              value={knowledgeDraft}
              onChange={(event) => { setKnowledgeDraft(event.target.value); setKnowledgeFeedback('') }}
              maxLength={20000}
              rows={14}
              disabled={knowledgeState !== 'ready' || knowledgeSaving}
              placeholder={t('اكتب هنا خطوات العمل والسياسات والإجابات المعتمدة…', 'Enter approved procedures, policies, and answers here…')}
              className="min-h-[280px] w-full resize-y rounded-lg border border-[#dce4dc] bg-white px-4 py-3 text-sm leading-7 text-[#344239] outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15 disabled:bg-[#f4f6f4]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs tabular-nums text-[#718078]">{knowledgeDraft.length.toLocaleString(language === 'ar' ? 'ar' : 'en')} / 20,000</span>
              <button
                type="submit"
                disabled={knowledgeState !== 'ready' || knowledgeSaving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#19583f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {knowledgeSaving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                {knowledgeSaving ? t('جارٍ الحفظ…', 'Saving…') : t('حفظ المعرفة', 'Save knowledge')}
              </button>
            </div>
            {knowledgeFeedback === 'saved' && (
              <p className="text-sm text-[#246448]" role="status">
                {t('تم حفظ قاعدة المعرفة. ستظهر في طلبات المساعد الجديدة.', 'Knowledge saved. It will be used in new assistant requests.')}
                {knowledgeUpdatedAt && <span className="ms-2 text-xs text-[#718078]">{new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(knowledgeUpdatedAt))}</span>}
              </p>
            )}
            {knowledgeFeedback === 'error' && (
              <p className="text-sm text-[#874039]" role="alert">{t('تعذر حفظ المعرفة. لم تُحفظ التغييرات؛ حاول مجدداً.', 'The knowledge could not be saved. Your changes were not saved; please try again.')}</p>
            )}
            <p className="text-xs leading-5 text-[#718078]">
              {t('لا تضع كلمات مرور أو مفاتيح أو بيانات سرية في هذا الحقل.', 'Do not add passwords, keys, or secret credentials here.')}
            </p>
          </form>
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]" role="tabpanel">
          <section className="flex min-h-[620px] flex-col overflow-hidden rounded-xl border border-[#dce5de] bg-white">
            <header className="flex min-h-[62px] items-center gap-3 border-b border-[#e8ece8] px-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf5ef] text-[#24714f]">
                <Bot size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#26332e]">{t('محادثة الإدارة', 'Admin conversation')}</h2>
                <p className="mt-0.5 text-xs text-[#718078]">{t('الإجراءات تحتاج إلى مراجعتك وتأكيدك', 'Actions require your review and confirmation')}</p>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" aria-live="polite">
              {messages.length === 0 && (
                <div className="mx-auto mt-8 max-w-xl text-center">
                    <img
                      src="/__mockup/images/be-fluent-mark-2026.png"
                    alt=""
                    width={64}
                    height={64}
                    className="mx-auto h-14 w-14 object-contain"
                  />
                  <h3 className="mt-4 text-lg font-bold text-[#26332e]">{t('كيف أساعدك في إدارة Be Fluent؟', 'How can I help with Be Fluent?')}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#68756e]">
                    {t('أتابع سياق المحادثة وأستند إلى سجلات النظام وقاعدة المعرفة. لن أنفذ أي تغيير أو إرسال دون تأكيدك.', 'I follow the conversation and use system records and the knowledge base. I will not make a change or send a message without your confirmation.')}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {[t('ما الطلبات التي تحتاج مراجعة؟', 'Which requests need review?'), t('لخّص الحصص القادمة', 'Summarize upcoming classes'), t('اشرح إجراءً من قاعدة المعرفة', 'Explain a knowledge-base procedure')].map((prompt) => (
                      <button key={prompt} type="button" onClick={() => setDraft(prompt)} className="min-h-10 rounded-full border border-[#dce5de] px-3 text-xs font-semibold text-[#526158] hover:bg-[#f5f8f5]">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <article key={`${index}-${message.role}`} className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.role === 'assistant' ? (
                    <img src="/__mockup/images/be-fluent-mark-2026.png" alt="" width={30} height={30} className="mt-5 h-[30px] w-[30px] shrink-0 rounded-full object-contain" />
                  ) : (
                    <span className="mt-5 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[#e7efe9] text-xs font-bold text-[#315f49]" aria-hidden="true">
                      {t('أنت', 'You').slice(0, 1)}
                    </span>
                  )}
                  <div className={`max-w-[88%] sm:max-w-[82%] ${message.role === 'user' ? 'text-end' : ''}`}>
                    <p className="mb-1 text-[11px] font-semibold text-[#718078]">
                      {message.role === 'user' ? t('أنت', 'You') : 'Be Fluent'}
                    </p>
                    <div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 ${
                      message.role === 'user'
                        ? 'rounded-se-sm bg-[#24714f] text-white'
                        : 'rounded-ss-sm border border-[#e5eae5] bg-[#f7f9f7] text-[#344239]'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </article>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-sm text-[#68756e]" role="status">
                  <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  {t('أراجع سؤالك وسياق المحادثة…', 'Reviewing your question and conversation…')}
                </div>
              )}

              {proposal && (
                <div className="ms-8 rounded-xl border border-[#d7e5da] bg-[#f8fbf8] p-4 sm:ms-11">
                  <h3 className="text-sm font-bold text-[#2b4637]">{t(...actionTitles[proposal.action.type])}</h3>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    {Object.entries(proposal.context || {}).map(([key, value]) => (
                      <div key={`context-${key}`} className="rounded-lg border border-[#e5ece6] bg-white p-3 text-xs leading-5">
                        <dt className="font-semibold text-[#5b6b60]">{fieldTitles[key] ? t(...fieldTitles[key]) : key}</dt>
                        <dd className="mt-1 break-words text-[#344239]">{previewValue(value, language)}</dd>
                      </div>
                    ))}
                    {Object.entries(proposal.action).filter(([key]) => key !== 'type').map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-[#e5ece6] bg-white p-3 text-xs leading-5">
                        <dt className="font-semibold text-[#5b6b60]">{fieldTitles[key] ? t(...fieldTitles[key]) : key}</dt>
                        <dd className="mt-1 break-words text-[#344239]">{previewValue(value, language)}</dd>
                      </div>
                    ))}
                  </dl>
                  {proposal.action.type === 'subscription_update' && proposal.action.status === 'APPROVED' && (
                    <p className="mt-3 rounded-lg border-s-2 border-[#a27625] bg-[#fbf7ee] px-3 py-2 text-xs leading-5 text-[#6d5424]">
                      {t('تنبيه: اعتماد الاشتراك يضبط حالته كمدفوع في النظام.', 'Warning: approving this subscription marks it as paid in the system.')}
                    </p>
                  )}
                  {proposal.action.type === 'whatsapp_send' && <p className="mt-3 text-xs leading-5 text-[#58675d]">{t('ستُضاف الرسالة إلى قائمة الإرسال بعد التأكيد.', 'The message will be queued after confirmation.')}</p>}
                  {proposal.action.type === 'email_send' && <p className="mt-3 text-xs leading-5 text-[#58675d]">{t('سيُرسل البريد إلى العنوان الظاهر أعلاه بعد التأكيد.', 'The email will be sent to the address above after confirmation.')}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" disabled={busy} onClick={() => void confirmAction()} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#24714f] px-4 text-sm font-semibold text-white disabled:opacity-60">
                      {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                      {t('تأكيد وتنفيذ', 'Confirm and execute')}
                    </button>
                    <button type="button" disabled={busy} onClick={cancelAction} className="min-h-11 rounded-lg border border-[#d7e0d8] px-4 text-sm font-semibold text-[#48574e] disabled:opacity-60">
                      {t('إلغاء', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}
              {error && <p className="rounded-lg border border-[#eed7d4] bg-[#fff8f6] px-4 py-3 text-sm leading-6 text-[#874039]" role="alert">{error}</p>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={(event) => void sendMessage(event)} className="border-t border-[#e5eae5] p-3 sm:p-4">
              <label htmlFor="admin-assistant-message" className="sr-only">{t('اكتب سؤالك', 'Write your question')}</label>
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
                  placeholder={t('اكتب سؤالك أو الخطوة التي تريد فهمها…', 'Ask a question or describe the next step you need…')}
                  className="min-h-12 flex-1 resize-y rounded-xl border border-[#dce4dc] px-4 py-3 text-sm leading-6 outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15 disabled:bg-[#f4f6f4]"
                />
                <button type="submit" disabled={busy || Boolean(proposal) || !draft.trim()} aria-label={t('إرسال', 'Send')} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#24714f] text-white hover:bg-[#19583f] disabled:cursor-not-allowed disabled:opacity-50">
                  {busy ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[#718078]">{t('Enter للإرسال · Shift + Enter لسطر جديد. لن يُرسل أي شيء دون تأكيدك.', 'Enter to send · Shift + Enter for a new line. Nothing is sent without your confirmation.')}</p>
            </form>
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-[#dce5de] bg-white p-4">
              <h2 className="text-sm font-bold text-[#26332e]">{t('كيف يساعدك؟', 'What can it do?')}</h2>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[#5c6961]">
                <li>{t('البحث في سجلات الطلاب والحصص والاشتراكات.', 'Search student, class, and subscription records.')}</li>
                <li>{t('الشرح بالرجوع إلى قاعدة المعرفة التي تضيفها.', 'Answer using the knowledge base you maintain.')}</li>
                <li>{t('اقتراح إجراء ومراجعته قبل التنفيذ.', 'Prepare an action for your review before execution.')}</li>
              </ul>
            </section>
            <section className="rounded-xl border border-[#dce5de] bg-[#f7f9f7] p-4">
              <h2 className="text-sm font-bold text-[#26332e]">{t('مراجعة قبل التنفيذ', 'Review before action')}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5c6961]">
                {t('تظهر تفاصيل الإجراء هنا. راجع المستلم والبيانات ثم أكد أو ألغِ. لا تُرسل الرسائل ولا تُحدّث السجلات قبل التأكيد.', 'Action details appear in the conversation. Review the recipient and data, then confirm or cancel. Messages and records are not changed before confirmation.')}
              </p>
            </section>
          </aside>
        </div>
      )}
    </section>
    </div>
  )
}