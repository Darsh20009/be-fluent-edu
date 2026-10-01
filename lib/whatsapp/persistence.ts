import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from 'node:crypto'

export const WhatsAppBufferJSON = {
  replacer: (_key: string, value: unknown) => {
    const candidate = value as { type?: unknown; data?: unknown } | null
    if (Buffer.isBuffer(value) || value instanceof Uint8Array || candidate?.type === 'Buffer') {
      return { type: 'Buffer', data: Buffer.from(candidate?.data as ArrayLike<number> || value as Uint8Array).toString('base64') }
    }
    return value
  },
  reviver: (_key: string, value: unknown) => {
    const candidate = value as { type?: unknown; data?: unknown } | null
    if (candidate?.type === 'Buffer' && typeof candidate.data === 'string') {
      return Buffer.from(candidate.data, 'base64')
    }
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const keys = Object.keys(candidate)
      if (keys.length > 0 && keys.every((key) => !Number.isNaN(Number.parseInt(key, 10)))) {
        const values = Object.values(candidate)
        if (values.every((item) => typeof item === 'number')) return Buffer.from(values)
      }
    }
    return value
  },
}

export type WhatsAppAuthPersistenceStatus =
  | 'PERSISTENCE_CONFIGURED'
  | 'PERSISTENCE_UNAVAILABLE'

export interface WhatsAppAuthPersistence {
  readonly status: WhatsAppAuthPersistenceStatus
  acquireLock(accountId: string, ownerToken: string, ttlMs: number): Promise<boolean>
  renewLock(accountId: string, ownerToken: string, ttlMs: number): Promise<boolean>
  releaseLock(accountId: string, ownerToken: string): Promise<void>
  restore(accountId: string, ownerToken: string): Promise<unknown | null>
  save(accountId: string, ownerToken: string, state: unknown): Promise<void>
  clear(accountId: string, ownerToken: string): Promise<void>
}

interface EncryptedStateDocument {
  _id: string
  version: number
  iv: string
  tag: string
  ciphertext: string
}

const COLLECTION = 'WhatsAppAuthState'
const CIPHER_VERSION = 1
const AAD_PREFIX = 'be-fluent-whatsapp-auth-v1:'

function configured(): boolean {
  return process.env.WHATSAPP_PROVIDER === 'baileys'
    && process.env.PHASE5_DATABASE_ENABLED === 'true'
    && Boolean(process.env.SESSION_SECRET)
}

function deriveKey(secret: string, accountId: string): Buffer {
  return Buffer.from(hkdfSync(
    'sha256',
    Buffer.from(secret, 'utf8'),
    Buffer.from('be-fluent-session-secret-v1', 'utf8'),
    Buffer.from(`whatsapp-baileys:${accountId}`, 'utf8'),
    32,
  ))
}

function lockFingerprint(ownerToken: string): string {
  return createHash('sha256').update(ownerToken).digest('hex')
}

function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as {
    code?: unknown
    message?: unknown
    meta?: { code?: unknown; message?: unknown }
  }
  return candidate.code === 11000
    || String(candidate.meta?.code) === '11000'
    || (typeof candidate.message === 'string' && candidate.message.includes('E11000'))
    || (typeof candidate.meta?.message === 'string' && candidate.meta.message.includes('E11000'))
}

export function encryptWhatsAppAuthState(
  accountId: string,
  state: unknown,
  secret = process.env.SESSION_SECRET,
): Omit<EncryptedStateDocument, '_id'> {
  if (!secret) throw new Error('WhatsApp auth encryption is unavailable')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret, accountId), iv)
  cipher.setAAD(Buffer.from(`${AAD_PREFIX}${accountId}`, 'utf8'))
  const plaintext = Buffer.from(JSON.stringify(state, WhatsAppBufferJSON.replacer), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  return {
    version: CIPHER_VERSION,
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  }
}

export function decryptWhatsAppAuthState(
  document: Omit<EncryptedStateDocument, '_id'>,
  accountId: string,
  secret = process.env.SESSION_SECRET,
): unknown {
  if (!secret || document.version !== CIPHER_VERSION) {
    throw new Error('WhatsApp auth state cannot be decrypted')
  }

  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      deriveKey(secret, accountId),
      Buffer.from(document.iv, 'base64'),
    )
    decipher.setAAD(Buffer.from(`${AAD_PREFIX}${accountId}`, 'utf8'))
    decipher.setAuthTag(Buffer.from(document.tag, 'base64'))
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(document.ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8')
    return JSON.parse(plaintext, WhatsAppBufferJSON.reviver)
  } catch {
    throw new Error('WhatsApp auth state cannot be decrypted')
  }
}

/**
 * The auth payload is encrypted before it reaches MongoDB. The key is derived
 * with HKDF from the existing server-only session secret and scoped per account.
 * No auth files are written to the deployment's ephemeral filesystem.
 */
export class MongoWhatsAppAuthPersistence implements WhatsAppAuthPersistence {
  readonly status = configured()
    ? 'PERSISTENCE_CONFIGURED' as const
    : 'PERSISTENCE_UNAVAILABLE' as const

  private assertConfigured() {
    if (this.status !== 'PERSISTENCE_CONFIGURED') {
      throw new Error('WhatsApp auth persistence is unavailable')
    }
  }

  async acquireLock(accountId: string, ownerToken: string, ttlMs: number): Promise<boolean> {
    this.assertConfigured()
    const { prisma } = await import('@/lib/prisma')
    const fingerprint = lockFingerprint(ownerToken)
    try {
      const result = await prisma.$runCommandRaw({
        findAndModify: COLLECTION,
        query: {
          _id: accountId,
          $or: [
            { ownerToken: fingerprint },
            { ownerUntilMs: { $exists: false } },
            { ownerUntilMs: { $lte: Date.now() } },
          ],
        },
        update: { $set: { ownerToken: fingerprint, ownerUntilMs: Date.now() + ttlMs } },
        upsert: true,
        new: true,
      }) as unknown as { value?: unknown }
      return result.value !== null && result.value !== undefined
    } catch (error) {
      // A conflicting owner causes the upsert to hit the collection's _id index.
      // Database failures must remain distinguishable from a healthy competing owner.
      if (isDuplicateKeyError(error)) return false
      throw new Error('WhatsApp session lock could not be acquired')
    }
  }

  async renewLock(accountId: string, ownerToken: string, ttlMs: number): Promise<boolean> {
    this.assertConfigured()
    const { prisma } = await import('@/lib/prisma')
    const fingerprint = lockFingerprint(ownerToken)
    const result = await prisma.$runCommandRaw({
      update: COLLECTION,
      updates: [{
        q: { _id: accountId, ownerToken: fingerprint },
        u: { $set: { ownerUntilMs: Date.now() + ttlMs } },
        upsert: false,
      }],
    }) as unknown as { n?: number }
    return result.n === 1
  }

  async releaseLock(accountId: string, ownerToken: string): Promise<void> {
    this.assertConfigured()
    const { prisma } = await import('@/lib/prisma')
    const fingerprint = lockFingerprint(ownerToken)
    await prisma.$runCommandRaw({
      update: COLLECTION,
      updates: [{
        q: { _id: accountId, ownerToken: fingerprint },
        u: { $unset: { ownerToken: '', ownerUntilMs: '' } },
        upsert: false,
      }],
    })
  }

  async restore(accountId: string, ownerToken: string): Promise<unknown | null> {
    this.assertConfigured()
    const { prisma } = await import('@/lib/prisma')
    const fingerprint = lockFingerprint(ownerToken)
    const result = await prisma.$runCommandRaw({
      find: COLLECTION,
      filter: { _id: accountId, ownerToken: fingerprint },
      limit: 1,
    }) as unknown as { cursor?: { firstBatch?: EncryptedStateDocument[] } }
    const document = result.cursor?.firstBatch?.[0]
    if (!document || !document.ciphertext) return null

    return decryptWhatsAppAuthState(document, accountId)
  }

  async save(accountId: string, ownerToken: string, state: unknown): Promise<void> {
    this.assertConfigured()
    const encrypted = encryptWhatsAppAuthState(accountId, state)
    const { prisma } = await import('@/lib/prisma')
    const fingerprint = lockFingerprint(ownerToken)
    const result = await prisma.$runCommandRaw({
      update: COLLECTION,
      updates: [{
        q: { _id: accountId, ownerToken: fingerprint },
        u: { $set: encrypted },
        upsert: false,
      }],
    }) as unknown as { n?: number }
    if (result.n !== 1) throw new Error('WhatsApp auth state owner lock was lost')
  }

  async clear(accountId: string, ownerToken: string): Promise<void> {
    this.assertConfigured()
    const { prisma } = await import('@/lib/prisma')
    const fingerprint = lockFingerprint(ownerToken)
    const result = await prisma.$runCommandRaw({
      update: COLLECTION,
      updates: [{
        q: { _id: accountId, ownerToken: fingerprint },
        u: { $unset: { version: '', iv: '', tag: '', ciphertext: '' } },
        upsert: false,
      }],
    }) as unknown as { n?: number }
    if (result.n !== 1) throw new Error('WhatsApp auth state owner lock was lost')
  }

}

export class UnavailableWhatsAppAuthPersistence implements WhatsAppAuthPersistence {
  readonly status = 'PERSISTENCE_UNAVAILABLE' as const

  async acquireLock() { return false }
  async renewLock() { return false }
  async releaseLock() { return undefined }
  async restore() { return null }
  async save() {
    throw new Error('WhatsApp auth persistence is unavailable')
  }
  async clear() { return undefined }
}

export function whatsappAuthPersistence(): WhatsAppAuthPersistence {
  return configured()
    ? new MongoWhatsAppAuthPersistence()
    : new UnavailableWhatsAppAuthPersistence()
}