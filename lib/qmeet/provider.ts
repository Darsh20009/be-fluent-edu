import { z } from 'zod'
import { isValidQMeetBaseUrl, QMeetClient, type CreateMeetingInput } from './index'

const httpsUrlSchema = z.string().url().refine((value) => new URL(value).protocol === 'https:', {
  message: 'QMeet URLs must use HTTPS',
})

export const qmeetMeetingResponseSchema = z.object({
  roomName: z.string().trim().min(1),
  title: z.string().optional(),
  joinUrl: httpsUrlSchema,
  hostUrl: httpsUrlSchema.optional(),
  id: z.string().optional(),
  meetingId: z.string().optional(),
  status: z.string().optional(),
}).passthrough()

export type ValidatedQMeetMeeting = z.infer<typeof qmeetMeetingResponseSchema>

export interface QMeetProvider {
  isConfigured(): boolean
  createMeeting(input: CreateMeetingInput): Promise<ValidatedQMeetMeeting>
  getMeeting(roomName: string): Promise<ValidatedQMeetMeeting>
  deleteMeeting(roomName: string): Promise<void>
}

export class QMeetClientProvider implements QMeetProvider {
  constructor(private readonly client = new QMeetClient()) {}

  isConfigured() {
    return Boolean(process.env.QMEET_API_KEY && isValidQMeetBaseUrl(process.env.QMEET_API_BASE_URL || ''))
  }

  async createMeeting(input: CreateMeetingInput) {
    return qmeetMeetingResponseSchema.parse(await this.client.createMeeting(input))
  }

  async getMeeting(roomName: string) {
    return qmeetMeetingResponseSchema.parse(await this.client.getMeeting(roomName))
  }

  deleteMeeting(roomName: string) {
    return this.client.deleteMeeting(roomName)
  }
}