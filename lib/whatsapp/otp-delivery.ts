import { prisma } from '@/lib/prisma'
import type { VerificationCodeMessage } from '@/lib/auth/providers'
import { createWhatsAppProvider, whatsappProviderStatus } from './provider'

/**
 * Sends OTPs directly through the explicitly selected Baileys account.
 * OTP bodies are never written to the CRM message history or delivery queue.
 */
export async function sendWhatsAppOtp(
  message: VerificationCodeMessage,
): Promise<{ providerMessageId?: string }> {
  if (!message.phone) throw new Error('WhatsApp phone number is required')
  if ((await whatsappProviderStatus()).status === 'PROVIDER_UNAVAILABLE') {
    throw new Error('WhatsApp OTP delivery is unavailable')
  }

  const senders = await prisma.whatsAppAccount.findMany({
    where: { provider: 'BAILEYS', isOtpSender: true },
    select: { id: true },
    take: 2,
  })
  if (senders.length !== 1) throw new Error('WhatsApp OTP sender is unavailable')

  try {
    const provider = await createWhatsAppProvider(senders[0].id)
    const result = await provider.sendMessage({
      to: message.phone,
      body: `Your Be Fluent verification code is ${message.code}. It expires in ${Math.max(1, Math.ceil(message.expiresInSeconds / 60))} minutes. Do not share this code.`,
    })
    return { providerMessageId: result.providerMessageId }
  } catch {
    // Keep provider errors, OTPs, and phone numbers out of authentication logs.
    throw new Error('WhatsApp OTP delivery failed')
  }
}