import { z } from 'zod'

export const adminAssistantRequestSchema = z.object({
  language: z.enum(['ar', 'en']),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(4000),
  }).strict()).min(1).max(16)
    .refine((messages) => messages[messages.length - 1]?.role === 'user', {
      message: 'The latest message must be from the user.',
    }),
}).strict()

const nullableText = (max: number) => z.string().trim().max(max).nullable()
const isoDateOrNull = z.iso.datetime().nullable()

export const adminAssistantActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('student_profile_update'),
    studentId: z.string().trim().min(1).max(100),
    name: nullableText(120),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING']).nullable(),
    age: z.number().int().min(1).max(120).nullable(),
    goal: nullableText(2000),
  }).strict().refine((action) =>
    action.name !== null || action.status !== null || action.age !== null || action.goal !== null,
  ),
  z.object({
    type: z.literal('subscription_create'),
    studentId: z.string().trim().min(1).max(100),
    packageId: z.string().trim().min(1).max(100),
    subscriptionType: z.enum(['GROUP', 'DUO', 'PRIVATE', 'SMALL_GROUP']),
    assignedTeacherId: z.string().trim().min(1).max(100).nullable(),
    groupId: z.string().trim().min(1).max(100).nullable(),
    capacity: z.number().int().positive().max(100).nullable(),
    startDate: isoDateOrNull,
    endDate: isoDateOrNull,
    adminNotes: nullableText(2000),
  }).strict(),
  z.object({
    type: z.literal('subscription_update'),
    subscriptionId: z.string().trim().min(1).max(100),
    status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED']),
    assignedTeacherId: z.string().trim().min(1).max(100).nullable(),
    groupId: z.string().trim().min(1).max(100).nullable(),
    adminNotes: nullableText(2000),
  }).strict(),
  z.object({
    type: z.literal('session_create'),
    title: z.string().trim().min(1).max(200),
    teacherProfileId: z.string().trim().min(1).max(100),
    groupId: z.string().trim().min(1).max(100).nullable(),
    groupScheduleId: z.string().trim().min(1).max(100).nullable(),
    levelId: z.string().trim().min(1).max(100).nullable(),
    stageId: z.string().trim().min(1).max(100).nullable(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    status: z.enum(['DRAFT', 'SCHEDULED']),
    participantIds: z.array(z.string().trim().min(1).max(100)).max(100),
  }).strict().refine((action) => new Date(action.startTime) < new Date(action.endTime), {
    path: ['endTime'],
    message: 'Session end time must follow its start time.',
  }),
  z.object({
    type: z.literal('session_transition'),
    sessionId: z.string().trim().min(1).max(100),
    status: z.enum(['DRAFT', 'SCHEDULED', 'READY', 'LIVE', 'ENDED', 'FEEDBACK_PENDING', 'COMPLETED']),
  }).strict(),
  z.object({
    type: z.literal('attendance_update'),
    sessionId: z.string().trim().min(1).max(100),
    userId: z.string().trim().min(1).max(100),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    joinedAt: isoDateOrNull,
    leftAt: isoDateOrNull,
    note: nullableText(1000),
  }).strict(),
  z.object({
    type: z.literal('package_create'),
    title: z.string().trim().min(1).max(160),
    titleAr: z.string().trim().min(1).max(160),
    description: nullableText(4000),
    descriptionAr: nullableText(4000),
    subscriptionType: z.enum(['GROUP', 'DUO', 'PRIVATE', 'SMALL_GROUP']),
    levelId: z.string().trim().min(1).max(100).nullable(),
    stageId: z.string().trim().min(1).max(100).nullable(),
    capacity: z.number().int().positive().max(100).nullable(),
    durationDays: z.number().int().positive().max(3650),
    lessonsCount: z.number().int().positive().max(1000),
    price: z.number().finite().nonnegative(),
    discountPrice: z.number().finite().nonnegative().nullable(),
    features: z.array(z.string().trim().min(1).max(160)).max(30),
    isActive: z.boolean(),
  }).strict(),
  z.object({
    type: z.literal('whatsapp_send'),
    conversationId: z.string().trim().min(1).max(100),
    body: z.string().trim().min(1).max(4000),
  }).strict(),
  z.object({
    type: z.literal('email_send'),
    to: z.string().trim().email().max(254),
    subject: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(10000),
  }).strict(),
])

export type AdminAssistantAction = z.infer<typeof adminAssistantActionSchema>