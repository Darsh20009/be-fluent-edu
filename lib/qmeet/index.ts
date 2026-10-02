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
  scheduledAt?: string
  durationMinutes?: number
  startTime?: string
  endTime?: string
}

export interface QMeetClientOptions {
  apiKey?: string
  baseUrl?: string
  fetcher?: typeof fetch
}

export function isValidQMeetBaseUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && Boolean(url.hostname)
      && !url.username && !url.password && !url.search && !url.hash
  } catch {
    return false
  }
}

export function qmeetCreatePayload(input: CreateMeetingInput) {
  const scheduledAt = input.scheduledAt ?? input.startTime
  const start = scheduledAt === undefined ? undefined : new Date(scheduledAt)
  if (start && Number.isNaN(start.valueOf())) {
    throw new AppError('VALIDATION_ERROR', 'QMeet requires a valid scheduled time.', 400)
  }
  let durationMinutes = input.durationMinutes
  if (durationMinutes === undefined && input.endTime !== undefined) {
    const end = new Date(input.endTime)
    if (!start || Number.isNaN(end.valueOf()) || end.valueOf() <= start.valueOf()) {
      throw new AppError('VALIDATION_ERROR', 'QMeet requires an end time after its start time.', 400)
    }
    durationMinutes = Math.ceil((end.valueOf() - start.valueOf()) / 60_000)
  }
  if (durationMinutes !== undefined && (!Number.isSafeInteger(durationMinutes) || durationMinutes <= 0)) {
    throw new AppError('VALIDATION_ERROR', 'QMeet duration must be a positive number of whole minutes.', 400)
  }
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(start ? { scheduledAt: start.toISOString() } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
  }
}

export class QMeetClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetcher: typeof fetch

  constructor(options: QMeetClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.QMEET_API_KEY || ''
    this.baseUrl = (options.baseUrl || process.env.QMEET_API_BASE_URL || '').trim()
    this.fetcher = options.fetcher || fetch
  }

  private assertConfigured(): void {
    if (!this.apiKey || !isValidQMeetBaseUrl(this.baseUrl)) {
      throw new AppError(
        'CONFIGURATION_ERROR',
        'QMeet is not configured.',
        503,
      )
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    this.assertConfigured()
    let response: Response
    try {
      response = await this.fetcher(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
        ...init,
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...init?.headers,
          'x-qmeet-api-key': this.apiKey,
        },
      })
    } catch {
      throw new AppError('BUSINESS_RULE', 'QMeet could not be reached.', 503)
    }

    if (!response.ok) {
      throw new AppError('BUSINESS_RULE', 'QMeet request failed.', response.status)
    }

    if (response.status === 204) return undefined as T
    try {
      const text = await response.text()
      return (text ? JSON.parse(text) : undefined) as T
    } catch {
      throw new AppError('BUSINESS_RULE', 'QMeet returned an invalid response.', 502)
    }
  }

  createMeeting(input: CreateMeetingInput): Promise<QMeetMeeting> {
    return this.request<QMeetMeeting>('/api/qmeet/v1/meetings', {
      method: 'POST',
      body: JSON.stringify(qmeetCreatePayload(input)),
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
