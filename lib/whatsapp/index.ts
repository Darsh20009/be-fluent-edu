export interface WhatsAppAccount {
  id: string
  status: 'DISCONNECTED' | 'QR_REQUIRED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'LOGGED_OUT' | 'ERROR'
  phoneNumber?: string
}

export interface WhatsAppMessageInput {
  to: string
  body: string
  correlationId?: string
}

export interface WhatsAppMessageResult {
  providerMessageId?: string
  queued: boolean
}

export interface WhatsAppProvider {
  state(): {
    status: WhatsAppAccount['status'] | 'PROVIDER_UNAVAILABLE'
    persistence: 'PERSISTENCE_CONFIGURED' | 'PERSISTENCE_UNAVAILABLE'
    authenticated: boolean
    reason?: string
  }
  connect(): Promise<void>
  disconnect(): Promise<void>
  getConnectionState(): Promise<WhatsAppAccount>
  sendMessage(input: WhatsAppMessageInput): Promise<WhatsAppMessageResult>
  sendMessages(inputs: WhatsAppMessageInput[]): Promise<WhatsAppMessageResult[]>
  getQRCode(): Promise<string | null>
  handleIncomingMessage(payload: unknown): Promise<void>
  handleConnectionUpdate(payload: unknown): Promise<void>
}

export interface WhatsAppQueue {
  enqueue(input: WhatsAppMessageInput): Promise<{ jobId: string }>
  processNext(): Promise<void>
}

/**
 * Baileys is intentionally lazy-loaded only after a persistent auth store has
 * been configured. This boundary keeps CRM authorization separate from auth.
 */
export const WHATSAPP_MIN_OUTGOING_INTERVAL_MS = 3000
