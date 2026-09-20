import { AppError } from '@/lib/errors'

export interface QMeetMeeting {
  roomName: string
  title?: string
  hostUserId?: string
  startTime?: string
  endTime?: string
  joinUrl?: string
  [key: string]: unknown
}

export interface CreateMeetingInput {
  roomName?: string
  title?: string
  startTime?: string
  endTime?: string
}

export interface QMeetClientOptions {
  apiKey?: string
  baseUrl?: string
  fetcher?: typeof fetch
}

export class QMeetClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetcher: typeof fetch

  constructor(options: QMeetClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.QMEET_API_KEY || ''
    this.baseUrl = options.baseUrl || process.env.QMEET_API_BASE_URL || ''
    this.fetcher = options.fetcher || fetch
  }

  private assertConfigured(): void {
    if (!this.apiKey || !this.baseUrl) {
      throw new AppError(
        'CONFIGURATION_ERROR',
        'QMeet is not configured.',
        503,
      )
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    this.assertConfigured()
    const response = await this.fetcher(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-qmeet-api-key': this.apiKey,
        ...init?.headers,
      },
    })

    if (!response.ok) {
      throw new AppError('BUSINESS_RULE', 'QMeet request failed.', response.status)
    }

    return (await response.json()) as T
  }

  createMeeting(input: CreateMeetingInput): Promise<QMeetMeeting> {
    return this.request<QMeetMeeting>('/api/qmeet/v1/meetings', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  listMeetings(): Promise<QMeetMeeting[]> {
    return this.request<QMeetMeeting[]>('/api/qmeet/v1/meetings')
  }

  getMeeting(roomName: string): Promise<QMeetMeeting> {
    return this.request<QMeetMeeting>(
      `/api/qmeet/v1/meetings/${encodeURIComponent(roomName)}`,
    )
  }

  async deleteMeeting(roomName: string): Promise<void> {
    await this.request(`/api/qmeet/v1/meetings/${encodeURIComponent(roomName)}`, {
      method: 'DELETE',
    })
  }
}
