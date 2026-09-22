import type { WhatsAppAccount, WhatsAppMessageInput, WhatsAppMessageResult, WhatsAppProvider } from '@/lib/whatsapp'
import { whatsappAuthPersistence, type WhatsAppAuthPersistence } from './persistence'

export type WhatsAppProviderStatus =
  | 'PROVIDER_UNAVAILABLE'
  | 'DISCONNECTED'
  | 'QR_REQUIRED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'LOGGED_OUT'
  | 'ERROR'

export interface WhatsAppProviderState {
  status: WhatsAppProviderStatus
  persistence: 'PERSISTENCE_CONFIGURED' | 'PERSISTENCE_UNAVAILABLE'
  authenticated: boolean
  reason?: string
}

export class UnavailableWhatsAppProvider implements WhatsAppProvider {
  constructor(private readonly persistence: WhatsAppAuthPersistence = whatsappAuthPersistence()) {}

  async connect(): Promise<void> {
    throw new Error('WhatsApp provider unavailable: persistent auth storage is not configured')
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
  async handleIncomingMessage(payload: unknown): Promise<void> { void payload; return undefined }
  async handleConnectionUpdate(payload: unknown): Promise<void> { void payload; return undefined }

  state(): WhatsAppProviderState {
    return {
      status: 'PROVIDER_UNAVAILABLE',
      persistence: this.persistence.status,
      authenticated: false,
      reason: 'A production-safe persistent auth store is not configured.',
    }
  }
}

/**
 * This is the only future Baileys construction boundary. It intentionally
 * refuses to import or initialize Baileys while auth persistence is absent.
 */
export async function createWhatsAppProvider() {
  const persistence = whatsappAuthPersistence()
  if (persistence.status !== 'PERSISTENCE_CONFIGURED') {
    return new UnavailableWhatsAppProvider(persistence)
  }
  // This branch is unreachable with the current deployment. A configured
  // encrypted persistence implementation may safely initialize Baileys here.
  const baileys = await import('@whiskeysockets/baileys')
  void baileys
  return new UnavailableWhatsAppProvider(persistence)
}

export function whatsappProviderStatus() {
  return new UnavailableWhatsAppProvider().state()
}

export function isGroupChatJid(jid: string) {
  return jid.endsWith('@g.us') || jid.includes('-')
}