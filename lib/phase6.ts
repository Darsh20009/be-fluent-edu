import { NextResponse } from 'next/server'
import { z } from 'zod'

export const sessionStatuses = [
  'DRAFT',
  'SCHEDULED',
  'READY',
  'LIVE',
  'ENDED',
  'FEEDBACK_PENDING',
  'COMPLETED',
] as const
export const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const
export const participantStatuses = ['SCHEDULED', 'JOINED', 'LEFT', 'CANCELLED', 'ABSENT'] as const
export const qmeetStatuses = ['REQUESTED', 'CREATED', 'UNAVAILABLE', 'FAILED', 'CANCELLED'] as const

export type SessionStatus = (typeof sessionStatuses)[number]
export type AttendanceStatus = (typeof attendanceStatuses)[number]

export const sessionTransitions: Record<SessionStatus, readonly SessionStatus[]> = {
  DRAFT: ['SCHEDULED'],
  SCHEDULED: ['READY'],
  READY: ['LIVE'],
  LIVE: ['ENDED'],
  ENDED: ['FEEDBACK_PENDING'],
  FEEDBACK_PENDING: ['COMPLETED'],
  COMPLETED: [],
}

export function canTransitionSession(from: string, to: string): boolean {
  if (!sessionStatuses.includes(from as SessionStatus) || !sessionStatuses.includes(to as SessionStatus)) return false
  return sessionTransitions[from as SessionStatus].includes(to as SessionStatus)
}

const dateRangeSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).refine((value) => value.startTime < value.endTime, {
  message: 'Start time must be before end time',
  path: ['endTime'],
})

export const sessionCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  teacherProfileId: z.string().trim().min(1),
  groupId: z.string().trim().min(1).nullable().optional(),
  groupScheduleId: z.string().trim().min(1).nullable().optional(),
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: z.enum(['DRAFT', 'SCHEDULED']).default('DRAFT'),
  participantIds: z.array(z.string().trim().min(1)).max(100).default([]),
}).refine((value) => value.startTime < value.endTime, {
  message: 'Start time must be before end time',
  path: ['endTime'],
})

export const sessionUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  teacherProfileId: z.string().trim().min(1).optional(),
  groupId: z.string().trim().min(1).nullable().optional(),
  groupScheduleId: z.string().trim().min(1).nullable().optional(),
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
})

export const sessionScheduleSchema = dateRangeSchema.extend({
  groupScheduleId: z.string().trim().min(1).nullable().optional(),
})

export const sessionTransitionSchema = z.object({ status: z.enum(sessionStatuses) })

export const participantMutationSchema = z.object({
  userId: z.string().trim().min(1),
  action: z.enum(['ADD', 'REMOVE', 'CANCEL']),
})

export const attendanceMutationSchema = z.object({
  userId: z.string().trim().min(1),
  status: z.enum(attendanceStatuses),
  joinedAt: z.coerce.date().nullable().optional(),
  leftAt: z.coerce.date().nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
}).superRefine((value, context) => {
  if (value.joinedAt && value.leftAt && value.joinedAt > value.leftAt) {
    context.addIssue({ code: 'custom', path: ['leftAt'], message: 'Leave time cannot precede join time' })
  }
})

export const qmeetCreateSchema = z.object({
  forceRetry: z.boolean().default(false),
})

export interface JoinRuleInput {
  authenticated: boolean
  active: boolean
  accountStatus?: string | null
  enrolled: boolean
  participantStatus?: string | null
  sessionStatus: string
  startTime: Date
  endTime: Date
  now?: Date
}

export function canStudentJoinSession(input: JoinRuleInput) {
  if (!input.authenticated) return { allowed: false, code: 'UNAUTHENTICATED' }
  if (!input.active || ['SUSPENDED', 'DISABLED', 'PENDING'].includes(input.accountStatus || '')) {
    return { allowed: false, code: 'ACCOUNT_BLOCKED' }
  }
  if (!input.enrolled) return { allowed: false, code: 'NOT_ENROLLED' }
  if (['CANCELLED', 'ABSENT'].includes(input.participantStatus || '')) {
    return { allowed: false, code: 'PARTICIPATION_BLOCKED' }
  }
  if (!['READY', 'LIVE'].includes(input.sessionStatus)) {
    return { allowed: false, code: 'SESSION_NOT_JOINABLE' }
  }
  const now = input.now ?? new Date()
  const earliest = new Date(input.startTime.getTime() - 15 * 60_000)
  if (now < earliest) return { allowed: false, code: 'TOO_EARLY' }
  if (now > input.endTime) return { allowed: false, code: 'SESSION_ENDED' }
  return { allowed: true, code: 'ALLOWED' }
}

export function calculateAttendanceDuration(joinedAt?: Date | null, leftAt?: Date | null) {
  if (!joinedAt || !leftAt || leftAt <= joinedAt) return null
  return Math.floor((leftAt.getTime() - joinedAt.getTime()) / 1000)
}

export function phase6DatabaseGuard() {
  if (process.env.PHASE5_DATABASE_ENABLED === 'true') return null
  return NextResponse.json(
    { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Class and session data is temporarily unavailable.' } },
    { status: 503 },
  )
}

export function qmeetProviderStatus() {
  return process.env.QMEET_API_KEY && process.env.QMEET_API_BASE_URL
    ? { configured: true, status: 'AVAILABLE' as const }
    : { configured: false, status: 'PROVIDER_UNAVAILABLE' as const }
}