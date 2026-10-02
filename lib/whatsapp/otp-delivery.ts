import { prisma } from '@/lib/prisma'
import type { VerificationCodeMessage } from '@/lib/auth/providers'
import { createWhatsAppProvider, whatsappProviderStatus } from './provider'

export type WhatsAppOtpDeliveryReason =
  | 'PROVIDER_UNAVAILABLE'
  | 'SENDER_NOT_CONFIGURED'
  | 'MULTIPLE_SENDERS'
  | 'SESSION_IN_USE'
  | 'SEND_FAILED'

export class WhatsAppOtpDeliveryError extends Error {
  constructor(public readonly reason: WhatsAppOtpDeliveryReason) {
    super('WhatsApp verification delivery is unavailable')
    this.name = 'WhatsAppOtpDeliveryError'
  }
}

/**
 * Sends OTPs directly through the explicitly selected Baileys account.
 * OTP bodies are never written to the CRM message history or delivery queue.
 */
export async function sendWhatsAppOtp(
  message: VerificationCodeMessage,
): Promise<{ providerMessageId?: string }> {
  if (!message.phone) throw new Error('WhatsApp phone number is required')
  if ((await whatsappProviderStatus()).status === 'PROVIDER_UNAVAILABLE') {
    throw new WhatsAppOtpDeliveryError('PROVIDER_UNAVAILABLE')
  }

  const senders = await prisma.whatsAppAccount.findMany({
    where: { provider: 'BAILEYS', isOtpSender: true },
    select: { id: true },
    take: 2,
  })
  if (senders.length === 0) throw new WhatsAppOtpDeliveryError('SENDER_NOT_CONFIGURED')
  if (senders.length > 1) throw new WhatsAppOtpDeliveryError('MULTIPLE_SENDERS')

  try {
    const provider = await createWhatsAppProvider(senders[0].id)
    const result = await provider.sendMessage({
      to: message.phone,
      body: `Your Be Fluent verification code is ${message.code}. It expires in ${Math.max(1, Math.ceil(message.expiresInSeconds / 60))} minutes. Do not share this code.`,
    })
    return { providerMessageId: result.providerMessageId }
  } catch (error) {
    // Keep provider errors, OTPs, and phone numbers out of authentication logs.
    const reason = error instanceof Error && /active in another server process|session_in_use/i.test(error.message)
      ? 'SESSION_IN_USE'
      : 'SEND_FAILED'
    throw new WhatsAppOtpDeliveryError(reason)
  }
}