import { NextResponse } from 'next/server'
import { z } from 'zod'

export const feedbackStatuses = ['DRAFT', 'READY_TO_PUBLISH', 'PUBLISHED'] as const
export const homeworkStatuses = ['DRAFT', 'PUBLISHED', 'OPEN', 'SUBMITTED', 'REVIEWED', 'COMPLETED'] as const
export const homeworkTypes = ['TEXT', 'VOICE', 'VIDEO', 'FILE', 'LINK', 'VOCABULARY', 'SPEAKING', 'PRACTICE'] as const
export const libraryStatuses = ['ACTIVE', 'INACTIVE'] as const

export type FeedbackStatus = (typeof feedbackStatuses)[number]
export type HomeworkStatus = (typeof homeworkStatuses)[number]

const feedbackTransitions: Record<FeedbackStatus, readonly FeedbackStatus[]> = {
  DRAFT: ['READY_TO_PUBLISH'],
  READY_TO_PUBLISH: ['DRAFT', 'PUBLISHED'],
  PUBLISHED: [],
}

const homeworkTransitions: Record<HomeworkStatus, readonly HomeworkStatus[]> = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['OPEN'],
  OPEN: ['SUBMITTED'],
  SUBMITTED: ['REVIEWED'],
  REVIEWED: ['COMPLETED'],
  COMPLETED: [],
}

export function canTransitionFeedback(from: string, to: string) {
  return feedbackStatuses.includes(from as FeedbackStatus)
    && feedbackStatuses.includes(to as FeedbackStatus)
    && feedbackTransitions[from as FeedbackStatus].includes(to as FeedbackStatus)
}

export function canTransitionHomework(from: string, to: string) {
  return homeworkStatuses.includes(from as HomeworkStatus)
    && homeworkStatuses.includes(to as HomeworkStatus)
    && homeworkTransitions[from as HomeworkStatus].includes(to as HomeworkStatus)
}

export function canPublishFeedback(sessionStatus: string, hasEducationalContent: boolean) {
  return ['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'].includes(sessionStatus) && hasEducationalContent
}

export function teacherOwnsSession(sessionTeacherProfileId: string, actorTeacherProfileId: string) {
  return sessionTeacherProfileId === actorTeacherProfileId
}

export function studentCanViewFeedback(input: {
  actorUserId: string
  feedbackStudentId: string
  feedbackStatus: string
  sessionStatus: string
  participantStatus?: string | null
}) {
  return input.actorUserId === input.feedbackStudentId
    && input.feedbackStatus === 'PUBLISHED'
    && ['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'].includes(input.sessionStatus)
    && input.participantStatus !== 'CANCELLED'
}

export function coversAllRequiredItems(requiredItemIds: readonly string[], completedItemIds: readonly (string | null)[]) {
  const completed = new Set(completedItemIds.filter((item): item is string => Boolean(item)))
  return requiredItemIds.length > 0 && requiredItemIds.every((itemId) => completed.has(itemId))
}

export function nextAggregateHomeworkReviewStatus(
  currentStatus: string,
  allRequiredReviewed: boolean,
  markComplete: boolean,
) {
  if (currentStatus === 'COMPLETED') return 'COMPLETED'
  if (!allRequiredReviewed) return currentStatus
  return markComplete ? 'COMPLETED' : 'REVIEWED'
}

const optionalText = z.string().trim().max(2000).nullable().optional()

export const feedbackExpressionSchema = z.object({
  expression: z.string().trim().min(1).max(300),
  meaning: optionalText,
  example: optionalText,
  category: z.enum(['VOCABULARY', 'IDIOM', 'SLANG', 'CHUNK']).default('VOCABULARY'),
})

export const feedbackMistakeSchema = z.object({
  original: z.string().trim().min(1).max(500),
  correction: z.string().trim().min(1).max(500),
  explanation: optionalText,
  templateId: z.string().trim().min(1).nullable().optional(),
})

export const feedbackPronunciationSchema = z.object({
  target: z.string().trim().min(1).max(300),
  actual: optionalText,
  guidance: z.string().trim().min(1).max(1000),
  phonetic: z.string().trim().max(300).nullable().optional(),
  teacherNote: optionalText,
})

export const feedbackEbiSchema = z.object({
  betterExpression: z.string().trim().min(1).max(500),
  explanation: optionalText,
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
  libraryItemId: z.string().trim().min(1).nullable().optional(),
})

export const feedbackUpsertSchema = z.object({
  sessionId: z.string().trim().min(1),
  studentId: z.string().trim().min(1),
  summary: optionalText,
  teacherNotes: optionalText,
  expressions: z.array(feedbackExpressionSchema).max(100).default([]),
  mistakes: z.array(feedbackMistakeSchema).max(100).default([]),
  pronunciation: z.array(feedbackPronunciationSchema).max(100).default([]),
  ebi: z.array(feedbackEbiSchema).max(100).default([]),
})

export const feedbackTransitionSchema = z.object({ status: z.enum(feedbackStatuses) })

export const ebiLibrarySchema = z.object({
  category: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(300),
  description: optionalText,
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  status: z.enum(libraryStatuses).default('ACTIVE'),
})

export const mistakeLibrarySchema = z.object({
  category: z.string().trim().min(1).max(100),
  incorrectExpression: z.string().trim().min(1).max(500),
  correctedExpression: z.string().trim().min(1).max(500),
  explanation: optionalText,
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  status: z.enum(libraryStatuses).default('ACTIVE'),
})

export const homeworkItemSchema = z.object({
  itemType: z.enum(homeworkTypes),
  prompt: optionalText,
  contentRef: z.string().trim().max(2000).nullable().optional(),
  isRequired: z.boolean().default(true),
  order: z.number().int().min(0).max(1000),
})

const homeworkBaseSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: optionalText,
  studentId: z.string().trim().min(1).nullable().optional(),
  groupId: z.string().trim().min(1).nullable().optional(),
  sessionId: z.string().trim().min(1).nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  items: z.array(homeworkItemSchema).min(1).max(100),
})

export const homeworkCreateSchema = homeworkBaseSchema.refine((value) => [value.studentId, value.groupId, value.sessionId].filter(Boolean).length === 1, {
  message: 'Homework must target exactly one student, group, or session',
})

export const homeworkUpdateSchema = homeworkBaseSchema.partial()
export const homeworkTransitionSchema = z.object({ status: z.enum(homeworkStatuses) })

export const homeworkSubmissionSchema = z.object({
  itemId: z.string().trim().min(1),
  contentType: z.enum(homeworkTypes),
  contentText: z.string().trim().max(10000).nullable().optional(),
  contentRef: z.string().trim().max(2000).nullable().optional(),
  attempt: z.number().int().min(1).max(10).default(1),
}).superRefine((value, context) => {
  if (['TEXT', 'VOCABULARY', 'SPEAKING', 'PRACTICE'].includes(value.contentType) && !value.contentText) {
    context.addIssue({ code: 'custom', path: ['contentText'], message: 'Text content is required' })
  }
  if (['VOICE', 'VIDEO', 'FILE', 'LINK'].includes(value.contentType) && !value.contentRef) {
    context.addIssue({ code: 'custom', path: ['contentRef'], message: 'A content reference is required' })
  }
})

export const homeworkReviewSchema = z.object({
  score: z.number().min(0).max(100).nullable().optional(),
  feedback: optionalText,
  corrections: optionalText,
  nextSteps: optionalText,
  complete: z.boolean().default(false),
})

export function phase7DatabaseGuard() {
  if (process.env.PHASE5_DATABASE_ENABLED === 'true') return null
  return NextResponse.json(
    { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Feedback and homework data is temporarily unavailable.' } },
    { status: 503 },
  )
}

export function deterministicNotificationKey(event: string, entityId: string, recipientUserId: string, channel: string) {
  return `${event}:${entityId}:${recipientUserId}:${channel}`
}