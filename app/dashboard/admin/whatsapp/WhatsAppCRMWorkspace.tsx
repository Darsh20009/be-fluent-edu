'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import pageStyles from '@/app/phase4/phase4.module.css'
import styles from './WhatsAppCRMWorkspace.module.css'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

type Account = {
  id: string
  phoneNumber: string
  provider: string
  status: string
  authPersistenceStatus: string
  isOtpSender?: boolean
}

type Contact = {
  id: string
  accountId: string
  phoneNumber?: string
  displayName?: string | null
  status?: string
}

type Message = {
  id: string
  body: string
  direction: string
  deliveryStatus: string
}

type Conversation = {
  id: string
  unreadCount?: number
  status: string
  messages?: Array<{ body?: string | null }>
  contact?: {
    displayName?: string | null
    normalizedPhone?: string | null
  }
}

type ProviderStatus = {
  status: string
  reason?: string
}

type QueueSummary = {
  counts?: { pending?: number; failed?: number; sent?: number }
  pacingMs?: number
  maxAttempts?: number
}
type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'database'
type RequestError = Error & { code?: string; status?: number }

async function api<T = Record<string, unknown>>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  })
  const data = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) {
    const nestedError = data.error
    const apiError = nestedError && typeof nestedError === 'object'
      ? nestedError as Record<string, unknown>
      : data
    const message = typeof apiError.message === 'string'
      ? apiError.message
      : 'REQUEST_FAILED'
    throw Object.assign(
      new Error(message),
      {
        code: typeof apiError.code === 'string' ? apiError.code : 'REQUEST_FAILED',
        status: response.status,
      },
    ) as RequestError
  }
  return data as T
}

function errorMessage(error: unknown, language: 'ar' | 'en') {
  const t = (ar: string, en: string) => localeText(language, ar, en)
  if (!(error instanceof Error)) return t('تعذّر إكمال الطلب. حاول مرة أخرى.', 'The request could not be completed. Please try again.')
  const code = (error as RequestError).code
  const translated: Record<string, string> = {
    ACCOUNT_NOT_CONNECTED: t('اربط الرقم أولًا قبل اختياره لاستقبال رموز التحقق.', 'Connect the number before selecting it to receive verification codes.'),
    CONNECT_FAILED: t('تعذّر بدء اتصال واتساب. راجع حالة المزوّد ثم حاول مرة أخرى.', 'Could not start the WhatsApp connection. Check the provider status and try again.'),
    DATABASE_UNAVAILABLE: t('قاعدة البيانات غير متاحة حاليًا. لم يتم حفظ أي تغيير.', 'The database is currently unavailable. No changes were saved.'),
    LOGOUT_FAILED: t('تعذّر فصل الرقم. حاول مرة أخرى.', 'Could not disconnect the number. Please try again.'),
    PROVIDER_UNAVAILABLE: t('مزوّد واتساب غير جاهز. تحقّق من إعداد Baileys وحفظ الجلسة.', 'The WhatsApp provider is not ready. Check the Baileys and session persistence configuration.'),
    RECONNECT_LIMIT: t('وصل الرقم إلى حد محاولات إعادة الربط. افصل الجلسة ثم امسح رمزًا جديدًا.', 'The number reached its reconnection limit. Disconnect the session, then scan a new QR code.'),
    REQUEST_FAILED: t('تعذّر إكمال الطلب. حاول مرة أخرى.', 'The request could not be completed. Please try again.'),
  }
  return (code && translated[code]) || error.message
}

function statusLabel(status: string | undefined, language: 'ar' | 'en') {
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const labels: Record<string, string> = {
    CONNECTED: t('متصل', 'Connected'),
    CONNECTING: t('جارٍ الاتصال', 'Connecting'),
    DISCONNECTED: t('غير مرتبط', 'Disconnected'),
    ERROR: t('تعذّر الاتصال', 'Connection failed'),
    LOGGED_OUT: t('تم فصل الربط', 'Disconnected'),
    PROVIDER_UNAVAILABLE: t('المزوّد غير متاح', 'Provider unavailable'),
    QR_REQUIRED: t('بانتظار مسح الرمز', 'Awaiting QR scan'),
    RECONNECTING: t('جارٍ إعادة الاتصال', 'Reconnecting'),
  }
  return status ? labels[status] || status : t('غير معروف', 'Unknown')
}

function persistenceLabel(status: string | undefined, language: 'ar' | 'en') {
  const t = (ar: string, en: string) => localeText(language, ar, en)
  if (status === 'PERSISTENCE_CONFIGURED') return t('حفظ الجلسة جاهز', 'Session persistence ready')
  if (!status) return t('حالة حفظ الجلسة غير معروفة', 'Session persistence status unknown')
  return t('حفظ الجلسة غير جاهز', 'Session persistence unavailable')
}

function contactStatusLabel(status: string | undefined, language: 'ar' | 'en') {
  if (status === 'ACTIVE') return localeText(language, 'نشطة', 'Active')
  if (status === 'INACTIVE') return localeText(language, 'غير نشطة', 'Inactive')
  return status || ''
}

function deliveryLabel(value: string | undefined, language: 'ar' | 'en') {
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const labels: Record<string, string> = {
    FAILED: t('فشل الإرسال', 'Failed'),
    INBOUND: t('واردة', 'Incoming'),
    OUTBOUND: t('صادرة', 'Outgoing'),
    PENDING: t('بانتظار الإرسال', 'Pending'),
    QUEUED: t('في الطابور', 'Queued'),
    SENT: t('أُرسلت', 'Sent'),
    DELIVERED: t('تم التسليم', 'Delivered'),
  }
  return value ? labels[value] || value : ''
}

const pendingStatuses = new Set(['CONNECTING', 'QR_REQUIRED', 'RECONNECTING'])

export function WhatsAppCRMWorkspace() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsState, setAccountsState] = useState<LoadState>('loading')
  const [accountsError, setAccountsError] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactsState, setContactsState] = useState<LoadState>('loading')
  const [contactsError, setContactsError] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsState, setConversationsState] = useState<LoadState>('loading')
  const [conversationsError, setConversationsError] = useState('')
  const [queue, setQueue] = useState<QueueSummary | null>(null)
  const [queueState, setQueueState] = useState<LoadState>('loading')
  const [queueError, setQueueError] = useState('')
  const [provider, setProvider] = useState<ProviderStatus | null>(null)
  const [providerError, setProviderError] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedConversation, setSelectedConversation] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messageDraft, setMessageDraft] = useState('')
  const [notice, setNotice] = useState('')
  const [busyAccount, setBusyAccount] = useState<string | null>(null)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [qrByAccount, setQrByAccount] = useState<Record<string, string | null>>({})
  const [qrErrors, setQrErrors] = useState<Record<string, string>>({})
  const messageRequestId = useRef(0)

  const refreshAccounts = useCallback(async (quiet = false) => {
    if (!quiet) setAccountsState('loading')
    setAccountsError('')
    try {
      const data = await api<{ items?: Account[] }>('/api/admin/whatsapp/accounts')
      const items = Array.isArray(data.items) ? data.items : []
      setAccounts(items)
      setAccountsState(items.length ? 'ready' : 'empty')
      const pendingIds = new Set(items.filter((item) => pendingStatuses.has(item.status)).map((item) => item.id))
      setQrByAccount((current) => Object.fromEntries(
        Object.entries(current).filter(([id]) => pendingIds.has(id)),
      ))
      setQrErrors((current) => Object.fromEntries(
        Object.entries(current).filter(([id]) => pendingIds.has(id)),
      ))
    } catch (error) {
      const message = errorMessage(error, language)
      setAccountsError(message)
      setAccountsState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [language])

  const refreshContacts = useCallback(async () => {
    setContactsError('')
    try {
      const data = await api<{ items?: Contact[] }>('/api/admin/whatsapp/contacts')
      const items = Array.isArray(data.items) ? data.items : []
      setContacts(items)
      setContactsState(items.length ? 'ready' : 'empty')
    } catch (error) {
      setContactsError(errorMessage(error, language))
      setContactsState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [language])

  const refreshConversations = useCallback(async () => {
    setConversationsError('')
    try {
      const data = await api<{ items?: Conversation[] }>('/api/admin/whatsapp/conversations')
      const items = Array.isArray(data.items) ? data.items : []
      setConversations(items)
      setConversationsState(items.length ? 'ready' : 'empty')
    } catch (error) {
      setConversationsError(errorMessage(error, language))
      setConversationsState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [language])

  const refreshQueue = useCallback(async () => {
    setQueueError('')
    try {
      setQueue(await api<QueueSummary>('/api/admin/whatsapp/queue'))
      setQueueState('ready')
    } catch (error) {
      setQueueError(errorMessage(error, language))
      setQueueState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [language])

  const refreshProvider = useCallback(async () => {
    setProviderError('')
    try {
      setProvider(await api<ProviderStatus>('/api/whatsapp/provider-status'))
    } catch (error) {
      setProviderError(errorMessage(error, language))
    }
  }, [language])

  const refreshAll = useCallback(() => {
    void refreshAccounts()
    void refreshContacts()
    void refreshConversations()
    void refreshQueue()
    void refreshProvider()
  }, [refreshAccounts, refreshContacts, refreshConversations, refreshProvider, refreshQueue])

  const providerUnavailable = provider?.status === 'PROVIDER_UNAVAILABLE'

  useEffect(() => {
    const timer = window.setTimeout(refreshAll, 0)
    return () => window.clearTimeout(timer)
  }, [refreshAll])

  const pendingAccountIds = useMemo(
    () => accounts.filter((account) => pendingStatuses.has(account.status)).map((account) => account.id).join('|'),
    [accounts],
  )

  useEffect(() => {
    const timer = window.setInterval(
      () => void refreshAccounts(true),
      pendingAccountIds ? 15000 : 30000,
    )
    return () => window.clearInterval(timer)
  }, [pendingAccountIds, refreshAccounts])

  useEffect(() => {
    if (!pendingAccountIds || providerUnavailable) return

    let cancelled = false
    let inFlight = false
    const accountIds = pendingAccountIds.split('|')
    const poll = async () => {
      if (inFlight) return
      inFlight = true
      await Promise.all(accountIds.map(async (accountId) => {
        try {
          const data = await api<{ qrImage?: string | null; status?: string }>(
            `/api/admin/whatsapp/accounts/${encodeURIComponent(accountId)}/qr`,
          )
          if (cancelled) return
          const qrImage = data.qrImage || null
          setQrByAccount((current) => current[accountId] === qrImage
            ? current
            : { ...current, [accountId]: qrImage })
          setQrErrors((current) => current[accountId] ? { ...current, [accountId]: '' } : current)
          if (data.status) {
            setAccounts((current) => current.map((account) =>
              account.id === accountId && account.status !== data.status
                ? { ...account, status: data.status as string }
                : account,
            ))
          }
        } catch (error) {
          if (cancelled) return
          const message = errorMessage(error, language)
          if ((error as RequestError)?.code === 'PROVIDER_UNAVAILABLE') {
            setProvider({ status: 'PROVIDER_UNAVAILABLE', reason: message })
          }
          setQrErrors((current) => current[accountId] === message
            ? current
            : { ...current, [accountId]: message })
        }
      }))
      inFlight = false
    }

    void poll()
    const timer = window.setInterval(() => void poll(), 2500)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [language, pendingAccountIds, providerUnavailable])

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const phoneNumber = phone.trim()
    if (!phoneNumber || creatingAccount) return
    setCreatingAccount(true)
    setNotice('')
    try {
      const account = await api<Account>('/api/admin/whatsapp/accounts', {
        method: 'POST',
        body: JSON.stringify({ provider: 'BAILEYS', phoneNumber }),
      })
      setAccounts((current) => [account, ...current.filter((item) => item.id !== account.id)])
      setAccountsState('ready')
      setPhone('')
      setNotice(t('أُضيف الرقم. اضغط «ربط واتساب» لبدء الاتصال وعرض رمز QR.', 'Number added. Select “Connect WhatsApp” to start connecting and display the QR code.'))
    } catch (error) {
      setNotice(errorMessage(error, language))
    } finally {
      setCreatingAccount(false)
    }
  }

  async function accountAction(account: Account, action: string) {
    if (action === 'LOGOUT' && account.status !== 'CONNECTED') {
      const confirmed = window.confirm(
      t('سيؤدي هذا إلى مسح جلسة واتساب المحفوظة لهذا الرقم، وستحتاج إلى مسح رمز QR جديد. سيبقى سجل المحادثات محفوظًا.', 'This will clear the saved WhatsApp session for this number. You will need to scan a new QR code. Conversation history will be preserved.'),
      )
      if (!confirmed) return
    }

    setBusyAccount(account.id)
    setNotice('')
    setQrErrors((current) => ({ ...current, [account.id]: '' }))
    try {
      const data = await api<{ status?: string; provider?: ProviderStatus; accountId?: string }>(`/api/admin/whatsapp/accounts/${encodeURIComponent(account.id)}`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      if (action === 'SET_OTP_SENDER') {
        setAccounts((current) => current.map((item) => ({
          ...item,
          isOtpSender: item.id === account.id,
        })))
        setNotice(t('تم اختيار هذا الرقم لإرسال رموز التحقق.', 'This number is now selected to send verification codes.'))
      } else if (action === 'LOGOUT') {
        setQrByAccount((current) => ({ ...current, [account.id]: null }))
        setAccounts((current) => current.map((item) => item.id === account.id
          ? { ...item, status: data.status || 'LOGGED_OUT', isOtpSender: false }
          : item))
        setNotice(t('تم فصل الرقم. يمكنك إعادة ربطه ومسح رمز QR جديد.', 'Number disconnected. You can reconnect it by scanning a new QR code.'))
      } else {
        const providerStatus = data.provider?.status
        const nextStatus = providerStatus && providerStatus !== 'DISCONNECTED'
          ? providerStatus
          : 'CONNECTING'
        setAccounts((current) => current.map((item) => item.id === account.id
          ? { ...item, status: nextStatus }
          : item))
        setNotice(t('بدأ الاتصال. سيظهر رمز QR هنا عند جاهزيته.', 'Connection started. The QR code will appear here when ready.'))
        void refreshProvider()
      }
      if (action === 'CONNECT' || action === 'RECONNECT') {
        void refreshProvider()
      } else {
        void refreshAccounts(true)
      }
    } catch (error) {
      setNotice(errorMessage(error, language))
      void refreshProvider()
      void refreshAccounts(true)
    } finally {
      setBusyAccount(null)
    }
  }

  async function loadMessages(conversationId: string) {
    const requestId = ++messageRequestId.current
    setMessagesLoading(true)
    try {
      const data = await api<{ items?: Message[] }>(
        `/api/admin/whatsapp/conversations/${encodeURIComponent(conversationId)}/messages`,
      )
      if (messageRequestId.current === requestId) {
        setMessages(Array.isArray(data.items) ? data.items : [])
      }
    } catch (error) {
      if (messageRequestId.current === requestId) setNotice(errorMessage(error, language))
    } finally {
      if (messageRequestId.current === requestId) setMessagesLoading(false)
    }
  }

  async function openConversation(conversationId: string) {
    setSelectedConversation(conversationId)
    setMessages([])
    await loadMessages(conversationId)
  }

  async function startConversation(contact: Contact) {
    setNotice('')
    try {
      const conversation = await api<{ id: string }>('/api/admin/whatsapp/conversations', {
        method: 'POST',
        body: JSON.stringify({ accountId: contact.accountId, contactId: contact.id }),
      })
      await refreshConversations()
      await openConversation(conversation.id)
    } catch (error) {
      setNotice(errorMessage(error, language))
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = messageDraft.trim()
    if (!body || !selectedConversation || sendingMessage) return
    setSendingMessage(true)
    setNotice('')
    try {
      await api(`/api/admin/whatsapp/conversations/${encodeURIComponent(selectedConversation)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setMessageDraft('')
      await Promise.all([
        loadMessages(selectedConversation),
        refreshConversations(),
        refreshQueue(),
      ])
      setNotice(t('أُضيفت الرسالة إلى طابور الإرسال.', 'Message added to the sending queue.'))
    } catch (error) {
      setNotice(errorMessage(error, language))
    } finally {
      setSendingMessage(false)
    }
  }

  const providerStatus = provider?.status as string | undefined

  return (
    <div className={styles.workspace} dir={localeDirection(language)}>
      <section className={`${pageStyles.notice} ${styles.providerNotice}`} aria-labelledby="provider-status-heading">
        <div className={styles.providerTopline}>
          <div>
            <h2 id="provider-status-heading" className={styles.sectionTitle}>{t('حالة مزوّد واتساب', 'WhatsApp provider status')}</h2>
            <p className={styles.statusLine} role="status">
              {providerError
                ? providerError
                : provider
                  ? statusLabel(providerStatus, language)
                  : t('جارٍ التحقق من حالة المزوّد…', 'Checking provider status…')}
              {provider?.reason ? ` · ${provider.reason}` : ''}
            </p>
          </div>
          <div className={styles.providerActions}>
            <a
              className={`${pageStyles.button} ${styles.primaryButton}`}
              href="#whatsapp-accounts"
            >
              {t('الأرقام والربط', 'Numbers & connections')}
            </a>
            <button className={pageStyles.button} type="button" onClick={refreshAll}>
              {t('تحديث البيانات', 'Refresh data')}
            </button>
          </div>
        </div>
        <p className={styles.helpText}>{t('لإضافة رقم أو بدء الربط، افتح «الأرقام والربط» أدناه. يظهر رمز QR داخل بطاقة الرقم بعد الضغط على «ربط واتساب».', 'To add a number or connect, use “Numbers & connections” below. A QR code appears on the number card after selecting “Connect WhatsApp”.')}</p>
      </section>

      {notice && <div className={pageStyles.notice} role="status">{notice}</div>}

      <div className={pageStyles.grid}>
        <section id="whatsapp-accounts" className={`${pageStyles.card} ${styles.accountsCard}`} aria-labelledby="accounts-heading" tabIndex={-1}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="accounts-heading" className={styles.sectionTitle}>{t('الأرقام والربط', 'Numbers & connections')}</h2>
              <p className={styles.helpText}>{t('أضف رقم واتساب، ثم اربطه بمسح رمز QR من الهاتف.', 'Add a WhatsApp number, then connect it by scanning its QR code with your phone.')}</p>
            </div>
            <button className={pageStyles.button} type="button" onClick={() => void refreshAccounts()}>
              {t('تحديث الأرقام', 'Refresh numbers')}
            </button>
          </div>

          <form className={styles.addAccountForm} onSubmit={createAccount}>
            <label className={styles.srOnly} htmlFor="whatsapp-phone">{t('رقم واتساب بالصيغة الدولية', 'WhatsApp number in international format')}</label>
            <input
              id="whatsapp-phone"
              className={pageStyles.input}
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t('مثال: +966 5X XXX XXXX', 'Example: +966 5X XXX XXXX')}
              aria-label={t('رقم واتساب بالصيغة الدولية', 'WhatsApp number in international format')}
            />
            <button
              className={`${pageStyles.button} ${styles.primaryButton}`}
              type="submit"
              disabled={!phone.trim() || creatingAccount}
            >
              {creatingAccount ? t('جارٍ الإضافة…', 'Adding…') : t('إضافة رقم', 'Add number')}
            </button>
          </form>

          {accountsError && (
            <div className={pageStyles.error} role="alert">
              <p>{accountsError}</p>
              <button className={pageStyles.button} type="button" onClick={() => void refreshAccounts()}>
                {t('إعادة المحاولة', 'Try again')}
              </button>
            </div>
          )}

          {accountsState === 'loading' && <div className={pageStyles.skeleton} aria-label={t('جارٍ تحميل الأرقام', 'Loading numbers')} />}
          {accountsState === 'empty' && (
            <div className={pageStyles.empty}>{t('لا توجد أرقام بعد. أضف رقمًا لبدء ربط واتساب وإدارة المحادثات.', 'No numbers yet. Add a number to connect WhatsApp and manage conversations.')}</div>
          )}

          {accounts.length > 0 && !accounts.some((account) => account.isOtpSender) && (
            <div className={pageStyles.notice} role="status">
              {t(
                'ربط واتساب وحده لا يفعّل رموز الدخول. اختر «استخدام لرموز التحقق» على رقم متصل.',
                'Connecting WhatsApp alone does not enable login codes. Select “Use for verification codes” on a connected number.',
              )}
            </div>
          )}
          {accounts.some((account) => account.isOtpSender && account.status !== 'CONNECTED') && (
            <div className={pageStyles.error} role="alert">
              {t(
                'مرسل رموز التحقق المحدد غير متصل. أعد ربط الرقم أو اختر رقماً متصلاً آخر.',
                'The selected verification-code sender is disconnected. Reconnect it or select another connected number.',
              )}
            </div>
          )}

          {accounts.length > 0 && (
            <div className={styles.accountList}>
              {accounts.map((account) => {
                const isPending = pendingStatuses.has(account.status)
                const isBusy = busyAccount === account.id
                const action = account.status === 'CONNECTED'
                  ? 'LOGOUT'
                  : account.status === 'ERROR'
                    ? 'RECONNECT'
                    : 'CONNECT'
                const actionLabel = account.status === 'CONNECTED'
                  ? t('فصل الربط', 'Disconnect')
                  : account.status === 'ERROR'
                    ? t('إعادة الربط', 'Reconnect')
                    : isPending
                      ? t('جارٍ الربط…', 'Connecting…')
                      : t('ربط واتساب', 'Connect WhatsApp')

                return (
                  <article className={styles.account} key={account.id}>
                    <div className={styles.accountInfo}>
                      <div>
                        <strong className={styles.phoneNumber} dir="ltr">{account.phoneNumber}</strong>
                        <p className={styles.accountMeta}>
                          {statusLabel(account.status, language)} · {persistenceLabel(account.authPersistenceStatus, language)}
                          {account.isOtpSender ? ` · ${t('مرسل رموز التحقق', 'Verification code sender')}` : ''}
                        </p>
                      </div>
                      <div className={styles.accountActions}>
                        <span className={pageStyles.badge}>{statusLabel(account.status, language)}</span>
                        <button
                          className={`${pageStyles.button} ${account.status === 'CONNECTED' ? '' : styles.primaryButton}`}
                          type="button"
                          disabled={isBusy || isPending || (providerUnavailable && action !== 'LOGOUT')}
                          onClick={() => void accountAction(account, action)}
                        >
                          {isBusy ? t('جارٍ التنفيذ…', 'Working…') : actionLabel}
                        </button>
                        {account.status === 'QR_REQUIRED' && (
                          <button
                            className={pageStyles.button}
                            type="button"
                            disabled={isBusy}
                            onClick={() => void accountAction(account, 'LOGOUT')}
                          >
                            {t('إلغاء الرمز', 'Cancel QR code')}
                          </button>
                        )}
                        {account.status === 'CONNECTED' && !account.isOtpSender && (
                          <button
                            className={pageStyles.button}
                            type="button"
                            disabled={isBusy}
                            onClick={() => void accountAction(account, 'SET_OTP_SENDER')}
                          >
                            {t('استخدام لرموز التحقق', 'Use for verification codes')}
                          </button>
                        )}
                      </div>
                    </div>

                    {isPending && (
                      <div className={styles.qrPanel} aria-live="polite">
                        {qrByAccount[account.id] ? (
                          <>
                            <Image
                              className={styles.qrImage}
                              src={qrByAccount[account.id] || ''}
                              alt={t(`رمز ربط واتساب للرقم ${account.phoneNumber}`, `WhatsApp connection QR code for ${account.phoneNumber}`)}
                              width={240}
                              height={240}
                              unoptimized
                            />
                            <div>
                              <strong>{t('امسح الرمز من تطبيق واتساب', 'Scan this code in WhatsApp')}</strong>
                              <p className={styles.helpText}>{t('افتح الأجهزة المرتبطة في الهاتف واختر ربط جهاز.', 'On your phone, open Linked devices and select Link a device.')}</p>
                            </div>
                          </>
                        ) : (
                          <p className={styles.helpText}>
                            {qrErrors[account.id] || (account.status === 'CONNECTING'
                              ? t('جارٍ تجهيز الاتصال…', 'Preparing connection…')
                              : t('جارٍ تجهيز رمز QR…', 'Preparing QR code…'))}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className={pageStyles.card} aria-labelledby="contacts-heading">
          <div className={styles.sectionHeader}>
            <h2 id="contacts-heading" className={styles.sectionTitle}>{t('جهات الاتصال', 'Contacts')}</h2>
            <button className={pageStyles.button} type="button" onClick={() => void refreshContacts()}>
              {t('تحديث', 'Refresh')}
            </button>
          </div>
          {contactsState === 'loading' && <div className={pageStyles.skeleton} aria-label={t('جارٍ تحميل جهات الاتصال', 'Loading contacts')} />}
          {contactsError && <div className={pageStyles.error} role="alert">{contactsError}</div>}
          {contactsState === 'empty' && (
            <div className={pageStyles.empty}>{t('ستظهر جهات الاتصال بعد ربط رقم واتساب واستقبال الرسائل.', 'Contacts will appear after you connect a WhatsApp number and receive messages.')}</div>
          )}
          {contacts.length > 0 && (
            <div className={styles.contactList}>
              {contacts.slice(0, 8).map((contact) => (
                <div className={styles.contactRow} key={contact.id}>
                  <div>
                    <strong>{contact.displayName || contact.phoneNumber}</strong>
                    <p className={styles.accountMeta}>{contactStatusLabel(contact.status, language)}</p>
                  </div>
                  <button
                    className={pageStyles.button}
                    type="button"
                    onClick={() => void startConversation(contact)}
                  >
                    {t('فتح المحادثة', 'Open conversation')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={`${pageStyles.card} ${styles.wide}`} aria-labelledby="conversations-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="conversations-heading" className={styles.sectionTitle}>{t('المحادثات', 'Conversations')}</h2>
              <p className={styles.helpText}>{t('اختر محادثة لقراءة الرسائل وإضافة رد إلى طابور الإرسال.', 'Select a conversation to read messages and add a reply to the sending queue.')}</p>
            </div>
            <button className={pageStyles.button} type="button" onClick={() => void refreshConversations()}>
              {t('تحديث', 'Refresh')}
            </button>
          </div>
          {conversationsState === 'loading' && <div className={pageStyles.skeleton} aria-label={t('جارٍ تحميل المحادثات', 'Loading conversations')} />}
          {conversationsError && <div className={pageStyles.error} role="alert">{conversationsError}</div>}
          {conversationsState === 'empty' && (
            <div className={pageStyles.empty}>{t('لا توجد محادثات بعد. افتح محادثة من قائمة جهات الاتصال.', 'No conversations yet. Open a conversation from the contacts list.')}</div>
          )}
          {conversations.length > 0 && (
            <div className={styles.conversationList}>
              {conversations.map((conversation) => {
                const name = conversation.contact?.displayName
                  || conversation.contact?.normalizedPhone
                  || t('محادثة واتساب', 'WhatsApp conversation')
                return (
                  <button
                    className={`${styles.conversationButton} ${selectedConversation === conversation.id ? styles.selectedConversation : ''}`}
                    type="button"
                    key={conversation.id}
                    aria-pressed={selectedConversation === conversation.id}
                    onClick={() => void openConversation(conversation.id)}
                  >
                    <strong>{name}</strong>
                    <span>{conversation.status === 'OPEN' ? t('مفتوحة', 'Open') : conversation.status}</span>
                    <small>{conversation.unreadCount || 0} {t('غير مقروءة', 'unread')}</small>
                    <p>{conversation.messages?.[0]?.body || t('لا توجد رسائل بعد', 'No messages yet')}</p>
                  </button>
                )
              })}
            </div>
          )}

          {selectedConversation && (
            <div className={styles.messageWorkspace}>
              <div className={styles.messageList} aria-live="polite">
                {messagesLoading && <p className={styles.helpText}>{t('جارٍ تحميل الرسائل…', 'Loading messages…')}</p>}
                {!messagesLoading && messages.length === 0 && (
                  <div className={pageStyles.empty}>{t('لا توجد رسائل في هذه المحادثة.', 'No messages in this conversation.')}</div>
                )}
                {messages.map((message) => (
                  <article className={styles.message} key={message.id} dir="auto">
                    <p>{message.body}</p>
                    <small className={styles.messageMeta}>
                      {deliveryLabel(message.direction, language)} · {deliveryLabel(message.deliveryStatus, language)}
                    </small>
                  </article>
                ))}
              </div>
              <form className={styles.sendForm} onSubmit={sendMessage}>
                <label className={styles.srOnly} htmlFor="whatsapp-message">{t('اكتب ردًا', 'Write a reply')}</label>
                <input
                  id="whatsapp-message"
                  className={pageStyles.input}
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder={t('اكتب ردًا', 'Write a reply')}
                />
                <button
                  className={`${pageStyles.button} ${styles.primaryButton}`}
                  type="submit"
                  disabled={!messageDraft.trim() || sendingMessage}
                >
                  {sendingMessage ? t('جارٍ الإضافة…', 'Adding…') : t('إضافة إلى طابور الإرسال', 'Add to sending queue')}
                </button>
              </form>
            </div>
          )}
        </section>

        <section className={pageStyles.card} aria-labelledby="queue-heading">
          <div className={styles.sectionHeader}>
            <h2 id="queue-heading" className={styles.sectionTitle}>{t('طابور الإرسال', 'Sending queue')}</h2>
            <button className={pageStyles.button} type="button" onClick={() => void refreshQueue()}>
              {t('تحديث', 'Refresh')}
            </button>
          </div>
          {queueState === 'loading' && <div className={pageStyles.skeleton} aria-label={t('جارٍ تحميل الطابور', 'Loading queue')} />}
          {queueError && <div className={pageStyles.error} role="alert">{queueError}</div>}
          {queue && (
            <>
              <div className={styles.queueCounts}>
                <div><strong>{queue.counts?.pending ?? 0}</strong><span>{t('بانتظار الإرسال', 'Pending')}</span></div>
                <div><strong>{queue.counts?.failed ?? 0}</strong><span>{t('فشل', 'Failed')}</span></div>
                <div><strong>{queue.counts?.sent ?? 0}</strong><span>{t('أُرسلت', 'Sent')}</span></div>
              </div>
              <p className={styles.helpText}>
                {t('الفاصل بين الرسائل', 'Message interval')} {queue.pacingMs ?? '—'} {t('مللي ثانية', 'ms')} · {t('حد المحاولات', 'Attempt limit')} {queue.maxAttempts ?? '—'}
              </p>
            </>
          )}
          {queueState === 'error' && !queueError && <div className={pageStyles.empty}>{t('حالة الطابور غير متاحة.', 'Queue status is unavailable.')}</div>}
        </section>
      </div>
    </div>
  )
}