import { prisma } from '@/lib/prisma'
import type { TeacherSession } from '@/lib/auth-helpers'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { createHash } from 'node:crypto'
import {
  teacherSuggestionSchema,
  publicRecommendationReason,
} from '@/lib/phase9/engine'
import {
  buildAnonymizedLearnerContext,
  generateScopedProposals,
  thanarahConfigured,
  type AiProposal,
  type ProposalProvider,
} from '@/lib/phase9/ai-proposals'
import {
  aiSuggestionDraftSchema,
  loadScopedAiProposalDrafts,
  reviewAbortKind,
  reviewGeneratedSuggestionInTransaction,
} from '@/lib/phase9/proposal-review'

type PrismaReader = Pick<typeof prisma, 'user'>

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
      where: { studentId, OR: [{ expiresAt: null }, { expiresAt: { gt: checkedAt } }] },
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
    ai: {
      status: thanarahConfigured() ? 'AVAILABLE' : 'PROVIDER_UNAVAILABLE',
      mode: 'DETERMINISTIC_RECOMMENDATIONS',
      proposalGeneration: thanarahConfigured() ? 'PROVIDER_ENABLED' : 'PROVIDER_UNAVAILABLE',
    },
  }
}

/**
 * Provider output is persisted only as a teacher-owned pending review draft.
 * It does not alter deterministic recommendations or publish to the student;
 * explicit approval later materializes a recommendation transactionally.
 */
export async function generateTeacherStudentProposals(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  studentId: string,
  provider?: ProposalProvider,
) {
  const generated = await generateScopedProposals({
    authorize: () => isTeacherAssignedToStudent(teacher, studentId),
    loadContext: async () => {
      const profile = await prisma.studentLearningProfile.findUnique({
        where: { userId: studentId },
        select: {
          officialLevelId: true,
          officialStageId: true,
          goalsJson: true,
          officialLevel: { select: { code: true } },
          officialStage: { select: { code: true } },
        },
      })
      // Only persisted Phase 9 signals for this exact learner are read. The
      // context builder further admits the three public source categories.
      const signals = await prisma.learningSignal.findMany({
        where: {
          studentId,
          source: { in: ['FEEDBACK', 'HOMEWORK', 'GOAL'] },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: {
          studentId: true, source: true, type: true, topicKey: true, strength: true, dedupeKey: true,
          occurredAt: true, evidenceJson: true,
          skill: { select: { code: true } },
        },
        orderBy: { occurredAt: 'desc' },
        take: 40,
      })
      const resources = profile?.officialLevelId
        ? await prisma.resource.findMany({
          where: {
            isPublished: true,
            levelId: profile.officialLevelId,
            stageId: profile.officialStageId || null,
          },
          select: {
            id: true, title: true, resourceType: true, levelId: true, stageId: true,
            skill: { select: { code: true } },
          },
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
          take: 30,
        })
        : []
      return buildAnonymizedLearnerContext({
        requestedStudentId: studentId,
        level: profile?.officialLevel?.code || null,
        stage: profile?.officialStage?.code || null,
        goals: parseJson(profile?.goalsJson),
        signals: signals.map((signal) => ({
          ...signal,
          skillCode: signal.skill?.code || null,
        })),
        resources: resources.map((resource) => ({
          ...resource,
          skillCode: resource.skill?.code || null,
        })),
      })
    },
    provider,
  })
  if (generated.kind !== 'GENERATED') return generated

  const stillAssigned = await isTeacherAssignedToStudent(teacher, studentId)
  if (!stillAssigned) return { kind: 'FORBIDDEN' as const }
  // Resolve IDs only from real resources queried for the official level/stage.
  const validSignalTypes: Record<string, readonly string[]> = {
    FEEDBACK: ['MISTAKE', 'PRONUNCIATION_NEED', 'EBI_OPPORTUNITY', 'VOCABULARY_NEED'],
    HOMEWORK: ['HOMEWORK_WEAK', 'HOMEWORK_STRONG'],
    GOAL: ['STUDENT_GOAL'],
  }
  // Re-read keys for provenance only; these identifiers were not given to AI.
  const sourceSignals = await prisma.learningSignal.findMany({
    where: {
      studentId,
      source: { in: ['FEEDBACK', 'HOMEWORK', 'GOAL'] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { studentId: true, source: true, type: true, dedupeKey: true },
    orderBy: { occurredAt: 'desc' },
    take: 40,
  })
  const sourceSignalKeys = sourceSignals
    .filter((signal) => signal.studentId === studentId && validSignalTypes[signal.source]?.includes(signal.type))
    .slice(0, 20)
    .map((signal) => signal.dedupeKey)
  const evidenceCycleKey = `thanarah:${createHash('sha256').update(sourceSignalKeys.slice().sort().join('|')).digest('hex')}`
  let created: Awaited<ReturnType<typeof createGeneratedSuggestionRecords>>
  try {
    created = await createGeneratedSuggestionRecords({
      teacher,
      studentId,
      proposals: generated.proposals,
      sourceSignalKeys,
      evidenceCycleKey,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'PROPOSAL_ASSIGNMENT_REVOKED') {
      return { kind: 'FORBIDDEN' as const }
    }
    if (error instanceof Error && error.message === 'PROPOSAL_RESOURCE_STALE') {
      return { kind: 'CONFLICT' as const }
    }
    throw error
  }
  if (!await isTeacherAssignedToStudent(teacher, studentId)) {
    await prisma.teacherIntelligenceSuggestion.deleteMany({
      where: {
        id: { in: created.map((item) => item.id) },
        teacherId: teacher.userId,
        studentId,
        status: 'PENDING_REVIEW',
      },
    })
    return { kind: 'FORBIDDEN' as const }
  }
  return { kind: 'GENERATED' as const, proposals: generated.proposals, suggestions: created }
}

export async function getTeacherStudentProposalDrafts(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  studentId: string,
) {
  return loadScopedAiProposalDrafts({
    teacherId: teacher.userId,
    studentId,
    authorize: () => isTeacherAssignedToStudent(teacher, studentId),
    loadRecords: async ({ teacherId, studentId: scopedStudentId, limit }) => prisma.teacherIntelligenceSuggestion.findMany({
      where: {
        teacherId,
        studentId: scopedStudentId,
        type: 'AI_RECOMMENDATION',
        status: 'PENDING_REVIEW',
      },
      select: {
        id: true, teacherId: true, studentId: true, type: true, status: true,
        draftJson: true, reason: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  })
}

async function createGeneratedSuggestionRecords(input: {
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>
  studentId: string
  proposals: AiProposal[]
  sourceSignalKeys: string[]
  evidenceCycleKey: string
}) {
  return prisma.$transaction(async (tx) => {
    if (!await isTeacherAssignedToStudent(input.teacher, input.studentId, tx)) {
      throw new Error('PROPOSAL_ASSIGNMENT_REVOKED')
    }
    const currentProfile = await tx.studentLearningProfile.findUnique({
      where: { userId: input.studentId },
      select: { officialLevelId: true, officialStageId: true },
    })
    const items = []
    for (const proposal of input.proposals) {
      const resource = proposal.resourceId
        ? await tx.resource.findFirst({
          where: {
            id: proposal.resourceId,
            isPublished: true,
            levelId: currentProfile?.officialLevelId || null,
            stageId: currentProfile?.officialStageId || null,
          },
          select: { id: true, skill: { select: { code: true } } },
        })
        : null
      if (proposal.resourceId && !resource) throw new Error('PROPOSAL_RESOURCE_STALE')
      const draft = aiSuggestionDraftSchema.parse({
        proposal: {
          type: proposal.type,
          title: proposal.title,
          reason: proposal.reason,
          skillCode: resource?.skill?.code || proposal.skillCode,
          resourceId: resource?.id || null,
          levelId: currentProfile?.officialLevelId || null,
          stageId: currentProfile?.officialStageId || null,
        },
        sourceSignalKeys: input.sourceSignalKeys,
        evidenceCycleKey: input.evidenceCycleKey,
      })
      const suggestion = await tx.teacherIntelligenceSuggestion.create({
        data: {
          teacherId: input.teacher.userId,
          studentId: input.studentId,
          type: 'AI_RECOMMENDATION',
          draftJson: JSON.stringify(draft),
          reason: proposal.reason,
          status: 'PENDING_REVIEW',
        },
        select: { id: true, studentId: true, type: true, draftJson: true, reason: true, status: true, createdAt: true },
      })
      items.push({
        id: suggestion.id,
        studentId: suggestion.studentId,
        type: suggestion.type,
        status: suggestion.status,
        proposal: draft.proposal,
        reason: suggestion.reason,
        createdAt: suggestion.createdAt,
      })
    }
    return items
  })
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
    where: { id: suggestionId, teacherId: teacher.userId },
    select: { id: true, studentId: true, type: true, status: true },
  })
  if (!suggestion) return { kind: 'NOT_FOUND' as const }
  if (suggestion.type === 'AI_RECOMMENDATION') {
    if (suggestion.status !== 'PENDING_REVIEW') return { kind: 'CONFLICT' as const }
    if (!await isTeacherAssignedToStudent(teacher, suggestion.studentId)) return { kind: 'FORBIDDEN' as const }
    try {
      return await prisma.$transaction(async (tx) => reviewGeneratedSuggestionInTransaction({
        suggestionId,
        reviewerId: teacher.userId,
        decision: 'APPROVE',
        repository: {
          isAuthorized: () => isTeacherAssignedToStudent(teacher, suggestion.studentId, tx),
          findSuggestion: async () => {
            const current = await tx.teacherIntelligenceSuggestion.findFirst({
              where: {
                id: suggestionId,
                teacherId: teacher.userId,
                studentId: suggestion.studentId,
              },
              select: { id: true, studentId: true, teacherId: true, type: true, status: true, draftJson: true },
            })
            return current
          },
          findRecommendation: async (dedupeKey) => {
            const current = await tx.aIRecommendation.findUnique({
              where: { studentId_dedupeKey_dedupeCycle: { studentId: suggestion.studentId, dedupeKey, dedupeCycle: 1 } },
              select: { id: true },
            })
            return current
          },
          createRecommendation: async (data) => {
            const created = await tx.aIRecommendation.create({ data, select: { id: true } })
            return created
          },
          transitionSuggestion: async (from, to, reviewerId, at) => {
            const changed = await tx.teacherIntelligenceSuggestion.updateMany({
              where: {
                id: suggestionId,
                teacherId: teacher.userId,
                studentId: suggestion.studentId,
                type: 'AI_RECOMMENDATION',
                status: from,
              },
              data: {
                status: to,
                ...(to === 'APPROVED' ? { approvedById: reviewerId, approvedAt: at } : {}),
              },
            })
            return changed.count
          },
          materializationDetails: async (draft) => {
            const currentProfile = await tx.studentLearningProfile.findUnique({
              where: { userId: suggestion.studentId },
              select: { officialLevelId: true, officialStageId: true },
            })
            const levelId = currentProfile?.officialLevelId || null
            const stageId = currentProfile?.officialStageId || null
            if (draft.proposal.levelId !== levelId || draft.proposal.stageId !== stageId) {
              return { levelId, stageId, skillId: null, resourceValid: false }
            }
            let resourceValid = true
            if (draft.proposal.resourceId) {
              const resource = await tx.resource.findFirst({
                where: {
                  id: draft.proposal.resourceId,
                  isPublished: true,
                  levelId,
                  stageId,
                },
                select: { id: true, skillId: true, skill: { select: { code: true } } },
              })
              resourceValid = Boolean(resource)
              if (resourceValid && draft.proposal.skillCode && resource?.skill?.code !== draft.proposal.skillCode) {
                resourceValid = false
              }
              return { levelId, stageId, skillId: resource?.skillId || null, resourceValid }
            }
            const skill = draft.proposal.skillCode
              ? await tx.skill.findUnique({
                where: { code: draft.proposal.skillCode },
                select: { id: true },
              })
              : null
            if (draft.proposal.skillCode && !skill) resourceValid = false
            return { levelId, stageId, skillId: skill?.id || null, resourceValid }
          },
        },
      }))
    } catch (error) {
      if (reviewAbortKind(error) === 'FORBIDDEN') return { kind: 'FORBIDDEN' as const }
      if (reviewAbortKind(error) === 'INVALID_DRAFT') return { kind: 'INVALID_DRAFT' as const }
      if (reviewAbortKind(error) === 'CONFLICT' || isPrismaUniqueConstraintError(error)) {
        return { kind: 'CONFLICT' as const }
      }
      throw error
    }
  }
  if (suggestion.status !== 'DRAFT') return { kind: 'CONFLICT' as const }
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
  return { kind: 'APPROVED' as const, id: suggestion.id, status: 'APPROVED' as const, materialized: false as const }
}

function isPrismaUniqueConstraintError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: unknown }).code === 'P2002')
}

export async function rejectTeacherSuggestion(
  teacher: Pick<TeacherSession, 'userId' | 'teacherProfileId'>,
  suggestionId: string,
) {
  const suggestion = await prisma.teacherIntelligenceSuggestion.findFirst({
    where: { id: suggestionId, teacherId: teacher.userId, type: 'AI_RECOMMENDATION' },
    select: { id: true, studentId: true, status: true },
  })
  if (!suggestion) return { kind: 'NOT_FOUND' as const }
  if (suggestion.status !== 'PENDING_REVIEW') return { kind: 'CONFLICT' as const }
  if (!await isTeacherAssignedToStudent(teacher, suggestion.studentId)) return { kind: 'FORBIDDEN' as const }
  try {
    return await prisma.$transaction(async (tx) => {
      if (!await isTeacherAssignedToStudent(teacher, suggestion.studentId, tx)) {
        return { kind: 'FORBIDDEN' as const }
      }
      const changed = await tx.teacherIntelligenceSuggestion.updateMany({
        where: {
          id: suggestion.id,
          teacherId: teacher.userId,
          studentId: suggestion.studentId,
          type: 'AI_RECOMMENDATION',
          status: 'PENDING_REVIEW',
        },
        data: { status: 'REJECTED' },
      })
      if (changed.count !== 1) return { kind: 'CONFLICT' as const }
      if (!await isTeacherAssignedToStudent(teacher, suggestion.studentId, tx)) {
        throw new Error('REJECT_ASSIGNMENT_REVOKED')
      }
      return { kind: 'REJECTED' as const, id: suggestion.id, status: 'REJECTED' as const }
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'REJECT_ASSIGNMENT_REVOKED') return { kind: 'FORBIDDEN' as const }
    throw error
  }
}

export async function adminPendingAiSuggestions(limit = 100) {
  const rows = await prisma.teacherIntelligenceSuggestion.findMany({
    where: { type: 'AI_RECOMMENDATION', status: 'PENDING_REVIEW' },
    select: {
      id: true, teacherId: true, studentId: true, draftJson: true, reason: true, status: true, createdAt: true,
      student: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: Math.max(1, Math.min(100, limit)),
  })
  return rows.map((row) => {
    const draft = aiSuggestionDraftSchema.safeParse(parseJson(row.draftJson))
    return {
      id: row.id,
      teacherId: row.teacherId,
      studentId: row.studentId,
      student: row.student,
      status: row.status,
      proposal: draft.success ? draft.data.proposal : null,
      reason: row.reason,
      createdAt: row.createdAt,
      invalidDraft: !draft.success,
    }
  })
}

export async function reviewAiSuggestionAsAdmin(
  adminId: string,
  suggestionId: string,
  decision: 'APPROVE' | 'REJECT',
) {
  const suggestion = await prisma.teacherIntelligenceSuggestion.findFirst({
    where: { id: suggestionId, type: 'AI_RECOMMENDATION' },
    select: { id: true, studentId: true, teacherId: true, status: true },
  })
  if (!suggestion) return { kind: 'NOT_FOUND' as const }
  if (suggestion.status !== 'PENDING_REVIEW') return { kind: 'CONFLICT' as const }
  try {
    return await prisma.$transaction(async (tx) => reviewGeneratedSuggestionInTransaction({
      suggestionId,
      reviewerId: adminId,
      decision,
      repository: {
        isAuthorized: async () => Boolean(await tx.user.findFirst({
          where: { id: suggestion.studentId, role: studentRole },
          select: { id: true },
        })),
        findSuggestion: async () => tx.teacherIntelligenceSuggestion.findFirst({
          where: {
            id: suggestionId,
            studentId: suggestion.studentId,
            teacherId: suggestion.teacherId,
          },
          select: { id: true, studentId: true, teacherId: true, type: true, status: true, draftJson: true },
        }),
        findRecommendation: async (dedupeKey) => tx.aIRecommendation.findUnique({
          where: { studentId_dedupeKey_dedupeCycle: { studentId: suggestion.studentId, dedupeKey, dedupeCycle: 1 } },
          select: { id: true },
        }),
        createRecommendation: async (data) => tx.aIRecommendation.create({ data, select: { id: true } }),
        transitionSuggestion: async (from, to, reviewerId, at) => {
          const changed = await tx.teacherIntelligenceSuggestion.updateMany({
            where: {
              id: suggestionId,
              studentId: suggestion.studentId,
              teacherId: suggestion.teacherId,
              type: 'AI_RECOMMENDATION',
              status: from,
            },
            data: {
              status: to,
              ...(to === 'APPROVED' ? { approvedById: reviewerId, approvedAt: at } : {}),
            },
          })
          return changed.count
        },
        materializationDetails: async (draft) => {
          const profile = await tx.studentLearningProfile.findUnique({
            where: { userId: suggestion.studentId },
            select: { officialLevelId: true, officialStageId: true },
          })
          const levelId = profile?.officialLevelId || null
          const stageId = profile?.officialStageId || null
          if (draft.proposal.levelId !== levelId || draft.proposal.stageId !== stageId) {
            return { levelId, stageId, skillId: null, resourceValid: false }
          }
          if (draft.proposal.resourceId) {
            const resource = await tx.resource.findFirst({
              where: { id: draft.proposal.resourceId, isPublished: true, levelId, stageId },
              select: { skillId: true, skill: { select: { code: true } } },
            })
            const resourceValid = Boolean(resource)
              && (!draft.proposal.skillCode || resource?.skill?.code === draft.proposal.skillCode)
            return { levelId, stageId, skillId: resource?.skillId || null, resourceValid }
          }
          const skill = draft.proposal.skillCode
            ? await tx.skill.findUnique({ where: { code: draft.proposal.skillCode }, select: { id: true } })
            : null
          return {
            levelId,
            stageId,
            skillId: skill?.id || null,
            resourceValid: !draft.proposal.skillCode || Boolean(skill),
          }
        },
      },
    }))
  } catch (error) {
    if (reviewAbortKind(error) === 'FORBIDDEN') return { kind: 'NOT_FOUND' as const }
    if (reviewAbortKind(error) === 'INVALID_DRAFT') return { kind: 'INVALID_DRAFT' as const }
    if (reviewAbortKind(error) === 'CONFLICT' || isPrismaUniqueConstraintError(error)) {
      return { kind: 'CONFLICT' as const }
    }
    throw error
  }
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
    ai: {
      status: thanarahConfigured() ? 'AVAILABLE' : 'PROVIDER_UNAVAILABLE',
      mode: 'DETERMINISTIC_RECOMMENDATIONS',
      proposalGeneration: thanarahConfigured() ? 'PROVIDER_ENABLED' : 'PROVIDER_UNAVAILABLE',
    },
  }
}

export async function adminIntelligenceSettings() {
  return {
    mode: 'DETERMINISTIC_RECOMMENDATIONS',
    aiProvider: {
      status: thanarahConfigured() ? 'AVAILABLE' : 'PROVIDER_UNAVAILABLE',
      available: thanarahConfigured(),
      proposalGeneration: thanarahConfigured() ? 'PROVIDER_ENABLED' : 'PROVIDER_UNAVAILABLE',
    },
    recommendationStatuses: ['PENDING', 'ACCEPTED', 'COMPLETED', 'DISMISSED', 'EXPIRED'],
    suggestionApprovalCreatesStudentRecord: false,
  }
}
