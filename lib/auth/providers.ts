import { sendEmail } from '@/lib/email'

export type OtpDeliveryChannel = 'WHATSAPP' | 'EMAIL'

export interface VerificationCodeMessage {
  phone?: string
  email?: string
  code: string
  expiresInSeconds: number
}

export interface OtpDeliveryProvider {
  readonly channel: OtpDeliveryChannel
  sendVerificationCode(message: VerificationCodeMessage): Promise<{ providerMessageId?: string }>
}

class TestOtpProvider implements OtpDeliveryProvider {
  constructor(public readonly channel: OtpDeliveryChannel) {}

  async sendVerificationCode(message: VerificationCodeMessage) {
    // Explicit test mode never calls an external provider and never logs the
    // code. Tests can inject a provider directly into the service.
    void message
    return { providerMessageId: `test-${this.channel.toLowerCase()}` }
  }
}

class WhatsAppOtpProvider implements OtpDeliveryProvider {
  readonly channel = 'WHATSAPP' as const

  async sendVerificationCode(message: VerificationCodeMessage) {
    const endpoint = process.env.WHATSAPP_OTP_PROVIDER_URL
    if (!endpoint) {
      throw new Error('WhatsApp OTP provider is not configured')
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.WHATSAPP_OTP_PROVIDER_TOKEN
          ? { Authorization: `Bearer ${process.env.WHATSAPP_OTP_PROVIDER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        to: message.phone,
        code: message.code,
        expiresInSeconds: message.expiresInSeconds,
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp OTP provider returned ${response.status}`)
    }

    const payload = (await response.json().catch(() => ({}))) as {
      messageId?: string
      id?: string
    }
    return { providerMessageId: payload.messageId || payload.id }
  }
}

class EmailOtpProvider implements OtpDeliveryProvider {
  readonly channel = 'EMAIL' as const

  async sendVerificationCode(message: VerificationCodeMessage) {
    if (!message.email) {
      throw new Error('Email is required for email OTP')
    }

    const result = await sendEmail({
      to: message.email,
      subject: 'Be Fluent verification code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2>Be Fluent verification code</h2>
          <p>Your verification code expires in ${Math.floor(message.expiresInSeconds / 60)} minutes.</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:6px">${message.code}</p>
        </div>
      `,
    })

    if (!result.success) {
      throw new Error('Email OTP provider failed')
    }

    return { providerMessageId: 'smtp2go' }
  }
}

export function getOtpDeliveryProvider(
  channel: OtpDeliveryChannel,
): OtpDeliveryProvider {
  if (process.env.NODE_ENV !== 'production' && process.env.AUTH_OTP_TEST_MODE === 'true') {
    return new TestOtpProvider(channel)
  }

  return channel === 'EMAIL'
    ? new EmailOtpProvider()
    : new WhatsAppOtpProvider()
}