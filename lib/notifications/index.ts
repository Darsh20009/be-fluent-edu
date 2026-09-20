export const NOTIFICATION_CHANNELS = ['IN_APP', 'WHATSAPP', 'EMAIL'] as const
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

export const NOTIFICATION_EVENTS = [
  'class.scheduled',
  'class.starting',
  'class.ended',
  'feedback.published',
  'homework.assigned',
  'homework.reviewed',
  'subscription.approved',
  'group.assigned',
  'account.important',
  'whatsapp.critical',
] as const
export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number]

export interface NotificationMessage {
  event: NotificationEvent
  recipientUserId: string
  channels: NotificationChannel[]
  title: string
  body: string
  metadata?: Record<string, string>
}

export interface NotificationTransport {
  send(message: NotificationMessage, channel: NotificationChannel): Promise<void>
}

export class NotificationService {
  constructor(private readonly transports: Partial<Record<NotificationChannel, NotificationTransport>>) {}

  async publish(message: NotificationMessage): Promise<void> {
    for (const channel of message.channels) {
      const transport = this.transports[channel]
      if (!transport) {
        throw new Error(`Notification transport is not configured: ${channel}`)
      }
      await transport.send(message, channel)
    }
  }
}
