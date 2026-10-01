import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  calculateEvidenceMastery,
  canTransitionRecommendation,
  canTransitionDailySession,
  canTransitionDailyStep,
  completedRecommendationIds,
  dailyLearningStepSchema,
  dailyLearningPlanSchema,
  generateDeterministicRecommendations,
  normalizedSignalSchema,
  phase9DatabaseGuard,
  publishedResourceSchema,
  recommendationTypes,
  recommendationStatuses,
  recommendationIsExpired,
  type DailyLearningPlan,
  type RecommendationType,
  type DailySessionStatus,
  type DailyPlanRecommendation,
} from '@/lib/phase9/engine'

export { phase9DatabaseGuard }

function jsonArray(value: string | null | undefined): unknown[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseEvidence(value: string | null) {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const allowed = new Set(['expression', 'original', 'correction', 'target', 'guidance', 'phonetic', 'betterExpression', 'explanation', 'category', 'priority', 'score', 'topicKey', 'roomId', 'goal'])
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([key]) => allowed.has(key)))
  } catch {
    return {}
  }
}

function toNormalizedSignal(signal: {
  studentId: string
  type: string
  source: string
  sourceEntityType: string | null
  sourceEntityId: string | null
  sourceItemKey: string | null
  dedupeKey: string
  skillId: string | null
  skill?: { code: string } | null
  levelId: string | null
  stageId: string | null
  topicKey: string | null
  strength: number
  occurredAt: Date
  expiresAt: Date | null
  evidenceJson: string | null
}) {
  return normalizedSignalSchema.parse({
    studentId: signal.studentId,
    type: signal.type,
    source: signal.source,
    sourceEntityType: signal.sourceEntityType,
    sourceEntityId: signal.sourceEntityId,
    sourceItemKey: signal.sourceItemKey,
    dedupeKey: signal.dedupeKey,
    skillId: signal.skillId,
    skillCode: signal.skill?.code || null,
    levelId: signal.levelId,
    stageId: signal.stageId,
    topicKey: signal.topicKey,
    strength: signal.strength,
    occurredAt: signal.occurredAt,
    expiresAt: signal.expiresAt,
    evidence: parseEvidence(signal.evidenceJson),
  })
}

async function officialContext(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      goal: true,
      officialLevelId: true,
      officialStageId: true,
      officialLevel: { select: { id: true, code: true, name: true } },
      officialStage: { select: { id: true, code: true, name: true } },
      learningProfile: {
        select: {
          goalsJson: true,
          targetSkillsJson: true,
          strengthsJson: true,
          weaknessesJson: true,
        },
      },
    },
  })
  return student
}

export async function getStudentLearningProfile(userId: string) {
  const [student, learningProfile, progressRows] = await Promise.all([
    officialContext(userId),
    prisma.studentLearningProfile.findUnique({
      where: { userId },
      select: {
        targetSkillsJson: true, strengthsJson: true, weaknessesJson: true,
        vocabularyJson: true, pronunciationJson: true, speakingNeedsJson: true,
        engagementJson: true, lastReviewedAt: true, updatedAt: true,
      },
    }),
    prisma.learningProgress.findMany({
      where: { userId, status: 'COMPLETED', score: { not: null } },
      select: { score: true, skillId: true, levelId: true, stageId: true, skill: { select: { id: true, code: true, name: true } } },
      take: 500,
    }),
  ])

  const groups = new Map<string, { skill: { id: string; code: string; name: string } | null; levelId: string | null; stageId: string | null; scores: number[] }>()
  for (const row of progressRows) {
    if (row.score == null) continue
    const key = `${row.skillId || 'unknown'}:${row.levelId || ''}:${row.stageId || ''}`
    const group = groups.get(key) || { skill: row.skill, levelId: row.levelId, stageId: row.stageId, scores: [] }
    group.scores.push(row.score)
    groups.set(key, group)
  }

  return {
    profileAvailable: Boolean(student),
    officialLevel: student?.officialLevel || null,
    officialStage: student?.officialStage || null,
    goal: student?.goal || null,
    goals: student?.goal ? [{ id: student.id, title: student.goal }] : [],
    targetSkills: jsonArray(learningProfile?.targetSkillsJson),
    strengths: jsonArray(learningProfile?.strengthsJson),
    weaknesses: jsonArray(learningProfile?.weaknessesJson),
    vocabularyNeeds: jsonArray(learningProfile?.vocabularyJson),
    pronunciationNeeds: jsonArray(learningProfile?.pronunciationJson),
    speakingNeeds: jsonArray(learningProfile?.speakingNeedsJson),
    engagement: jsonArray(learningProfile?.engagementJson),
    mastery: [...groups.values()].map((group) => ({
      skill: group.skill,
      levelId: group.levelId,
      stageId: group.stageId,
      evidence: calculateEvidenceMastery(group.scores.map((score) => ({ completed: true, score }))),
    })).filter((item) => item.evidence !== null),
    updatedAt: learningProfile?.updatedAt || null,
    lastReviewedAt: learningProfile?.lastReviewedAt || null,
  }
}

export async function getStudentLearningSignals(userId: string) {
  const rows = await prisma.learningSignal.findMany({
    where: { studentId: userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    include: { skill: { select: { code: true, name: true } } },
    orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
    take: 250,
  })
  return rows.map((row) => {
    const signal = toNormalizedSignal(row)
    return {
      id: row.id,
      type: signal.type,
      source: signal.source,
      sourceEntityType: signal.sourceEntityType,
      sourceEntityId: signal.sourceEntityId,
      occurredAt: signal.occurredAt,
      strength: signal.strength,
      skill: row.skill,
      topicKey: signal.topicKey,
      evidence: signal.evidence || {},
    }
  })
}

async function refreshDeterministicRecommendations(userId: string) {
  const now = new Date()
  await prisma.aIRecommendation.updateMany({
    where: { studentId: userId, status: { in: ['PENDING', 'ACCEPTED'] }, expiresAt: { lte: now } },
    data: { status: 'EXPIRED' },
  })
  const [student, signalRows, historyRows] = await Promise.all([
    officialContext(userId),
    prisma.learningSignal.findMany({
      where: { studentId: userId, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      include: { skill: { select: { id: true, code: true } } },
      orderBy: { occurredAt: 'desc' },
    }),
    prisma.aIRecommendation.findMany({
      where: { studentId: userId },
      select: { dedupeKey: true, evidenceCycleKey: true, dedupeCycle: true, status: true },
      orderBy: [{ dedupeKey: 'asc' }, { dedupeCycle: 'asc' }],
    }),
  ])
  const signals = signalRows.map(toNormalizedSignal)
  const goals = [
    ...(student?.goal ? [student.goal] : []),
    ...jsonArray(student?.learningProfile?.goalsJson).filter((goal): goal is string => typeof goal === 'string'),
  ]
  const generated = generateDeterministicRecommendations({
    studentId: userId,
    signals,
    goals,
    levelId: student?.officialLevelId,
    stageId: student?.officialStageId,
    now,
    expiresAt: new Date(now.getTime() + 30 * 86_400_000),
    existingRecommendations: historyRows.map((item) => ({
      dedupeKey: item.dedupeKey,
      evidenceCycleKey: item.evidenceCycleKey,
      dedupeCycle: item.dedupeCycle,
      status: item.status,
    })),
  })
  for (const recommendation of generated) {
    const skill = recommendation.skillCode
      ? await prisma.skill.findUnique({ where: { code: recommendation.skillCode }, select: { id: true } })
      : null
    const resource = student?.officialLevelId && (!recommendation.skillCode || skill) ? await prisma.resource.findFirst({
      where: {
        isPublished: true,
        levelId: student.officialLevelId,
        stageId: student.officialStageId || null,
        skillId: skill?.id || null,
      },
      select: { id: true, title: true, resourceType: true, levelId: true, stageId: true, skillId: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }) : null
    const unique = {
      studentId_dedupeKey_dedupeCycle: {
        studentId: userId,
        dedupeKey: recommendation.dedupeKey,
        dedupeCycle: recommendation.dedupeCycle,
      },
    }
    let persisted
    try {
      persisted = await prisma.aIRecommendation.upsert({
        where: unique,
        create: {
          studentId: userId,
          type: recommendation.type,
          title: recommendation.title,
          reason: recommendation.reason,
          priority: recommendation.priority,
          levelId: student?.officialLevelId,
          stageId: student?.officialStageId,
          skillId: skill?.id,
          resourceId: resource?.id,
          dedupeKey: recommendation.dedupeKey,
          evidenceCycleKey: recommendation.evidenceCycleKey,
          dedupeCycle: recommendation.dedupeCycle,
          sourceSignalKeysJson: JSON.stringify(recommendation.sourceSignalKeys),
          payloadJson: JSON.stringify({ needKey: recommendation.needKey, resourceAvailable: Boolean(resource) }),
          status: 'PENDING',
          expiresAt: recommendation.expiresAt,
        },
        update: {},
      })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
      persisted = await prisma.aIRecommendation.findUnique({ where: unique })
      if (!persisted) throw error
    }
    if (persisted.studentId !== userId
      || persisted.dedupeKey !== recommendation.dedupeKey
      || persisted.dedupeCycle !== recommendation.dedupeCycle
      || !recommendationStatuses.includes(persisted.status as (typeof recommendationStatuses)[number])) {
        throw new Error('Recommendation uniqueness conflict returned an invalid record.')
    }
    if (recommendationIsExpired(persisted, now)) {
      await prisma.aIRecommendation.updateMany({
        where: { id: persisted.id, studentId: userId, status: persisted.status },
        data: { status: 'EXPIRED' },
      })
    }
    // A request based on a newer/older concurrent signal snapshot can race for
    // the same next cycle. The unique-index winner is authoritative; never
    // overwrite its evidence or lifecycle state with this stale computation.
    if (persisted.evidenceCycleKey !== recommendation.evidenceCycleKey) continue
  }
}

export async function getStudentRecommendations(userId: string) {
  await refreshDeterministicRecommendations(userId)
  const now = new Date()
  const rows = await prisma.aIRecommendation.findMany({
    where: { studentId: userId, status: { in: ['PENDING', 'ACCEPTED'] }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    include: {
      level: { select: { code: true, name: true } },
      stage: { select: { code: true, name: true } },
      skill: { select: { code: true, name: true } },
      resource: { select: { id: true, title: true, resourceType: true, contentRef: true, isPublished: true, levelId: true, stageId: true, skillId: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })
  return rows.map((row) => {
    const resource = row.resource?.isPublished
      && row.resource.levelId === row.levelId
      && row.resource.stageId === row.stageId
      && row.resource.skillId === row.skillId
      ? row.resource
      : null
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      reason: row.reason,
      priority: row.priority,
      status: row.status,
      level: row.level,
      stage: row.stage,
      skill: row.skill,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      sourceSignalCount: jsonArray(row.sourceSignalKeysJson).length,
      resource,
      resourceAvailability: resource ? 'AVAILABLE' : 'NO_SUITABLE_RESOURCE',
    }
  })
}

type StrictDailyRecommendation = DailyPlanRecommendation & { resource: unknown | null }

/**
 * Pure adapter for daily plan resources. Each recommendation can use only its
 * own linked resource, and that resource must exactly match server-owned
 * level/stage/skill context. It intentionally does not allow generic or
 * wrong-skill fallback resources.
 */
export function buildStrictStudentDailyPlan(input: {
  dailyKey: string
  recommendations: readonly StrictDailyRecommendation[]
  levelId?: string | null
  stageId?: string | null
  preferredMinutes?: number
}): DailyLearningPlan {
  const preferred = Math.max(10, Math.min(25, Math.round(input.preferredMinutes || 15)))
  if (!input.recommendations.length) {
    return dailyLearningPlanSchema.parse({ status: 'NO_RECOMMENDATIONS', dailyKey: input.dailyKey, totalMinutes: 0, steps: [] })
  }
  const steps = []
  let totalMinutes = 0
  for (const recommendation of input.recommendations) {
    if (steps.length >= 5 || totalMinutes >= preferred) break
    if (!input.levelId || recommendation.levelId !== input.levelId || recommendation.stageId !== (input.stageId || null)) continue
    const parsedResource = publishedResourceSchema.safeParse(recommendation.resource)
    if (!parsedResource.success) continue
    const resource = parsedResource.data
    if (!resource.isPublished
      || resource.isActive === false
      || resource.levelId !== input.levelId
      || resource.stageId !== (input.stageId || null)
      || resource.skillCode !== (recommendation.skillCode || null)) continue

    const durationMinutes = Math.min(10, preferred - totalMinutes)
    const type = recommendation.type === 'LEARN' ? 'READ'
      : recommendation.type === 'REVIEW' ? 'CORRECT'
        : recommendation.type === 'MASTERY_CHECK' ? 'MASTERY_CHECK' : 'PRACTICE'
    steps.push(dailyLearningStepSchema.parse({
      type,
      title: recommendation.title,
      durationMinutes,
      recommendationId: recommendation.id,
      resourceId: resource.id,
      skillCode: recommendation.skillCode,
      levelId: input.levelId,
      stageId: input.stageId || null,
      reason: recommendation.reason,
    }))
    totalMinutes += durationMinutes
  }
  if (!steps.length) {
    return dailyLearningPlanSchema.parse({ status: 'NO_SUITABLE_RESOURCE', dailyKey: input.dailyKey, totalMinutes: 0, steps: [] })
  }
  return dailyLearningPlanSchema.parse({ status: 'READY', dailyKey: input.dailyKey, totalMinutes, steps })
}

export async function transitionStudentRecommendation(userId: string, id: string, to: 'ACCEPTED' | 'DISMISSED') {
  const existing = await prisma.aIRecommendation.findFirst({ where: { id, studentId: userId } })
  if (!existing) return { error: 'NOT_FOUND' as const }
  if (recommendationIsExpired(existing, new Date())) {
    await prisma.aIRecommendation.updateMany({ where: { id, studentId: userId, status: existing.status }, data: { status: 'EXPIRED' } })
    return { error: 'EXPIRED' as const }
  }
  if (!canTransitionRecommendation(existing.status, to)) return { error: 'CONFLICT' as const }
  const changed = await prisma.aIRecommendation.updateMany({
    where: { id, studentId: userId, status: existing.status },
    data: { status: to },
  })
  if (changed.count !== 1) return { error: 'CONFLICT' as const }
  return { item: { id, status: to } }
}

function utcDailyKey(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

async function computeTodayPlan(userId: string, dailyKey = utcDailyKey()) {
  await refreshDeterministicRecommendations(userId)
  const now = new Date()
  const [recommendations, student] = await Promise.all([
    prisma.aIRecommendation.findMany({
      where: { studentId: userId, status: { in: ['PENDING', 'ACCEPTED'] }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      include: {
        skill: { select: { code: true } },
        resource: { select: { id: true, title: true, resourceType: true, isPublished: true, levelId: true, stageId: true, skillId: true, order: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    }),
    officialContext(userId),
  ])
  const planRecommendations: StrictDailyRecommendation[] = recommendations
    .filter((item) => recommendationTypes.includes(item.type as RecommendationType))
    .map((item) => ({
      id: item.id,
      studentId: userId,
      type: item.type as RecommendationType,
      title: item.title || 'Learning practice',
      reason: item.reason || 'Based on your recent learning evidence.',
      skillCode: item.skill?.code || null,
      levelId: item.levelId,
      stageId: item.stageId,
      resource: item.resource && item.resource.skillId === item.skillId
        ? { ...item.resource, skillCode: item.skill?.code || null }
        : null,
    }))
  const plan = buildStrictStudentDailyPlan({
    dailyKey,
    recommendations: planRecommendations,
    levelId: student?.officialLevelId,
    stageId: student?.officialStageId,
  })
  return plan
}

export async function getTodayLearning(userId: string) {
  const dailyKey = utcDailyKey()
  const session = await prisma.dailyLearningSession.findUnique({
    where: { studentId_dailyKey: { studentId: userId, dailyKey } },
    include: { steps: { orderBy: { stepIndex: 'asc' } } },
  })
  if (session) {
    return {
      session: {
        id: session.id,
        dailyKey: session.dailyKey,
        status: session.status,
        totalMinutes: session.totalMinutes,
        currentStepIndex: session.currentStepIndex,
        progressJson: session.progressJson,
        startedAt: session.startedAt,
        pausedAt: session.pausedAt,
        completedAt: session.completedAt,
        steps: session.steps.map(({ stepIndex, type, status, resourceId, durationMinutes, startedAt, completedAt }) => ({
          stepIndex, type, status, resourceId, durationMinutes, startedAt, completedAt,
        })),
      },
      plan: dailyLearningPlanSchema.parse(JSON.parse(session.planSnapshotJson)),
      snapshotImmutable: true,
    }
  }
  return { session: null, plan: await computeTodayPlan(userId, dailyKey), snapshotImmutable: false }
}

export async function startTodayLearning(userId: string) {
  const dailyKey = utcDailyKey()
  const existing = await prisma.dailyLearningSession.findUnique({ where: { studentId_dailyKey: { studentId: userId, dailyKey } } })
  if (existing) return { session: await getTodayLearning(userId), created: false }
  const plan = await computeTodayPlan(userId, dailyKey)
  if (plan.status !== 'READY' || plan.steps.length === 0) return { session: null, plan, error: plan.status }

  try {
    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.dailyLearningSession.create({
        data: {
          studentId: userId,
          dailyKey,
          status: 'NOT_STARTED',
          planSnapshotJson: JSON.stringify(plan),
          totalMinutes: plan.totalMinutes,
        },
      })
      await tx.dailyLearningSessionStep.createMany({
        data: plan.steps.map((step, stepIndex) => ({
          sessionId: created.id,
          stepIndex,
          type: step.type,
          recommendationId: step.recommendationId || undefined,
          resourceId: step.resourceId || undefined,
          durationMinutes: step.durationMinutes,
        })),
      })
      return created
    })
    return { session: await getTodayLearning(userId), created: true, id: session.id }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { session: await getTodayLearning(userId), created: false }
    }
    throw error
  }
}

export type DailyProgressAction = 'START_STEP' | 'COMPLETE_STEP' | 'SKIP_STEP' | 'PAUSE' | 'RESUME'

class DailyLearningProgressConflict extends Error {
  constructor() {
    super('Daily learning progress changed concurrently.')
    this.name = 'DailyLearningProgressConflict'
  }
}

export async function progressTodayLearning(userId: string, input: { action: DailyProgressAction; stepIndex?: number }) {
  const dailyKey = utcDailyKey()
  try {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.dailyLearningSession.findUnique({
        where: { studentId_dailyKey: { studentId: userId, dailyKey } },
        include: { steps: { orderBy: { stepIndex: 'asc' } } },
      })
      if (!session) return { error: 'NOT_FOUND' as const }

      const updateSessionStatus = async (to: DailySessionStatus) => {
        if (!canTransitionDailySession(session.status, to)) return false
        const result = await tx.dailyLearningSession.updateMany({
          where: { id: session.id, studentId: userId, status: session.status },
          data: {
            status: to,
            ...(to === 'IN_PROGRESS' && !session.startedAt ? { startedAt: new Date() } : {}),
            ...(to === 'PAUSED' ? { pausedAt: new Date() } : {}),
            ...(to === 'COMPLETED' ? { completedAt: new Date() } : {}),
            ...(to === 'ABANDONED' ? { abandonedAt: new Date() } : {}),
          },
        })
        return result.count === 1
      }

      if (input.action === 'PAUSE' || input.action === 'RESUME') {
        const to = input.action === 'PAUSE' ? 'PAUSED' : 'IN_PROGRESS'
        const ok = await updateSessionStatus(to)
        return ok ? { sessionId: session.id, status: to } : { error: 'INVALID_TRANSITION' as const }
      }

      if (!['NOT_STARTED', 'IN_PROGRESS'].includes(session.status)) return { error: 'INVALID_TRANSITION' as const }
      const stepIndex = input.stepIndex
      if (stepIndex == null || stepIndex !== session.currentStepIndex) return { error: 'INVALID_STEP' as const }
      const step = session.steps[stepIndex]
      if (!step) return { error: 'INVALID_STEP' as const }

      if (input.action === 'START_STEP') {
        if (step.status !== 'PENDING' || !canTransitionDailyStep(step.status, 'IN_PROGRESS')) {
          return { error: 'INVALID_TRANSITION' as const }
        }

        if (step.recommendationId) {
          const recommendation = await tx.aIRecommendation.findFirst({
            where: { id: step.recommendationId, studentId: userId },
            select: { status: true, expiresAt: true },
          })
          if (!recommendation || !['PENDING', 'ACCEPTED'].includes(recommendation.status)) {
            return { error: 'RECOMMENDATION_UNAVAILABLE' as const }
          }
          const now = new Date()
          if (recommendationIsExpired(recommendation, now)) {
            return { error: 'RECOMMENDATION_EXPIRED' as const }
          }
          if (recommendation.status === 'PENDING') {
            const accepted = await tx.aIRecommendation.updateMany({
              where: {
                id: step.recommendationId,
                studentId: userId,
                status: 'PENDING',
                OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
              },
              data: { status: 'ACCEPTED' },
            })
            if (accepted.count !== 1) throw new DailyLearningProgressConflict()
          }
        }

        if (session.status === 'NOT_STARTED' && !(await updateSessionStatus('IN_PROGRESS'))) {
          throw new DailyLearningProgressConflict()
        }
        const changed = await tx.dailyLearningSessionStep.updateMany({
          where: { id: step.id, sessionId: session.id, stepIndex, status: 'PENDING' },
          data: { status: 'IN_PROGRESS', startedAt: new Date() },
        })
        if (changed.count !== 1) throw new DailyLearningProgressConflict()
        return { sessionId: session.id, stepIndex, status: 'IN_PROGRESS' as const }
      }

      const to = input.action === 'COMPLETE_STEP' ? 'COMPLETED' : 'SKIPPED'
      if (!canTransitionDailyStep(step.status, to)) return { error: 'INVALID_TRANSITION' as const }
      if (session.status === 'NOT_STARTED' && !(await updateSessionStatus('IN_PROGRESS'))) {
        throw new DailyLearningProgressConflict()
      }
      const changedStep = await tx.dailyLearningSessionStep.updateMany({
        where: { id: step.id, sessionId: session.id, stepIndex, status: step.status },
        data: { status: to, ...(to === 'COMPLETED' ? { completedAt: new Date() } : {}) },
      })
      if (changedStep.count !== 1) throw new DailyLearningProgressConflict()
      const nextIndex = stepIndex + 1
      const advanced = await tx.dailyLearningSession.updateMany({
        where: { id: session.id, studentId: userId, currentStepIndex: stepIndex },
        data: { currentStepIndex: nextIndex },
      })
      if (advanced.count !== 1) throw new DailyLearningProgressConflict()
      return { sessionId: session.id, stepIndex, status: to, currentStepIndex: nextIndex }
    })
  } catch (error) {
    if (error instanceof DailyLearningProgressConflict) return { error: 'CONFLICT' as const }
    throw error
  }
}

export async function completeTodayLearning(userId: string) {
  const dailyKey = utcDailyKey()
  return prisma.$transaction(async (tx) => {
    const session = await tx.dailyLearningSession.findUnique({
      where: { studentId_dailyKey: { studentId: userId, dailyKey } },
      include: { steps: { orderBy: { stepIndex: 'asc' } } },
    })
    if (!session) return { error: 'NOT_FOUND' as const }
    if (!canTransitionDailySession(session.status, 'COMPLETED')) return { error: 'INVALID_TRANSITION' as const }
    if (!session.steps.length || session.steps.some((step) => !['COMPLETED', 'SKIPPED'].includes(step.status))) {
      return { error: 'INCOMPLETE_STEPS' as const }
    }
    const updated = await tx.dailyLearningSession.updateMany({
      where: { id: session.id, studentId: userId, status: session.status },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })
    if (updated.count !== 1) return { error: 'CONFLICT' as const }

    const recommendationIds = completedRecommendationIds(session.steps)
    if (recommendationIds.length) {
      await tx.aIRecommendation.updateMany({
        where: { studentId: userId, id: { in: recommendationIds }, status: 'ACCEPTED' },
        data: { status: 'COMPLETED' },
      })
    }
    return { sessionId: session.id, status: 'COMPLETED' as const }
  })
}

export async function abandonTodayLearning(userId: string) {
  const dailyKey = utcDailyKey()
  return prisma.$transaction(async (tx) => {
    const session = await tx.dailyLearningSession.findUnique({
      where: { studentId_dailyKey: { studentId: userId, dailyKey } },
      select: { id: true, status: true },
    })
    if (!session) return { error: 'NOT_FOUND' as const }
    if (!canTransitionDailySession(session.status, 'ABANDONED')) {
      return { error: 'INVALID_TRANSITION' as const }
    }

    const updated = await tx.dailyLearningSession.updateMany({
      where: { id: session.id, studentId: userId, status: session.status },
      data: { status: 'ABANDONED', abandonedAt: new Date() },
    })
    return updated.count === 1
      ? { sessionId: session.id, status: 'ABANDONED' as const }
      : { error: 'CONFLICT' as const }
  })
}