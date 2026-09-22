import { WHATSAPP_MIN_OUTGOING_INTERVAL_MS, type WhatsAppMessageInput, type WhatsAppMessageResult, type WhatsAppProvider } from '@/lib/whatsapp'

export const WHATSAPP_MAX_ATTEMPTS = 3

type QueueEntry = {
  accountId: string
  dedupeKey: string
  input: WhatsAppMessageInput
  attempts: number
  availableAt: number
}

/**
 * In-process pacing is only a pure queue policy. Durable delivery state is
 * represented by WhatsAppQueue rows when MongoDB is available.
 */
export class WhatsAppSequentialQueue {
  private readonly entries = new Map<string, QueueEntry>()
  private readonly nextSendAt = new Map<string, number>()
  private readonly inFlight = new Set<string>()

  constructor(private readonly now: () => number = () => Date.now()) {}

  enqueue(accountId: string, input: WhatsAppMessageInput, dedupeKey: string) {
    if (this.entries.has(dedupeKey)) return { accepted: false, reason: 'DUPLICATE' as const }
    this.entries.set(dedupeKey, { accountId, dedupeKey, input, attempts: 0, availableAt: this.now() })
    return { accepted: true, reason: 'QUEUED' as const }
  }

  next(accountId: string) {
    const currentTime = this.now()
    const entry = [...this.entries.values()]
      .filter((item) => item.accountId === accountId)
      .filter((item) => item.availableAt <= currentTime)
      .sort((left, right) => left.availableAt - right.availableAt)[0]
    if (!entry) return null
    const accountNextSendAt = this.nextSendAt.get(accountId) || 0
    if (accountNextSendAt > currentTime) return null
    return entry
  }

  async processNext(accountId: string, provider: WhatsAppProvider): Promise<WhatsAppMessageResult | null> {
    if (this.inFlight.has(accountId)) return null
    const entry = this.next(accountId)
    if (!entry) return null
    this.inFlight.add(accountId)
    entry.attempts += 1
    try {
      const result = await provider.sendMessage(entry.input)
      this.entries.delete(entry.dedupeKey)
      this.nextSendAt.set(accountId, this.now() + WHATSAPP_MIN_OUTGOING_INTERVAL_MS)
      return result
    } catch (error) {
      if (entry.attempts >= WHATSAPP_MAX_ATTEMPTS) this.entries.delete(entry.dedupeKey)
      else entry.availableAt = this.now() + WHATSAPP_MIN_OUTGOING_INTERVAL_MS
      throw error
    } finally {
      this.inFlight.delete(accountId)
    }
  }

  size() { return this.entries.size }
}