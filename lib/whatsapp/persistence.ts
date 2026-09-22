export type WhatsAppAuthPersistenceStatus =
  | 'PERSISTENCE_CONFIGURED'
  | 'PERSISTENCE_UNAVAILABLE'

export interface WhatsAppAuthPersistence {
  readonly status: WhatsAppAuthPersistenceStatus
  restore(): Promise<unknown | null>
  save(state: unknown): Promise<void>
  clear(): Promise<void>
}

/**
 * Baileys credentials must never be placed on the ephemeral application
 * filesystem. Until a production-safe encrypted store is configured, all
 * operations remain explicitly unavailable.
 */
export class UnavailableWhatsAppAuthPersistence implements WhatsAppAuthPersistence {
  readonly status = 'PERSISTENCE_UNAVAILABLE' as const

  async restore() { return null }
  async save() {
    throw new Error('WhatsApp auth persistence is unavailable')
  }
  async clear() { return undefined }
}

export function whatsappAuthPersistence(): WhatsAppAuthPersistence {
  return new UnavailableWhatsAppAuthPersistence()
}