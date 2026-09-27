import { prisma } from '@/lib/prisma'
import type { TeacherSession } from '@/lib/auth-helpers'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  teacherSuggestionSchema,
  publicRecommendationReason,
} from '@/lib/phase9/engine'

type PrismaReader = Pick<typeof prisma, 'user' | 'studentLearningProfile' | 'learningSignal' | 'aIRecommendation' | 'teacherIntelligenceSuggestion'>

const studentRole = 'STUDENT'

/**
 * Only live, server-owned assignment records grant teacher visibility.
 * Historical feedback and legacy session-student rows deliberately do not
 * establish current access.
 */
export function currentTeacherAssignmentWhere(
  teacherProfileId: string,
  now: Date,
): Prisma.UserWhereInput {
  return {
    role: studentRole,
    OR: [
      {
        groupMemberships: {
          some: {
            role: 'STUDENT',
            status: 'ACTIVE',
            leftAt: null,
            group: { status: 'ACTIVE', teacherProfileId },
          },
        },
      },
      {
        sessionParticipants: {
          some: {
            role: 'STUDENT',
            status: { in: ['SCHEDULED', 'JOINED'] },
            session: {
              teacherId: teacherProfileId,
              status: { in: ['SCHEDULED', 'READY', 'LIVE'] },
              endTime: { gt: now },
            },
          },
        },
      },
      {
        Subscription: {
          some: {
            assignedTeacherId: teacherProfileId,
            status: 'APPROVED',
            paid: true,
            approvedAt: { not: null },
            rejectedAt: null,
            OR: [{ startDate: null }, { startDate: { lte: now } }],
            AND: [{ OR: [{ endDate: null }, { endDate: { gt: now } }] }],
          },
        },
      },
      {
        enrollments: {
          some: {
            teacherProfileId,
            status: 'ACTIVE',
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            AND: [
              { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
              {
                OR: [
                  { subscriptionId: null },
                  {
                    subscription: {
                      is: {
                        assignedTeacherId: teacherProfileId,
                        status: 'APPROVED',
                        paid: true,
                        approvedAt: { not: null },
                        rejectedAt: null,
                        OR: [{ startDate: null }, { startDate: { lte: now } }],
                        AND: [{ OR: [{ endDate: null }, { endDate: { gt: now } }] }],
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    ],
  }
}

function parseJson(value: string | null | undefined) {
  if (!value) return null
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

export async function isTeacherAssignedToStudent(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  studentId: string,
  client: PrismaReader = prisma,
  now = new Date(),
) {
  const student = await client.user.findFirst({
    where: {
      id: studentId,
      ...currentTeacherAssignmentWhere(teacher.teacherProfileId, now),
    },
    select: { id: true },
  })
  return Boolean(student)
}

export function sanitizeSuggestionDraft(input: unknown, type: string) {
  const parsed = teacherSuggestionSchema.shape.draft.safeParse(input)
  if (!parsed.success) return null
  const draft = parsed.data
  const allowedFields: Record<string, readonly string[]> = {
    FEEDBACK_EXPRESSION: ['expression', 'meaning', 'example', 'category'],
    MISTAKE: ['original', 'correction', 'explanation'],
    EBI: ['betterExpression', 'explanation', 'priority'],
    HOMEWORK: ['title', 'description', 'prompt', 'itemType'],
    VOCABULARY: ['expression', 'meaning', 'example', 'category'],
    SPEAKING_PROMPT: ['topic', 'prompt', 'vocabulary'],
    RESOURCE: ['resourceId', 'title', 'reason'],
  }
  const allowed = new Set(allowedFields[type] || [])
  if (Object.keys(draft).length === 0 || Object.keys(draft).some((key) => !allowed.has(key))) return null
  const safe: Record<string, string> = {}
  for (const [key, value] of Object.entries(draft)) {
    if (typeof value !== 'string' || value.trim().length === 0 || value.length > 1000) return null
    safe[key] = value.trim()
  }
  return safe
}

function publicSignal(signal: {
  id: string
  type: string
  source: string
  skillId: string | null
  topicKey: string | null
  strength: number
  occurredAt: Date
  evidenceJson: string | null
}) {
  const evidence = parseJson(signal.evidenceJson)
  const allowedEvidenceKeys = new Set([
    'expression', 'original', 'correction', 'target', 'guidance', 'phonetic',
    'betterExpression', 'explanation', 'category', 'priority', 'score', 'topicKey',
  ])
  const safeEvidence = evidence && typeof evidence === 'object' && !Array.isArray(evidence)
    ? Object.fromEntries(Object.entries(evidence).filter(([key]) => allowedEvidenceKeys.has(key)))
    : null
  return {
    id: signal.id,
    type: signal.type,
    source: signal.source,
    skillId: signal.skillId,
    topicKey: signal.topicKey,
    strength: signal.strength,
    occurredAt: signal.occurredAt,
    evidence: safeEvidence,
  }
}

function publicRecommendation(recommendation: {
  id: string
  type: string
  title: string | null
  reason: string | null
  priority: number
  status: string
  skillId: string | null
  resourceId: string | null
  createdAt: Date
  expiresAt: Date | null
}) {
  return {
    id: recommendation.id,
    type: recommendation.type,
    title: recommendation.title,
    reason: publicRecommendationReason(recommendation.reason || ''),
    priority: recommendation.priority,
    status: recommendation.status,
    skillId: recommendation.skillId,
    resourceId: recommendation.resourceId,
    createdAt: recommendation.createdAt,
    expiresAt: recommendation.expiresAt,
  }
}

export async function getTeacherStudentIntelligence(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  studentId: string,
) {
  const checkedAt = new Date()
  if (!await isTeacherAssignedToStudent(teacher, studentId, prisma, checkedAt)) return null
  const [student, profile, signals, recommendations] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId }, select: { id: true, name: true } }),
    prisma.studentLearningProfile.findUnique({
      where: { userId: studentId },
      select: {
        officialLevel: { select: { id: true, code: true, name: true } },
        officialStage: { select: { id: true, code: true, name: true } },
        goalsJson: true,
        targetSkillsJson: true,
        strengthsJson: true,
        weaknessesJson: true,
        speakingNeedsJson: true,
        lastReviewedAt: true,
      },
    }),
    prisma.learningSignal.findMany({
      where: { studentId },
      select: { id: true, type: true, source: true, skillId: true, topicKey: true, strength: true, occurredAt: true, evidenceJson: true },
      orderBy: { occurredAt: 'desc' },
      take: 50,
    }),
    prisma.aIRecommendation.findMany({
      where: { studentId, status: { in: ['PENDING', 'ACCEPTED'] } },
      select: { id: true, type: true, title: true, reason: true, priority: true, status: true, skillId: true, resourceId: true, createdAt: true, expiresAt: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    }),
  ])
  if (!student || !await isTeacherAssignedToStudent(teacher, studentId)) return null
  return {
    student,
    officialLevel: profile?.officialLevel || null,
    officialStage: profile?.officialStage || null,
    goals: parseJson(profile?.goalsJson),
    targetSkills: parseJson(profile?.targetSkillsJson),
    strengths: parseJson(profile?.strengthsJson),
    weaknesses: parseJson(profile?.weaknessesJson),
    speakingNeeds: parseJson(profile?.speakingNeedsJson),
    lastReviewedAt: profile?.lastReviewedAt || null,
    signals: signals.map(publicSignal),
    recommendations: recommendations.map(publicRecommendation),
    ai: { status: 'PROVIDER_UNAVAILABLE', mode: 'DETERMINISTIC_ONLY' },
  }
}

export async function getTeacherStudentRecommendations(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  studentId: string,
) {
  if (!await isTeacherAssignedToStudent(teacher, studentId)) return null
  const recommendations = await prisma.aIRecommendation.findMany({
    where: { studentId },
    select: { id: true, type: true, title: true, reason: true, priority: true, status: true, skillId: true, resourceId: true, createdAt: true, expiresAt: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })
  if (!await isTeacherAssignedToStudent(teacher, studentId)) return null
  return { items: recommendations.map(publicRecommendation) }
}

export async function createTeacherSuggestion(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  input: unknown,
) {
  const parsed = teacherSuggestionSchema.safeParse(input)
  if (!parsed.success) return { kind: 'INVALID' as const }
  if (!await isTeacherAssignedToStudent(teacher, parsed.data.studentId)) return { kind: 'FORBIDDEN' as const }
  const draft = sanitizeSuggestionDraft(parsed.data.draft, parsed.data.type)
  if (!draft) return { kind: 'INVALID_DRAFT' as const }
  const suggestion = await prisma.teacherIntelligenceSuggestion.create({
    data: {
      teacherId: teacher.userId,
      studentId: parsed.data.studentId,
      type: parsed.data.type,
      draftJson: JSON.stringify(draft),
      reason: parsed.data.reason,
      status: 'DRAFT',
      expiresAt: parsed.data.expiresAt,
    },
    select: { id: true, studentId: true, type: true, draftJson: true, reason: true, status: true, expiresAt: true, createdAt: true },
  })
  let remainsAssigned: boolean
  try {
    remainsAssigned = await isTeacherAssignedToStudent(teacher, parsed.data.studentId)
  } catch (error) {
    await prisma.teacherIntelligenceSuggestion.deleteMany({
      where: { id: suggestion.id, teacherId: teacher.userId, studentId: parsed.data.studentId, status: 'DRAFT' },
    })
    throw error
  }
  if (!remainsAssigned) {
    await prisma.teacherIntelligenceSuggestion.deleteMany({
      where: { id: suggestion.id, teacherId: teacher.userId, studentId: parsed.data.studentId, status: 'DRAFT' },
    })
    return { kind: 'FORBIDDEN' as const }
  }
  return {
    kind: 'CREATED' as const,
    item: { ...suggestion, draft: parseJson(suggestion.draftJson), draftJson: undefined },
  }
}

export async function approveTeacherSuggestion(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  suggestionId: string,
) {
  const suggestion = await prisma.teacherIntelligenceSuggestion.findFirst({
    where: { id: suggestionId, teacherId: teacher.userId, status: 'DRAFT' },
    select: { id: true, studentId: true },
  })
  if (!suggestion) return { kind: 'NOT_FOUND' as const }
  if (!await isTeacherAssignedToStudent(teacher, suggestion.studentId)) return { kind: 'FORBIDDEN' as const }
  // Recheck after loading the draft and immediately before the conditional
  // status change so revoked assignments cannot approve stale drafts.
  if (!await isTeacherAssignedToStudent(teacher, suggestion.studentId)) return { kind: 'FORBIDDEN' as const }
  const update = await prisma.teacherIntelligenceSuggestion.updateMany({
    where: { id: suggestion.id, teacherId: teacher.userId, studentId: suggestion.studentId, status: 'DRAFT' },
    data: { status: 'APPROVED', approvedById: teacher.userId, approvedAt: new Date() },
  })
  if (update.count !== 1) return { kind: 'CONFLICT' as const }
  const restoreDraft = () => prisma.teacherIntelligenceSuggestion.updateMany({
    where: {
      id: suggestion.id,
      teacherId: teacher.userId,
      studentId: suggestion.studentId,
      status: 'APPROVED',
      approvedById: teacher.userId,
    },
    data: { status: 'DRAFT', approvedById: null, approvedAt: null },
  })
  // Recheck after the write as assignments are separate records. Restore the
  // draft if the assignment disappeared or cannot be verified.
  let remainsAssigned: boolean
  try {
    remainsAssigned = await isTeacherAssignedToStudent(teacher, suggestion.studentId)
  } catch (error) {
    await restoreDraft()
    throw error
  }
  if (!remainsAssigned) {
    await restoreDraft()
    return { kind: 'FORBIDDEN' as const }
  }
  return { kind: 'APPROVED' as const, id: suggestion.id, status: 'APPROVED' as const }
}

export function safeAdminRecommendation(recommendation: {
  id: string
  studentId: string
  type: string
  title: string | null
  reason: string | null
  priority: number
  status: string
  skillId: string | null
  resourceId: string | null
  createdAt: Date
  expiresAt: Date | null
  student?: { id: string; name: string } | null
}) {
  return {
    id: recommendation.id,
    studentId: recommendation.studentId,
    student: recommendation.student || null,
    type: recommendation.type,
    title: recommendation.title,
    reason: publicRecommendationReason(recommendation.reason || ''),
    priority: recommendation.priority,
    status: recommendation.status,
    skillId: recommendation.skillId,
    resourceId: recommendation.resourceId,
    createdAt: recommendation.createdAt,
    expiresAt: recommendation.expiresAt,
  }
}

export const adminRecommendationQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'COMPLETED', 'DISMISSED', 'EXPIRED']).optional(),
  studentId: z.string().trim().min(1).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export async function adminRecommendations(input: {
  status?: string
  studentId?: string
  limit: number
}) {
  const recommendations = await prisma.aIRecommendation.findMany({
    where: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.studentId ? { studentId: input.studentId } : {}),
    },
    select: {
      id: true, studentId: true, type: true, title: true, reason: true, priority: true,
      status: true, skillId: true, resourceId: true, createdAt: true, expiresAt: true,
      student: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: input.limit,
  })
  return recommendations.map(safeAdminRecommendation)
}

export async function adminIntelligenceOverview() {
  const [signals, recommendations, pendingRecommendations, suggestions] = await Promise.all([
    prisma.learningSignal.count(),
    prisma.aIRecommendation.count(),
    prisma.aIRecommendation.count({ where: { status: { in: ['PENDING', 'ACCEPTED'] } } }),
    prisma.teacherIntelligenceSuggestion.count(),
  ])
  return {
    signals,
    recommendations,
    pendingRecommendations,
    teacherSuggestions: suggestions,
    ai: { status: 'PROVIDER_UNAVAILABLE', mode: 'DETERMINISTIC_ONLY' },
  }
}

export async function adminIntelligenceSettings() {
  return {
    mode: 'DETERMINISTIC_ONLY',
    aiProvider: { status: 'PROVIDER_UNAVAILABLE', available: false },
    recommendationStatuses: ['PENDING', 'ACCEPTED', 'COMPLETED', 'DISMISSED', 'EXPIRED'],
    suggestionApprovalCreatesStudentRecord: false,
  }
}
