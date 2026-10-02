'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import pageStyles from '@/app/phase4/phase4.module.css'
import styles from './WhatsAppCRMWorkspace.module.css'

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
      : 'تعذّر إكمال الطلب. حاول مرة أخرى.'
    throw Object.assign(
      new Error(message),
      {
        code: typeof apiError.code === 'string' ? apiError.code : undefined,
        status: response.status,
      },
    ) as RequestError
  }
  return data as T
}

function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'تعذّر إكمال الطلب. حاول مرة أخرى.'
  const code = (error as RequestError).code
  const translated: Record<string, string> = {
    ACCOUNT_NOT_CONNECTED: 'اربط الرقم أولًا قبل اختياره لاستقبال رموز التحقق.',
    CONNECT_FAILED: 'تعذّر بدء اتصال واتساب. راجع حالة المزوّد ثم حاول مرة أخرى.',
    DATABASE_UNAVAILABLE: 'قاعدة البيانات غير متاحة حاليًا. لم يتم حفظ أي تغيير.',
    LOGOUT_FAILED: 'تعذّر فصل الرقم. حاول مرة أخرى.',
    PROVIDER_UNAVAILABLE: 'مزوّد واتساب غير جاهز. تحقّق من إعداد Baileys وحفظ الجلسة.',
    RECONNECT_LIMIT: 'وصل الرقم إلى حد محاولات إعادة الربط. افصل الجلسة ثم امسح رمزًا جديدًا.',
  }
  return (code && translated[code]) || error.message
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    CONNECTED: 'متصل',
    CONNECTING: 'جارٍ الاتصال',
    DISCONNECTED: 'غير مرتبط',
    ERROR: 'تعذّر الاتصال',
    LOGGED_OUT: 'تم فصل الربط',
    PROVIDER_UNAVAILABLE: 'المزوّد غير متاح',
    QR_REQUIRED: 'بانتظار مسح الرمز',
    RECONNECTING: 'جارٍ إعادة الاتصال',
  }
  return status ? labels[status] || status : 'غير معروف'
}

function persistenceLabel(status?: string) {
  if (status === 'PERSISTENCE_CONFIGURED') return 'حفظ الجلسة جاهز'
  if (!status) return 'حالة حفظ الجلسة غير معروفة'
  return 'حفظ الجلسة غير جاهز'
}

function contactStatusLabel(status?: string) {
  if (status === 'ACTIVE') return 'نشطة'
  if (status === 'INACTIVE') return 'غير نشطة'
  return status || ''
}

function deliveryLabel(value?: string) {
  const labels: Record<string, string> = {
    FAILED: 'فشل الإرسال',
    INBOUND: 'واردة',
    OUTBOUND: 'صادرة',
    PENDING: 'بانتظار الإرسال',
    QUEUED: 'في الطابور',
    SENT: 'أُرسلت',
    DELIVERED: 'تم التسليم',
  }
  return value ? labels[value] || value : ''
}

const pendingStatuses = new Set(['CONNECTING', 'QR_REQUIRED', 'RECONNECTING'])

export function WhatsAppCRMWorkspace() {
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
      const message = errorMessage(error)
      setAccountsError(message)
      setAccountsState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [])

  const refreshContacts = useCallback(async () => {
    setContactsError('')
    try {
      const data = await api<{ items?: Contact[] }>('/api/admin/whatsapp/contacts')
      const items = Array.isArray(data.items) ? data.items : []
      setContacts(items)
      setContactsState(items.length ? 'ready' : 'empty')
    } catch (error) {
      setContactsError(errorMessage(error))
      setContactsState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [])

  const refreshConversations = useCallback(async () => {
    setConversationsError('')
    try {
      const data = await api<{ items?: Conversation[] }>('/api/admin/whatsapp/conversations')
      const items = Array.isArray(data.items) ? data.items : []
      setConversations(items)
      setConversationsState(items.length ? 'ready' : 'empty')
    } catch (error) {
      setConversationsError(errorMessage(error))
      setConversationsState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [])

  const refreshQueue = useCallback(async () => {
    setQueueError('')
    try {
      setQueue(await api<QueueSummary>('/api/admin/whatsapp/queue'))
      setQueueState('ready')
    } catch (error) {
      setQueueError(errorMessage(error))
      setQueueState((error as RequestError)?.status === 503 ? 'database' : 'error')
    }
  }, [])

  const refreshProvider = useCallback(async () => {
    setProviderError('')
    try {
      setProvider(await api<ProviderStatus>('/api/whatsapp/provider-status'))
    } catch (error) {
      setProviderError(errorMessage(error))
    }
  }, [])

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
          const message = errorMessage(error)
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
  }, [pendingAccountIds, providerUnavailable])

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
      setNotice('أُضيف الرقم. اضغط «ربط واتساب» لبدء الاتصال وعرض رمز QR.')
    } catch (error) {
      setNotice(errorMessage(error))
    } finally {
      setCreatingAccount(false)
    }
  }

  async function accountAction(account: Account, action: string) {
    if (action === 'LOGOUT' && account.status !== 'CONNECTED') {
      const confirmed = window.confirm(
        'سيؤدي هذا إلى مسح جلسة واتساب المحفوظة لهذا الرقم، وستحتاج إلى مسح رمز QR جديد. سيبقى سجل المحادثات محفوظًا.',
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
        setNotice('تم اختيار هذا الرقم لإرسال رموز التحقق.')
      } else if (action === 'LOGOUT') {
        setQrByAccount((current) => ({ ...current, [account.id]: null }))
        setAccounts((current) => current.map((item) => item.id === account.id
          ? { ...item, status: data.status || 'LOGGED_OUT', isOtpSender: false }
          : item))
        setNotice('تم فصل الرقم. يمكنك إعادة ربطه ومسح رمز QR جديد.')
      } else {
        const providerStatus = data.provider?.status
        const nextStatus = providerStatus && providerStatus !== 'DISCONNECTED'
          ? providerStatus
          : 'CONNECTING'
        setAccounts((current) => current.map((item) => item.id === account.id
          ? { ...item, status: nextStatus }
          : item))
        setNotice('بدأ الاتصال. سيظهر رمز QR هنا عند جاهزيته.')
        void refreshProvider()
      }
      if (action === 'CONNECT' || action === 'RECONNECT') {
        void refreshProvider()
      } else {
        void refreshAccounts(true)
      }
    } catch (error) {
      setNotice(errorMessage(error))
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
      if (messageRequestId.current === requestId) setNotice(errorMessage(error))
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
      setNotice(errorMessage(error))
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
      setNotice('أُضيفت الرسالة إلى طابور الإرسال.')
    } catch (error) {
      setNotice(errorMessage(error))
    } finally {
      setSendingMessage(false)
    }
  }

  const providerStatus = provider?.status as string | undefined

  return (
    <div className={styles.workspace}>
      <section className={`${pageStyles.notice} ${styles.providerNotice}`} aria-labelledby="provider-status-heading">
        <div className={styles.providerTopline}>
          <div>
            <h2 id="provider-status-heading" className={styles.sectionTitle}>حالة مزوّد واتساب</h2>
            <p className={styles.statusLine} role="status">
              {providerError
                ? providerError
                : provider
                  ? statusLabel(providerStatus)
                  : 'جارٍ التحقق من حالة المزوّد…'}
              {provider?.reason ? ` · ${provider.reason}` : ''}
            </p>
          </div>
          <button className={pageStyles.button} type="button" onClick={refreshAll}>
            تحديث البيانات
          </button>
        </div>
        <p className={styles.helpText}>يظهر رمز QR داخل بطاقة الرقم بعد الضغط على «ربط واتساب»؛ هذه البطاقة تعرض حالة المزوّد فقط.</p>
      </section>

      {notice && <div className={pageStyles.notice} role="status">{notice}</div>}

      <div className={pageStyles.grid}>
        <section className={`${pageStyles.card} ${styles.accountsCard}`} aria-labelledby="accounts-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="accounts-heading" className={styles.sectionTitle}>الأرقام والربط</h2>
              <p className={styles.helpText}>أضف رقم واتساب، ثم اربطه بمسح رمز QR من الهاتف.</p>
            </div>
            <button className={pageStyles.button} type="button" onClick={() => void refreshAccounts()}>
              تحديث الأرقام
            </button>
          </div>

          <form className={styles.addAccountForm} onSubmit={createAccount}>
            <label className={styles.srOnly} htmlFor="whatsapp-phone">رقم واتساب بالصيغة الدولية</label>
            <input
              id="whatsapp-phone"
              className={pageStyles.input}
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="مثال: +966 5X XXX XXXX"
              aria-label="رقم واتساب بالصيغة الدولية"
            />
            <button
              className={`${pageStyles.button} ${styles.primaryButton}`}
              type="submit"
              disabled={!phone.trim() || creatingAccount}
            >
              {creatingAccount ? 'جارٍ الإضافة…' : 'إضافة رقم'}
            </button>
          </form>

          {accountsError && (
            <div className={pageStyles.error} role="alert">
              <p>{accountsError}</p>
              <button className={pageStyles.button} type="button" onClick={() => void refreshAccounts()}>
                إعادة المحاولة
              </button>
            </div>
          )}

          {accountsState === 'loading' && <div className={pageStyles.skeleton} aria-label="جارٍ تحميل الأرقام" />}
          {accountsState === 'empty' && (
            <div className={pageStyles.empty}>لا توجد أرقام بعد. أضف رقمًا لبدء ربط واتساب وإدارة المحادثات.</div>
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
                  ? 'فصل الربط'
                  : account.status === 'ERROR'
                    ? 'إعادة الربط'
                    : isPending
                      ? 'جارٍ الربط…'
                      : 'ربط واتساب'

                return (
                  <article className={styles.account} key={account.id}>
                    <div className={styles.accountInfo}>
                      <div>
                        <strong className={styles.phoneNumber} dir="ltr">{account.phoneNumber}</strong>
                        <p className={styles.accountMeta}>
                          {statusLabel(account.status)} · {persistenceLabel(account.authPersistenceStatus)}
                          {account.isOtpSender ? ' · مرسل رموز التحقق' : ''}
                        </p>
                      </div>
                      <div className={styles.accountActions}>
                        <span className={pageStyles.badge}>{statusLabel(account.status)}</span>
                        <button
                          className={`${pageStyles.button} ${account.status === 'CONNECTED' ? '' : styles.primaryButton}`}
                          type="button"
                          disabled={isBusy || isPending || (providerUnavailable && action !== 'LOGOUT')}
                          onClick={() => void accountAction(account, action)}
                        >
                          {isBusy ? 'جارٍ التنفيذ…' : actionLabel}
                        </button>
                        {account.status === 'QR_REQUIRED' && (
                          <button
                            className={pageStyles.button}
                            type="button"
                            disabled={isBusy}
                            onClick={() => void accountAction(account, 'LOGOUT')}
                          >
                            إلغاء الرمز
                          </button>
                        )}
                        {account.status === 'CONNECTED' && !account.isOtpSender && (
                          <button
                            className={pageStyles.button}
                            type="button"
                            disabled={isBusy}
                            onClick={() => void accountAction(account, 'SET_OTP_SENDER')}
                          >
                            استخدام لرموز التحقق
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
                              alt={`رمز ربط واتساب للرقم ${account.phoneNumber}`}
                              width={240}
                              height={240}
                              unoptimized
                            />
                            <div>
                              <strong>امسح الرمز من تطبيق واتساب</strong>
                              <p className={styles.helpText}>افتح الأجهزة المرتبطة في الهاتف واختر ربط جهاز.</p>
                            </div>
                          </>
                        ) : (
                          <p className={styles.helpText}>
                            {qrErrors[account.id] || (account.status === 'CONNECTING'
                              ? 'جارٍ تجهيز الاتصال…'
                              : 'جارٍ تجهيز رمز QR…')}
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
            <h2 id="contacts-heading" className={styles.sectionTitle}>جهات الاتصال</h2>
            <button className={pageStyles.button} type="button" onClick={() => void refreshContacts()}>
              تحديث
            </button>
          </div>
          {contactsState === 'loading' && <div className={pageStyles.skeleton} aria-label="جارٍ تحميل جهات الاتصال" />}
          {contactsError && <div className={pageStyles.error} role="alert">{contactsError}</div>}
          {contactsState === 'empty' && (
            <div className={pageStyles.empty}>ستظهر جهات الاتصال بعد ربط رقم واتساب واستقبال الرسائل.</div>
          )}
          {contacts.length > 0 && (
            <div className={styles.contactList}>
              {contacts.slice(0, 8).map((contact) => (
                <div className={styles.contactRow} key={contact.id}>
                  <div>
                    <strong>{contact.displayName || contact.phoneNumber}</strong>
                    <p className={styles.accountMeta}>{contactStatusLabel(contact.status)}</p>
                  </div>
                  <button
                    className={pageStyles.button}
                    type="button"
                    onClick={() => void startConversation(contact)}
                  >
                    فتح المحادثة
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={`${pageStyles.card} ${styles.wide}`} aria-labelledby="conversations-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="conversations-heading" className={styles.sectionTitle}>المحادثات</h2>
              <p className={styles.helpText}>اختر محادثة لقراءة الرسائل وإضافة رد إلى طابور الإرسال.</p>
            </div>
            <button className={pageStyles.button} type="button" onClick={() => void refreshConversations()}>
              تحديث
            </button>
          </div>
          {conversationsState === 'loading' && <div className={pageStyles.skeleton} aria-label="جارٍ تحميل المحادثات" />}
          {conversationsError && <div className={pageStyles.error} role="alert">{conversationsError}</div>}
          {conversationsState === 'empty' && (
            <div className={pageStyles.empty}>لا توجد محادثات بعد. افتح محادثة من قائمة جهات الاتصال.</div>
          )}
          {conversations.length > 0 && (
            <div className={styles.conversationList}>
              {conversations.map((conversation) => {
                const name = conversation.contact?.displayName
                  || conversation.contact?.normalizedPhone
                  || 'محادثة واتساب'
                return (
                  <button
                    className={`${styles.conversationButton} ${selectedConversation === conversation.id ? styles.selectedConversation : ''}`}
                    type="button"
                    key={conversation.id}
                    aria-pressed={selectedConversation === conversation.id}
                    onClick={() => void openConversation(conversation.id)}
                  >
                    <strong>{name}</strong>
                    <span>{conversation.status === 'OPEN' ? 'مفتوحة' : conversation.status}</span>
                    <small>{conversation.unreadCount || 0} غير مقروءة</small>
                    <p>{conversation.messages?.[0]?.body || 'لا توجد رسائل بعد'}</p>
                  </button>
                )
              })}
            </div>
          )}

          {selectedConversation && (
            <div className={styles.messageWorkspace}>
              <div className={styles.messageList} aria-live="polite">
                {messagesLoading && <p className={styles.helpText}>جارٍ تحميل الرسائل…</p>}
                {!messagesLoading && messages.length === 0 && (
                  <div className={pageStyles.empty}>لا توجد رسائل في هذه المحادثة.</div>
                )}
                {messages.map((message) => (
                  <article className={styles.message} key={message.id} dir="auto">
                    <p>{message.body}</p>
                    <small className={styles.messageMeta}>
                      {deliveryLabel(message.direction)} · {deliveryLabel(message.deliveryStatus)}
                    </small>
                  </article>
                ))}
              </div>
              <form className={styles.sendForm} onSubmit={sendMessage}>
                <label className={styles.srOnly} htmlFor="whatsapp-message">اكتب ردًا</label>
                <input
                  id="whatsapp-message"
                  className={pageStyles.input}
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="اكتب ردًا"
                />
                <button
                  className={`${pageStyles.button} ${styles.primaryButton}`}
                  type="submit"
                  disabled={!messageDraft.trim() || sendingMessage}
                >
                  {sendingMessage ? 'جارٍ الإضافة…' : 'إضافة إلى طابور الإرسال'}
                </button>
              </form>
            </div>
          )}
        </section>

        <section className={pageStyles.card} aria-labelledby="queue-heading">
          <div className={styles.sectionHeader}>
            <h2 id="queue-heading" className={styles.sectionTitle}>طابور الإرسال</h2>
            <button className={pageStyles.button} type="button" onClick={() => void refreshQueue()}>
              تحديث
            </button>
          </div>
          {queueState === 'loading' && <div className={pageStyles.skeleton} aria-label="جارٍ تحميل الطابور" />}
          {queueError && <div className={pageStyles.error} role="alert">{queueError}</div>}
          {queue && (
            <>
              <div className={styles.queueCounts}>
                <div><strong>{queue.counts?.pending ?? 0}</strong><span>بانتظار الإرسال</span></div>
                <div><strong>{queue.counts?.failed ?? 0}</strong><span>فشل</span></div>
                <div><strong>{queue.counts?.sent ?? 0}</strong><span>أُرسلت</span></div>
              </div>
              <p className={styles.helpText}>
                الفاصل بين الرسائل {queue.pacingMs ?? '—'} مللي ثانية · حد المحاولات {queue.maxAttempts ?? '—'}
              </p>
            </>
          )}
          {queueState === 'error' && !queueError && <div className={pageStyles.empty}>حالة الطابور غير متاحة.</div>}
        </section>
      </div>
    </div>
  )
}