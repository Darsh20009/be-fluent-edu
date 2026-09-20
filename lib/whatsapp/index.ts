export interface WhatsAppAccount {
  id: string
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
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
 * Baileys is intentionally not imported here. This boundary lets the future
 * provider be added without coupling CRM authorization to student sessions.
 */
export const WHATSAPP_MIN_OUTGOING_INTERVAL_MS = 3000
