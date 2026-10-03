import { NextResponse } from 'next/server'
import { z } from 'zod'

export const subscriptionTypes = ['GROUP', 'DUO', 'PRIVATE', 'SMALL_GROUP'] as const
export const subscriptionStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const
export const enrollmentStatuses = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const
export const groupStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const

export const subscriptionTypeSchema = z.enum(subscriptionTypes)

const packageFields = {
  title: z.string().trim().min(1).max(160),
  titleAr: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).nullable().optional(),
  descriptionAr: z.string().trim().max(4000).nullable().optional(),
  subscriptionType: subscriptionTypeSchema,
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  capacity: z.number().int().positive().max(100).nullable().optional(),
  durationDays: z.number().int().positive().max(3650),
  lessonsCount: z.number().int().positive().max(1000),
  lessonsPerWeek: z.number().int().min(1).max(7).nullable().optional(),
  price: z.number().finite().nonnegative(),
  discountPrice: z.number().finite().nonnegative().nullable().optional(),
  currency: z.enum(['EGP', 'SAR', 'USD']).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(160)).max(30).default([]),
  isActive: z.boolean().default(true),
}

function validatePackageConfiguration(
  value: Partial<z.infer<z.ZodObject<typeof packageFields>>>,
  context: z.RefinementCtx,
) {
  if (value.discountPrice != null && value.price != null && value.discountPrice > value.price) {
    context.addIssue({ code: 'custom', path: ['discountPrice'], message: 'Discount price cannot exceed price' })
  }
  if (value.subscriptionType === 'PRIVATE' && value.capacity != null && value.capacity !== 1) {
    context.addIssue({ code: 'custom', path: ['capacity'], message: 'Private packages must have capacity 1' })
  }
  if (value.subscriptionType === 'DUO' && value.capacity != null && value.capacity !== 2) {
    context.addIssue({ code: 'custom', path: ['capacity'], message: 'Duo packages must have capacity 2' })
  }
}

export const packageCreateSchema = z.object(packageFields).superRefine(validatePackageConfiguration)
export const packageUpdateSchema = z.object(packageFields).partial().superRefine(validatePackageConfiguration)

export const subscriptionCreateSchema = z.object({
  studentId: z.string().trim().min(1),
  packageId: z.string().trim().min(1),
  subscriptionType: subscriptionTypeSchema,
  assignedTeacherId: z.string().trim().min(1).nullable().optional(),
  groupId: z.string().trim().min(1).nullable().optional(),
  capacity: z.number().int().positive().max(100).nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  adminNotes: z.string().trim().max(2000).nullable().optional(),
})

export const subscriptionStatusSchema = z.object({
  status: z.enum(subscriptionStatuses),
  assignedTeacherId: z.string().trim().min(1).nullable().optional(),
  groupId: z.string().trim().min(1).nullable().optional(),
  adminNotes: z.string().trim().max(2000).nullable().optional(),
})

export const enrollmentCreateSchema = z.object({
  studentId: z.string().trim().min(1),
  subscriptionId: z.string().trim().min(1),
  packageId: z.string().trim().min(1).nullable().optional(),
  groupId: z.string().trim().min(1).nullable().optional(),
  teacherProfileId: z.string().trim().min(1).nullable().optional(),
  subscriptionType: subscriptionTypeSchema,
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
})

export const enrollmentStatusSchema = z.object({
  status: z.enum(['COMPLETED', 'CANCELLED']),
})

export const groupCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  nameAr: z.string().trim().max(160).nullable().optional(),
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  subscriptionType: subscriptionTypeSchema,
  teacherProfileId: z.string().trim().min(1).nullable().optional(),
  capacity: z.number().int().positive().max(100).nullable().optional(),
  timezone: z.string().trim().min(1).max(100).default('Asia/Riyadh'),
  status: z.enum(groupStatuses).default('DRAFT'),
})

export const groupUpdateSchema = groupCreateSchema.partial()

export const teacherAssignmentSchema = z.object({
  teacherProfileId: z.string().trim().min(1).nullable(),
})

export const groupMemberSchema = z.object({
  userId: z.string().trim().min(1),
  enrollmentId: z.string().trim().min(1).nullable().optional(),
  action: z.enum(['ADD', 'REMOVE']),
})

export const groupScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().positive().max(480),
  timezone: z.string().trim().min(1).max(100),
  teacherProfileId: z.string().trim().min(1).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

export const matchingSchema = z.object({
  studentId: z.string().trim().min(1),
  subscriptionId: z.string().trim().min(1).optional(),
  subscriptionType: subscriptionTypeSchema,
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  preferredDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  preferredStartMinute: z.number().int().min(0).max(1439).nullable().optional(),
  proposeGroupId: z.string().trim().min(1).optional(),
  availabilityTimezone: z.string().trim().min(1).max(100).optional(),
  availabilitySlots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    durationMinutes: z.number().int().min(30).max(240),
  }).strict()).max(49).optional(),
}).superRefine((value, context) => {
  if (value.proposeGroupId && !value.subscriptionId) {
    context.addIssue({ code: 'custom', path: ['subscriptionId'], message: 'A subscription is required to propose a group' })
  }
  if (value.availabilitySlots?.some((slot) => slot.startMinute + slot.durationMinutes > 1440)) {
    context.addIssue({ code: 'custom', path: ['availabilitySlots'], message: 'Availability slots must end before midnight' })
  }
})

export const groupProposalDecisionSchema = z.object({
  enrollmentId: z.string().trim().min(1),
  decision: z.enum(['ACCEPT', 'DECLINE']),
})

export type GroupProposalAction = 'ACCEPT' | 'DECLINE' | 'APPROVE'

export function groupProposalTransition(currentStatus: string, action: GroupProposalAction) {
  const transitions: Record<string, Partial<Record<GroupProposalAction, string>>> = {
    PROPOSED: { ACCEPT: 'STUDENT_ACCEPTED', DECLINE: 'STUDENT_DECLINED' },
    STUDENT_ACCEPTED: { APPROVE: 'ACTIVE' },
  }
  return transitions[currentStatus]?.[action] || null
}

export type AvailabilityWindow = { dayOfWeek: number; startMinute: number; durationMinutes: number }
export type AvailabilityPattern = { timezone: string; slots: AvailabilityWindow[] }

export function sharedAvailabilitySlots(left: AvailabilityPattern, right: AvailabilityPattern) {
  if (!left.timezone || left.timezone !== right.timezone) return []
  const slots: AvailabilityWindow[] = []
  for (const a of left.slots) {
    for (const b of right.slots) {
      if (a.dayOfWeek !== b.dayOfWeek) continue
      const startMinute = Math.max(a.startMinute, b.startMinute)
      const endMinute = Math.min(a.startMinute + a.durationMinutes, b.startMinute + b.durationMinutes)
      if (endMinute > startMinute) slots.push({ dayOfWeek: a.dayOfWeek, startMinute, durationMinutes: endMinute - startMinute })
    }
  }
  const unique = new Map(slots.map((slot) => [`${slot.dayOfWeek}:${slot.startMinute}:${slot.durationMinutes}`, slot]))
  return [...unique.values()].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startMinute - b.startMinute)
}

export type MatchingRequest = z.infer<typeof matchingSchema>

export interface MatchingGroup {
  id: string
  levelId: string | null
  stageId: string | null
  subscriptionType: (typeof subscriptionTypes)[number]
  teacherProfileId: string | null
  capacity: number | null
  activeMemberCount: number
  status: string
  schedules: Array<{ dayOfWeek: number; startMinute: number; durationMinutes?: number; timezone?: string; status: string }>
}

export function scoreMatchingGroup(group: MatchingGroup, request: MatchingRequest) {
  if (group.status !== 'ACTIVE') return null
  if (group.subscriptionType !== request.subscriptionType) return null
  if (request.levelId && group.levelId !== request.levelId) return null
  if (request.stageId && group.stageId !== request.stageId) return null
  if (group.capacity != null && group.activeMemberCount >= group.capacity) return null
  if (!group.teacherProfileId) return null

  const activeSchedules = group.schedules.filter((schedule) => schedule.status === 'ACTIVE')
  const comparableSchedules = request.availabilitySlots?.length
    ? activeSchedules.filter((schedule) => schedule.timezone === request.availabilityTimezone)
    : []
  const availabilityMatch = comparableSchedules.some((schedule) => request.availabilitySlots!.some((slot) =>
    slot.dayOfWeek === schedule.dayOfWeek
    && slot.startMinute < schedule.startMinute + (schedule.durationMinutes || 60)
    && schedule.startMinute < slot.startMinute + slot.durationMinutes,
  ))
  if (comparableSchedules.length > 0 && !availabilityMatch) return null
  const dayMatches = request.preferredDays.length === 0
    ? activeSchedules.length
    : activeSchedules.filter((schedule) => request.preferredDays.includes(schedule.dayOfWeek)).length
  if (request.preferredDays.length > 0 && dayMatches === 0) return null

  const timeDistance = request.preferredStartMinute == null || activeSchedules.length === 0
    ? 0
    : Math.min(...activeSchedules.map((schedule) => Math.abs(schedule.startMinute - request.preferredStartMinute!)))

  return {
    groupId: group.id,
    score: 100 + dayMatches * 10 + (availabilityMatch ? 25 : 0) - Math.min(timeDistance, 600) / 60,
    remainingCapacity: group.capacity == null ? null : group.capacity - group.activeMemberCount,
    availabilityMatch,
  }
}

export function rankMatchingGroups(groups: MatchingGroup[], request: MatchingRequest) {
  return groups
    .map((group) => scoreMatchingGroup(group, request))
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .sort((left, right) => right.score - left.score)
}

export function phase5DatabaseGuard() {
  if (process.env.PHASE5_DATABASE_ENABLED === 'true') return null
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Commercial and group data is temporarily unavailable.',
      },
    },
    { status: 503 },
  )
}

export function validationError(error: z.ZodError) {
  return NextResponse.json(
    { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', issues: error.issues } },
    { status: 400 },
  )
}