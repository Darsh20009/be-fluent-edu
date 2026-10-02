import type {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataSet,
  SignalDataTypeMap,
  WASocket,
} from '@whiskeysockets/baileys'
import { randomUUID } from 'node:crypto'
import type { WhatsAppAccount, WhatsAppMessageInput, WhatsAppMessageResult, WhatsAppProvider } from '@/lib/whatsapp'
import {
  WhatsAppBufferJSON,
  whatsappAuthPersistence,
  type WhatsAppAuthPersistence,
} from './persistence'
import { WHATSAPP_MIN_OUTGOING_INTERVAL_MS } from './index'

export type WhatsAppProviderStatus =
  | 'PROVIDER_UNAVAILABLE'
  | 'DISCONNECTED'
  | 'QR_REQUIRED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'LOGGED_OUT'
  | 'ERROR'
type LiveWhatsAppProviderStatus = Exclude<WhatsAppProviderStatus, 'PROVIDER_UNAVAILABLE'>

export interface WhatsAppProviderState {
  status: WhatsAppProviderStatus
  persistence: 'PERSISTENCE_CONFIGURED' | 'PERSISTENCE_UNAVAILABLE'
  authenticated: boolean
  reason?: string
}

type StoredAuthState = {
  creds: AuthenticationCreds
  keys: Record<string, Record<string, unknown>>
}

type ProviderRegistry = Map<string, Promise<BaileysWhatsAppProvider>>
const registrySymbol = Symbol.for('befluent.whatsapp.provider-registry.v1')
const SESSION_LOCK_TTL_MS = 45_000
const SESSION_LOCK_RENEW_MS = 15_000

function getRegistry(): ProviderRegistry {
  const root = globalThis as unknown as Record<symbol, unknown>
  const current = root[registrySymbol]
  if (current instanceof Map) return current as ProviderRegistry
  const registry: ProviderRegistry = new Map()
  root[registrySymbol] = registry
  return registry
}

const silentLogger = {
  level: 'silent',
  trace() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
  child() { return this },
} as never

function isStoredAuthState(value: unknown): value is StoredAuthState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<StoredAuthState>
  return Boolean(candidate.creds && typeof candidate.creds === 'object'
    && candidate.keys && typeof candidate.keys === 'object')
}

function statusCodeFrom(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const output = (error as { output?: { statusCode?: unknown } }).output
  return typeof output?.statusCode === 'number' ? output.statusCode : undefined
}

function pause(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export class UnavailableWhatsAppProvider implements WhatsAppProvider {
  constructor(private readonly persistence: WhatsAppAuthPersistence = whatsappAuthPersistence()) {}

  async connect(): Promise<void> {
    throw new Error('WhatsApp provider unavailable: required configuration or persistence is missing')
  }
  async disconnect(): Promise<void> { return undefined }
  async getConnectionState(): Promise<WhatsAppAccount> {
    return { id: 'unavailable', status: 'DISCONNECTED' }
  }
  async sendMessage(input: WhatsAppMessageInput): Promise<WhatsAppMessageResult> {
    void input
    throw new Error('WhatsApp provider unavailable')
  }
  async sendMessages(inputs: WhatsAppMessageInput[]): Promise<WhatsAppMessageResult[]> {
    void inputs
    throw new Error('WhatsApp provider unavailable')
  }
  async getQRCode(): Promise<string | null> { return null }
  async handleIncomingMessage(payload: unknown): Promise<void> { void payload }
  async handleConnectionUpdate(payload: unknown): Promise<void> { void payload }
  state(): WhatsAppProviderState {
    return {
      status: 'PROVIDER_UNAVAILABLE',
      persistence: this.persistence.status,
      authenticated: false,
      reason: process.env.WHATSAPP_PROVIDER !== 'baileys'
        ? 'WHATSAPP_PROVIDER must be configured as baileys.'
        : 'Encrypted MongoDB auth persistence is not configured.',
    }
  }
}

export class BaileysWhatsAppProvider implements WhatsAppProvider {
  private socket?: WASocket
  private auth?: StoredAuthState
  private statusValue: LiveWhatsAppProviderStatus = 'DISCONNECTED'
  private reason?: string
  private qrPayload?: string
  private qrUpdatedAt = 0
  private connectPromise?: Promise<void>
  private persistQueue: Promise<void> = Promise.resolve()
  private sendQueue: Promise<unknown> = Promise.resolve()
  private lastSentAt = 0
  private loggingOut = false
  private persistenceFailed = false
  private readonly ownerToken = randomUUID()
  private leaseTimer?: ReturnType<typeof setInterval>
  private leaseActive = false
  private loggedOutStatusCode?: number

  constructor(
    readonly accountId: string,
    private readonly persistence: WhatsAppAuthPersistence,
  ) {}

  state(): WhatsAppProviderState {
    return {
      status: this.statusValue,
      persistence: this.persistence.status,
      authenticated: this.statusValue === 'CONNECTED' && !this.persistenceFailed,
      ...(this.reason ? { reason: this.reason } : {}),
    }
  }

  async getConnectionState(): Promise<WhatsAppAccount> {
    return { id: this.accountId, status: this.statusValue }
  }

  private markConnecting() {
    this.statusValue = 'CONNECTING'
    this.reason = undefined
  }

  async connect(): Promise<void> {
    if (this.persistence.status !== 'PERSISTENCE_CONFIGURED') {
      throw new Error('WhatsApp auth persistence is unavailable')
    }
    if (this.socket && ['CONNECTING', 'QR_REQUIRED', 'CONNECTED'].includes(this.statusValue)) return
    if (this.connectPromise) return this.connectPromise

    this.markConnecting()
    const attempt = this.startSocket()
    this.connectPromise = attempt
    try {
      await attempt
    } catch {
      this.socket = undefined
      if (this.leaseActive) {
        this.statusValue = 'ERROR'
        this.reason = this.persistenceFailed ? 'AUTH_PERSISTENCE_FAILED' : this.reason || 'PROVIDER_START_FAILED'
        await this.updateAccount('ERROR', this.reason)
        await this.releaseOwnership()
      } else if (this.statusValue !== 'ERROR') {
        this.statusValue = 'ERROR'
        this.reason = 'PROVIDER_START_FAILED'
      }
      throw new Error('WhatsApp provider failed to start')
    } finally {
      if (this.connectPromise === attempt) this.connectPromise = undefined
    }
  }

  private async startSocket(): Promise<void> {
    this.loggingOut = false
    this.persistenceFailed = false
    let acquired = false
    try {
      acquired = await this.persistence.acquireLock(this.accountId, this.ownerToken, SESSION_LOCK_TTL_MS)
    } catch {
      this.statusValue = 'ERROR'
      this.reason = 'SESSION_LOCK_UNAVAILABLE'
      throw new Error('WhatsApp session ownership could not be acquired')
    }
    if (!acquired) {
      this.statusValue = 'ERROR'
      this.reason = 'SESSION_IN_USE'
      throw new Error('WhatsApp session is active in another server process')
    }
    this.leaseActive = true
    this.startLeaseRenewal()
    this.statusValue = 'CONNECTING'
    this.reason = undefined
    await this.updateAccount('CONNECTING')
    if (this.state().status === 'ERROR') throw new Error('WhatsApp account state could not be updated')

    const baileys = await import('@whiskeysockets/baileys')
    this.loggedOutStatusCode = baileys.DisconnectReason.loggedOut
    const restored = await this.persistence.restore(this.accountId, this.ownerToken)
    this.auth = isStoredAuthState(restored)
      ? restored
      : { creds: baileys.initAuthCreds(), keys: {} }

    const keyStore: AuthenticationState['keys'] = {
      get: async (type, ids) => {
        const values: Record<string, SignalDataTypeMap[typeof type]> = {}
        const stored = this.auth?.keys[type] ?? {}
        for (const id of ids) {
          const value = stored[id]
          if (value !== undefined) values[id] = value as SignalDataTypeMap[typeof type]
        }
        return values
      },
      set: async (data: SignalDataSet) => {
        if (!this.auth) throw new Error('WhatsApp auth state is unavailable')
        for (const [type, entries] of Object.entries(data)) {
          if (!entries) continue
          const values = this.auth.keys[type] ?? (this.auth.keys[type] = {})
          for (const [id, value] of Object.entries(entries)) {
            if (value === null) delete values[id]
            else values[id] = value
          }
        }
        await this.persistAuth()
      },
    }

    const authState: AuthenticationState = { creds: this.auth.creds, keys: keyStore }
    const socket = baileys.makeWASocket({
      auth: authState,
      logger: silentLogger,
      printQRInTerminal: false,
      markOnlineOnConnect: false,
    })
    this.socket = socket
    socket.ev.on('creds.update', (update) => {
      if (!this.auth) return
      Object.assign(this.auth.creds, update)
      void this.persistAuth().catch(() => this.failPersistence())
    })
    socket.ev.on('connection.update', (update) => {
      void this.onSocketConnectionUpdate(update, socket)
    })
  }

  private async persistAuth(): Promise<void> {
    if (!this.auth) throw new Error('WhatsApp auth state is unavailable')
    const snapshot = JSON.parse(
      JSON.stringify(this.auth, WhatsAppBufferJSON.replacer),
      WhatsAppBufferJSON.reviver,
    ) as StoredAuthState
    const write = this.persistQueue.then(() => this.persistence.save(this.accountId, this.ownerToken, snapshot))
    this.persistQueue = write.catch(() => undefined)
    try {
      await write
    } catch {
      this.failPersistence()
      throw new Error('WhatsApp auth state could not be persisted')
    }
  }

  private failPersistence() {
    this.persistenceFailed = true
    this.socket?.end(new Error('WhatsApp auth persistence failed'))
    this.socket = undefined
    this.statusValue = 'ERROR'
    this.reason = 'AUTH_PERSISTENCE_FAILED'
    void this.releaseOwnership()
    void this.updateAccount('ERROR', this.reason)
  }

  private startLeaseRenewal() {
    if (this.leaseTimer) clearInterval(this.leaseTimer)
    this.leaseTimer = setInterval(() => {
      void this.persistence.renewLock(this.accountId, this.ownerToken, SESSION_LOCK_TTL_MS)
        .then((renewed) => {
          if (!renewed) this.failLease()
        })
        .catch(() => this.failLease())
    }, SESSION_LOCK_RENEW_MS)
    if (typeof this.leaseTimer.unref === 'function') this.leaseTimer.unref()
  }

  private stopLeaseRenewal() {
    if (this.leaseTimer) clearInterval(this.leaseTimer)
    this.leaseTimer = undefined
  }

  private async releaseOwnership() {
    this.stopLeaseRenewal()
    if (!this.leaseActive) return
    this.leaseActive = false
    try { await this.persistence.releaseLock(this.accountId, this.ownerToken) } catch {
      // The lease expires automatically if the database is unavailable.
    }
  }

  private failLease() {
    if (!this.leaseActive) return
    this.leaseActive = false
    this.stopLeaseRenewal()
    this.socket?.end(new Error('WhatsApp session ownership was lost'))
    this.socket = undefined
    this.statusValue = 'ERROR'
    this.reason = 'SESSION_OWNER_LOST'
    void this.updateAccount('ERROR', this.reason)
  }

  private async onSocketConnectionUpdate(
    update: { connection?: 'close' | 'connecting' | 'open'; qr?: string; lastDisconnect?: { error?: unknown } },
    socket: WASocket,
  ) {
    if (this.socket !== socket) return

    if (update.qr) {
      this.qrPayload = update.qr
      this.qrUpdatedAt = Date.now()
      this.statusValue = 'QR_REQUIRED'
      this.reason = undefined
      await this.updateAccount('QR_REQUIRED')
    }

    if (update.connection === 'connecting') {
      this.statusValue = 'CONNECTING'
      await this.updateAccount('CONNECTING')
    }

    if (update.connection === 'open') {
      this.qrPayload = undefined
      this.qrUpdatedAt = 0
      this.statusValue = 'CONNECTED'
      this.reason = undefined
      await this.updateAccount('CONNECTED')
    }

    if (update.connection === 'close') {
      this.socket = undefined
      this.qrPayload = undefined
      this.qrUpdatedAt = 0
      const loggedOut = this.loggingOut
        || statusCodeFrom(update.lastDisconnect?.error) === this.loggedOutStatusCode
      this.statusValue = loggedOut ? 'LOGGED_OUT' : 'ERROR'
      this.reason = loggedOut ? undefined : 'CONNECTION_CLOSED'
      if (loggedOut && !this.loggingOut) {
        await this.persistence.clear(this.accountId, this.ownerToken).catch(() => {
          this.statusValue = 'ERROR'
          this.reason = 'AUTH_PERSISTENCE_FAILED'
        })
      }
      await this.updateAccount(this.statusValue, this.reason)
      if (!this.loggingOut) await this.releaseOwnership()
    }
  }

  private async updateAccount(status: WhatsAppProviderStatus, reason?: string) {
    try {
      const { prisma } = await import('@/lib/prisma')
      const result = await prisma.whatsAppAccount.updateMany({
        where: { id: this.accountId },
        data: {
          status,
          authPersistenceStatus: this.persistence.status,
          lastError: reason ?? null,
          ...(status === 'CONNECTED'
            ? { lastConnectedAt: new Date(), reconnectAttempts: 0 }
            : {}),
        },
      })
      if (result.count !== 1) throw new Error('WhatsApp account state update failed')
    } catch {
      this.statusValue = 'ERROR'
      this.reason = 'ACCOUNT_STATE_UNAVAILABLE'
    }
  }

  async disconnect(): Promise<void> {
    if (!this.leaseActive) {
      const acquired = await this.persistence.acquireLock(this.accountId, this.ownerToken, SESSION_LOCK_TTL_MS)
      if (!acquired) throw new Error('WhatsApp session is active in another server process')
      this.leaseActive = true
      this.startLeaseRenewal()
    }
    if (!this.socket) {
      try {
        await this.connect()
        const deadline = Date.now() + 20_000
        while (this.statusValue === 'CONNECTING' && Date.now() < deadline) await pause(200)
      } catch {
        // An explicit admin logout can clear an unreadable or stale auth record.
        if (!this.leaseActive) {
          const acquired = await this.persistence.acquireLock(this.accountId, this.ownerToken, SESSION_LOCK_TTL_MS)
          if (!acquired) throw new Error('WhatsApp session is active in another server process')
          this.leaseActive = true
          this.startLeaseRenewal()
        }
      }
    }
    this.loggingOut = true
    const socket = this.socket
    this.socket = undefined
    this.qrPayload = undefined
    this.qrUpdatedAt = 0
    if (socket) {
      if (this.statusValue === 'CONNECTED') {
        try { await socket.logout() } catch { /* Logout state is finalized below. */ }
      }
      try { socket.end(undefined) } catch { /* The socket may already be closed. */ }
    }
    await this.persistence.clear(this.accountId, this.ownerToken)
    this.statusValue = 'LOGGED_OUT'
    this.reason = undefined
    await this.updateAccount('LOGGED_OUT')
    await this.releaseOwnership()
  }

  async stop(): Promise<void> {
    const socket = this.socket
    this.socket = undefined
    this.qrPayload = undefined
    this.qrUpdatedAt = 0
    if (socket) {
      try { socket.end(undefined) } catch { /* The process is stopping. */ }
    }
    if (this.leaseActive) {
      this.statusValue = 'RECONNECTING'
      this.reason = 'SERVER_RESTART'
      await this.updateAccount('RECONNECTING', this.reason)
      await this.releaseOwnership()
    }
  }

  async getQRCode(): Promise<string | null> {
    if (this.statusValue !== 'QR_REQUIRED' || !this.qrPayload || Date.now() - this.qrUpdatedAt > 60_000) return null
    return this.qrPayload
  }

  async sendMessage(input: WhatsAppMessageInput): Promise<WhatsAppMessageResult> {
    const operation = this.sendQueue.then(async () => {
      await this.ensureConnected()
      const digits = input.to.replace(/\D/g, '')
      if (digits.length < 7 || digits.length > 15) {
        throw new Error('WhatsApp destination phone number is invalid')
      }
      const wait = WHATSAPP_MIN_OUTGOING_INTERVAL_MS - (Date.now() - this.lastSentAt)
      if (wait > 0) await pause(wait)
      const socket = this.socket
      if (!socket || this.statusValue !== 'CONNECTED') {
        throw new Error('WhatsApp account is not connected')
      }
      const result = await socket.sendMessage(`${digits}@s.whatsapp.net`, { text: input.body })
      this.lastSentAt = Date.now()
      return { providerMessageId: result?.key?.id || undefined, queued: false }
    })
    this.sendQueue = operation.catch(() => undefined)
    return operation
  }

  async sendMessages(inputs: WhatsAppMessageInput[]): Promise<WhatsAppMessageResult[]> {
    const results: WhatsAppMessageResult[] = []
    for (const input of inputs) results.push(await this.sendMessage(input))
    return results
  }

  async handleIncomingMessage(payload: unknown): Promise<void> {
    void payload
  }

  async handleConnectionUpdate(payload: unknown): Promise<void> {
    void payload
  }

  private async ensureConnected(): Promise<void> {
    if (this.statusValue !== 'CONNECTED') await this.connect()
    const deadline = Date.now() + 20_000
    while (Date.now() < deadline) {
      if (this.statusValue === 'CONNECTED' && this.socket) return
      if (this.statusValue === 'QR_REQUIRED' || this.statusValue === 'LOGGED_OUT' || this.statusValue === 'ERROR') {
        throw new Error('WhatsApp account is not connected')
      }
      await pause(200)
    }
    throw new Error('WhatsApp account connection timed out')
  }
}

export async function whatsappProviderStatus(): Promise<WhatsAppProviderState> {
  const persistence = whatsappAuthPersistence()
  if (process.env.WHATSAPP_PROVIDER !== 'baileys' || persistence.status !== 'PERSISTENCE_CONFIGURED') {
    return new UnavailableWhatsAppProvider(persistence).state()
  }

  const providers = await Promise.all(getRegistry().values())
  const states = providers.map((provider) => provider.state())
  const priority: LiveWhatsAppProviderStatus[] = [
    'CONNECTED',
    'QR_REQUIRED',
    'CONNECTING',
    'RECONNECTING',
    'ERROR',
    'LOGGED_OUT',
    'DISCONNECTED',
  ]
  const activeState = priority
    .map((status) => states.find((state) => state.status === status))
    .find((state) => state !== undefined)
  if (activeState) return activeState

  return {
    status: 'DISCONNECTED',
    persistence: 'PERSISTENCE_CONFIGURED',
    authenticated: false,
  }
}

export async function createWhatsAppProvider(accountId: string): Promise<WhatsAppProvider> {
  const persistence = whatsappAuthPersistence()
  if (process.env.WHATSAPP_PROVIDER !== 'baileys' || persistence.status !== 'PERSISTENCE_CONFIGURED') {
    return new UnavailableWhatsAppProvider(persistence)
  }
  if (!accountId) return new UnavailableWhatsAppProvider(persistence)

  const registry = getRegistry()
  const existing = registry.get(accountId)
  if (existing) return existing

  const creating = Promise.resolve(new BaileysWhatsAppProvider(accountId, persistence))
  registry.set(accountId, creating)
  return creating
}

export async function closeWhatsAppProviders(): Promise<void> {
  const registry = getRegistry()
  const providers = await Promise.all(registry.values())
  await Promise.all(providers.map((provider) => provider.stop()))
  registry.clear()
}

export function isGroupChatJid(jid: string) {
  return jid.endsWith('@g.us') || jid.includes('-')
}