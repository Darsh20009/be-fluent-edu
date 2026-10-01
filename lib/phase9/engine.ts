import { NextResponse } from 'next/server'
import { z } from 'zod'

export const learningSignalTypes = [
  'MISTAKE',
  'PRONUNCIATION_NEED',
  'EBI_OPPORTUNITY',
  'VOCABULARY_NEED',
  'HOMEWORK_WEAK',
  'HOMEWORK_STRONG',
  'ATTENDANCE_ABSENCE',
  'SPEAKING_ACTIVITY',
  'SPEAKING_TOPIC_DIFFICULTY',
  'PROGRESS_EVIDENCE',
  'STUDENT_GOAL',
] as const
export const learningSignalSources = [
  'SESSION',
  'ATTENDANCE',
  'FEEDBACK',
  'HOMEWORK',
  'SPEAKING',
  'RESOURCE',
  'GOAL',
  'PROGRESS',
] as const
export const recommendationTypes = ['LEARN', 'PRACTICE', 'REVIEW', 'RECOVERY_CHECK', 'DIAGNOSTIC', 'MASTERY_CHECK'] as const
export const recommendationStatuses = ['PENDING', 'ACCEPTED', 'COMPLETED', 'DISMISSED', 'EXPIRED'] as const
export const dailySessionStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED'] as const
export const dailyStepTypes = ['READ', 'EXAMPLE', 'PRACTICE', 'REFLECT', 'CORRECT', 'SIMILAR', 'MASTERY_CHECK'] as const
export const dailyStepStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'] as const

export type LearningSignalType = (typeof learningSignalTypes)[number]
export type LearningSignalSource = (typeof learningSignalSources)[number]
export type RecommendationType = (typeof recommendationTypes)[number]
export type RecommendationStatus = (typeof recommendationStatuses)[number]
export type DailySessionStatus = (typeof dailySessionStatuses)[number]
export type DailyStepType = (typeof dailyStepTypes)[number]

/**
 * Priority is intentionally deterministic and explainable:
 * 1) evidence strength: 1-5 points; 2) repeated evidence: 0-3;
 * 3) recency: 0-3 (3 within 3 days, 2 within 7, 1 within 30);
 * 4) goal match: +2; upcoming class: +1; established mastery: -2.
 * Final priority is clamped to [1, 10]. These constants are public so API
 * builders and documentation can expose the calculation without guessing.
 */
export const PRIORITY_RULES = {
  evidenceWeight: 1,
  recurrenceWeight: 1,
  maxRecurrencePoints: 3,
  recencyWithin3Days: 3,
  recencyWithin7Days: 2,
  recencyWithin30Days: 1,
  goalRelevanceBonus: 2,
  upcomingClassBonus: 1,
  masteryPenalty: 2,
  minimum: 1,
  maximum: 10,
} as const

const boundedId = z.string().trim().min(1).max(180)
const optionalBoundedText = z.string().trim().max(500).nullable().optional()

export const normalizedSignalSchema = z.object({
  studentId: boundedId,
  type: z.enum(learningSignalTypes),
  source: z.enum(learningSignalSources),
  sourceEntityType: z.string().trim().max(80).nullable().optional(),
  sourceEntityId: z.string().trim().max(180).nullable().optional(),
  sourceItemKey: z.string().trim().max(180).nullable().optional(),
  dedupeKey: z.string().trim().min(1).max(500),
  skillId: z.string().trim().max(180).nullable().optional(),
  skillCode: z.string().trim().max(100).nullable().optional(),
  levelId: z.string().trim().max(180).nullable().optional(),
  stageId: z.string().trim().max(180).nullable().optional(),
  topicKey: z.string().trim().max(180).nullable().optional(),
  strength: z.number().finite().min(0).max(5).default(1),
  occurredAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable().optional(),
  evidence: z.record(z.string(), z.unknown()).optional(),
})
export type NormalizedLearningSignal = z.infer<typeof normalizedSignalSchema>

export const feedbackSignalInputSchema = z.object({
  id: boundedId,
  studentId: boundedId,
  status: z.literal('PUBLISHED'),
  publishedAt: z.coerce.date(),
  expressions: z.array(z.object({
    expression: z.string().trim().min(1).max(300),
    category: z.string().trim().max(80).nullable().optional(),
  })).max(100).default([]),
  mistakes: z.array(z.object({
    original: z.string().trim().min(1).max(500),
    correction: z.string().trim().min(1).max(500),
    explanation: optionalBoundedText,
    skillCode: z.string().trim().max(100).nullable().optional(),
  })).max(100).default([]),
  pronunciation: z.array(z.object({
    target: z.string().trim().min(1).max(300),
    guidance: z.string().trim().min(1).max(1000),
    phonetic: z.string().trim().max(300).nullable().optional(),
    skillCode: z.string().trim().max(100).nullable().optional(),
  })).max(100).default([]),
  ebi: z.array(z.object({
    betterExpression: z.string().trim().min(1).max(500),
    explanation: optionalBoundedText,
    priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
    skillCode: z.string().trim().max(100).nullable().optional(),
  })).max(100).default([]),
})

export const homeworkReviewSignalInputSchema = z.object({
  submissionId: boundedId,
  homeworkId: boundedId,
  studentId: boundedId,
  status: z.literal('REVIEWED'),
  reviewedAt: z.coerce.date(),
  score: z.number().finite().min(0).max(100).nullable().optional(),
  skillCode: z.string().trim().max(100).nullable().optional(),
  topicKey: z.string().trim().max(180).nullable().optional(),
})

export const speakingActivitySignalInputSchema = z.object({
  studentId: boundedId,
  roomId: boundedId,
  messageId: boundedId,
  createdAt: z.coerce.date(),
  topicKey: z.string().trim().max(180).nullable().optional(),
  difficultyReported: z.boolean().default(false),
})

export const explicitAbsenceSignalInputSchema = z.object({
  studentId: boundedId,
  attendanceId: boundedId,
  sessionId: boundedId,
  status: z.literal('ABSENT'),
  revision: z.number().int().min(1).default(1),
  occurredAt: z.coerce.date(),
})

export function phase9DatabaseGuard() {
  if (process.env.PHASE5_DATABASE_ENABLED === 'true') return null
  return NextResponse.json(
    { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Learning intelligence data is temporarily unavailable.' } },
    { status: 503 },
  )
}

function normalizeKey(value: string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function safeEvidenceRecord(value: unknown) {
  const data = value as Record<string, unknown>
  const allowed = ['expression', 'original', 'correction', 'target', 'guidance', 'phonetic', 'betterExpression', 'explanation', 'category', 'priority', 'score', 'topicKey']
  return Object.fromEntries(Object.entries(data).filter(([key]) => allowed.includes(key)))
}

export function normalizePublishedFeedbackSignals(input: unknown): NormalizedLearningSignal[] {
  const feedback = feedbackSignalInputSchema.parse(input)
  const occurredAt = feedback.publishedAt
  const signals: NormalizedLearningSignal[] = []
  const mistakeCounts = new Map<string, number>()
  for (const mistake of feedback.mistakes) {
    const key = normalizeKey(mistake.original)
    mistakeCounts.set(key, (mistakeCounts.get(key) || 0) + 1)
  }
  feedback.mistakes.forEach((mistake, index) => {
    const topicKey = normalizeKey(mistake.original)
    signals.push(normalizedSignalSchema.parse({
      studentId: feedback.studentId, type: 'MISTAKE', source: 'FEEDBACK',
      sourceEntityType: 'SessionFeedback', sourceEntityId: feedback.id, sourceItemKey: `mistake:${index}`,
      dedupeKey: `feedback:${feedback.id}:mistake:${index}:${topicKey}`,
      skillCode: mistake.skillCode || 'GRAMMAR', topicKey,
      strength: Math.min(5, 1 + (mistakeCounts.get(topicKey)! > 1 ? mistakeCounts.get(topicKey)! - 1 : 0)),
      occurredAt, evidence: safeEvidenceRecord(mistake),
    }))
  })
  feedback.pronunciation.forEach((item, index) => {
    const topicKey = normalizeKey(item.target)
    signals.push(normalizedSignalSchema.parse({
      studentId: feedback.studentId, type: 'PRONUNCIATION_NEED', source: 'FEEDBACK',
      sourceEntityType: 'SessionFeedback', sourceEntityId: feedback.id, sourceItemKey: `pronunciation:${index}`,
      dedupeKey: `feedback:${feedback.id}:pronunciation:${index}:${topicKey}`,
      skillCode: item.skillCode || 'PRONUNCIATION', topicKey, strength: 3, occurredAt,
      evidence: safeEvidenceRecord(item),
    }))
  })
  feedback.ebi.forEach((item, index) => {
    const topicKey = normalizeKey(item.betterExpression)
    signals.push(normalizedSignalSchema.parse({
      studentId: feedback.studentId, type: 'EBI_OPPORTUNITY', source: 'FEEDBACK',
      sourceEntityType: 'SessionFeedback', sourceEntityId: feedback.id, sourceItemKey: `ebi:${index}`,
      dedupeKey: `feedback:${feedback.id}:ebi:${index}:${topicKey}`,
      skillCode: item.skillCode || null, topicKey,
      strength: item.priority === 'HIGH' ? 3 : item.priority === 'LOW' ? 1 : 2,
      occurredAt, evidence: safeEvidenceRecord(item),
    }))
  })
  feedback.expressions.forEach((item, index) => {
    if (!['VOCABULARY', 'IDIOM', 'SLANG', 'CHUNK'].includes((item.category || '').toUpperCase())) return
    const topicKey = normalizeKey(item.expression)
    signals.push(normalizedSignalSchema.parse({
      studentId: feedback.studentId, type: 'VOCABULARY_NEED', source: 'FEEDBACK',
      sourceEntityType: 'SessionFeedback', sourceEntityId: feedback.id, sourceItemKey: `expression:${index}`,
      dedupeKey: `feedback:${feedback.id}:expression:${index}:${topicKey}`,
      skillCode: 'VOCABULARY', topicKey, strength: 1, occurredAt,
      evidence: safeEvidenceRecord(item),
    }))
  })
  return signals
}

export function normalizeReviewedHomeworkSignal(input: unknown): NormalizedLearningSignal | null {
  const review = homeworkReviewSignalInputSchema.parse(input)
  if (review.score == null) return null
  const weak = review.score < 60
  return normalizedSignalSchema.parse({
    studentId: review.studentId,
    type: weak ? 'HOMEWORK_WEAK' : 'HOMEWORK_STRONG',
    source: 'HOMEWORK',
    sourceEntityType: 'HomeworkSubmission',
    sourceEntityId: review.submissionId,
    sourceItemKey: review.homeworkId,
    dedupeKey: `homework-review:${review.submissionId}`,
    skillCode: review.skillCode || null,
    topicKey: review.topicKey || null,
    strength: weak ? Math.max(1, Math.min(5, Math.ceil((60 - review.score) / 12))) : Math.max(1, Math.min(5, Math.ceil((review.score - 60) / 10))),
    occurredAt: review.reviewedAt,
    evidence: { score: review.score },
  })
}

export function normalizeSpeakingActivitySignal(input: unknown): NormalizedLearningSignal {
  const activity = speakingActivitySignalInputSchema.parse(input)
  const topicKey = activity.topicKey ? normalizeKey(activity.topicKey) : null
  const type = activity.difficultyReported ? 'SPEAKING_TOPIC_DIFFICULTY' : 'SPEAKING_ACTIVITY'
  return normalizedSignalSchema.parse({
    studentId: activity.studentId, type, source: 'SPEAKING',
    sourceEntityType: 'SpeakingRoomMessage', sourceEntityId: activity.messageId,
    sourceItemKey: activity.roomId,
    dedupeKey: `speaking:${activity.messageId}`,
    skillCode: 'SPEAKING', topicKey, strength: activity.difficultyReported ? 3 : 1,
    occurredAt: activity.createdAt,
    evidence: { roomId: activity.roomId, ...(topicKey ? { topicKey } : {}) },
  })
}

export function normalizeStudentGoalSignal(input: {
  studentId: string
  goalId: string
  goalSlot: 'overallGoal' | 'monthlyGoal' | 'weeklyFocus'
  goal: string
  revision: number
  occurredAt: Date
  targetSkillCode?: string | null
}): NormalizedLearningSignal {
  const topicKey = normalizeKey(input.goal)
  return normalizedSignalSchema.parse({
    studentId: input.studentId, type: 'STUDENT_GOAL', source: 'GOAL',
    sourceEntityType: 'StudentGoal', sourceEntityId: input.goalId,
    sourceItemKey: input.goalSlot,
    dedupeKey: `goal:${input.goalId}:${input.goalSlot}:${topicKey}:${input.revision}`,
    skillCode: input.targetSkillCode || null, topicKey, strength: 2,
    occurredAt: input.occurredAt, evidence: { goal: input.goal },
  })
}

export function normalizeExplicitAbsenceSignal(input: unknown): NormalizedLearningSignal {
  const absence = explicitAbsenceSignalInputSchema.parse(input)
  return normalizedSignalSchema.parse({
    studentId: absence.studentId,
    type: 'ATTENDANCE_ABSENCE',
    source: 'ATTENDANCE',
    sourceEntityType: 'Attendance',
    sourceEntityId: absence.attendanceId,
    sourceItemKey: absence.sessionId,
    dedupeKey: `attendance:${absence.attendanceId}:absence:${absence.revision}`,
    strength: 3,
    occurredAt: absence.occurredAt,
    evidence: { status: 'ABSENT' },
  })
}

export function signalSourceReference(signal: NormalizedLearningSignal) {
  return {
    source: signal.source,
    sourceEntityType: signal.sourceEntityType || null,
    sourceEntityId: signal.sourceEntityId || null,
    sourceItemKey: signal.sourceItemKey || null,
  }
}

export function calculateRecommendationPriority(input: {
  signals: readonly NormalizedLearningSignal[]
  now: Date
  goalTopicKeys?: readonly string[]
  upcomingClassRelevant?: boolean
  masteryEstablished?: boolean
}) {
  if (input.signals.length === 0) return null
  const signalStrength = Math.max(...input.signals.map((signal) => signal.strength))
  const recurrence = Math.min(PRIORITY_RULES.maxRecurrencePoints, Math.max(0, input.signals.length - 1))
  const mostRecentAt = Math.max(...input.signals.map((signal) => signal.occurredAt.getTime()))
  const ageDays = Math.max(0, (input.now.getTime() - mostRecentAt) / 86_400_000)
  const recency = ageDays <= 3 ? 3 : ageDays <= 7 ? 2 : ageDays <= 30 ? 1 : 0
  const topicKeys = new Set(input.signals.map((signal) => signal.topicKey).filter((value): value is string => Boolean(value)))
  const goalMatch = (input.goalTopicKeys || []).some((goal) => topicKeys.has(normalizeKey(goal))) ? 2 : 0
  const priority = signalStrength + recurrence + recency + goalMatch
    + (input.upcomingClassRelevant ? PRIORITY_RULES.upcomingClassBonus : 0)
    - (input.masteryEstablished ? PRIORITY_RULES.masteryPenalty : 0)
  return Math.max(PRIORITY_RULES.minimum, Math.min(PRIORITY_RULES.maximum, Math.round(priority)))
}

export const recommendationRuleSchema = z.object({
  id: boundedId,
  studentId: boundedId,
  type: z.enum(recommendationTypes),
  needKey: z.string().trim().min(1).max(180),
  title: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1).max(500),
  skillCode: z.string().trim().max(100).nullable().optional(),
  levelId: z.string().trim().max(180).nullable().optional(),
  stageId: z.string().trim().max(180).nullable().optional(),
  signals: z.array(normalizedSignalSchema).min(1).max(100),
  goals: z.array(z.string().trim().max(180)).default([]),
  now: z.coerce.date(),
  expiresAt: z.coerce.date().nullable().optional(),
})
export type DeterministicRecommendation = z.infer<typeof recommendationRuleSchema> & {
  dedupeKey: string
  evidenceCycleKey: string
  dedupeCycle: number
  priority: number
  status: 'PENDING'
  sourceSignalKeys: string[]
}

export function recommendationDedupeKey(studentId: string, _type: RecommendationType, needKey: string, needCategory?: string) {
  // The unresolved learning need, not the selected action, is the dedupe identity.
  // A need can change from PRACTICE to REVIEW as evidence accumulates.
  const category = needCategory ? `${normalizeKey(needCategory)}:` : ''
  return `${studentId}:${category}${normalizeKey(needKey)}`
}

export function recommendationEvidenceCycleKey(signals: readonly NormalizedLearningSignal[]) {
  const newestSignal = [...signals].sort((left, right) =>
    right.occurredAt.getTime() - left.occurredAt.getTime()
      || right.dedupeKey.localeCompare(left.dedupeKey),
  )[0]
  return newestSignal?.dedupeKey || null
}

export function generateDeterministicRecommendations(input: {
  studentId: string
  signals: readonly NormalizedLearningSignal[]
  goals?: readonly string[]
  levelId?: string | null
  stageId?: string | null
  now: Date
  expiresAt?: Date | null
  activeDedupeKeys?: readonly string[]
  existingRecommendations?: readonly {
    dedupeKey: string
    evidenceCycleKey?: string | null
    dedupeCycle?: number
    status: string
  }[]
}): DeterministicRecommendation[] {
  const groups = new Map<string, NormalizedLearningSignal[]>()
  for (const signal of input.signals) {
    if (signal.studentId !== input.studentId || signal.expiresAt && signal.expiresAt <= input.now) continue
    const kind = signal.type === 'MISTAKE' ? 'MISTAKE'
      : signal.type === 'PRONUNCIATION_NEED' ? 'PRONUNCIATION_NEED'
        : signal.type === 'VOCABULARY_NEED' ? 'VOCABULARY_NEED'
          : signal.type === 'HOMEWORK_WEAK' ? 'HOMEWORK_WEAK'
            : signal.type === 'HOMEWORK_STRONG' ? 'HOMEWORK_STRONG'
              : signal.type === 'ATTENDANCE_ABSENCE' ? 'ATTENDANCE_ABSENCE'
                : signal.type === 'SPEAKING_TOPIC_DIFFICULTY' ? 'SPEAKING_TOPIC_DIFFICULTY'
                  : signal.type === 'EBI_OPPORTUNITY' ? 'EBI_OPPORTUNITY' : null
    if (!kind) continue
    const needKey = signal.topicKey || signal.skillCode || kind
    const groupKey = `${kind}:${normalizeKey(needKey)}`
    groups.set(groupKey, [...(groups.get(groupKey) || []), signal])
  }

  const recs: DeterministicRecommendation[] = []
  for (const [groupKey, signals] of groups) {
    const [kind, ...needParts] = groupKey.split(':')
    const needKey = needParts.join(':')
    const repeated = signals.length >= 2
    let type: RecommendationType
    let title: string
    let reason: string
    const skillCode = signals.find((signal) => signal.skillCode)?.skillCode || null
    if (kind === 'MISTAKE') {
      const evidence = signals.find((signal) => {
        const details = signal.evidence as Record<string, unknown> | undefined
        return typeof details?.original === 'string' && typeof details?.correction === 'string'
      })?.evidence as Record<string, unknown> | undefined
      if (!evidence) continue
      const original = String(evidence.original).slice(0, 180)
      const correction = String(evidence.correction).slice(0, 180)
      type = repeated ? 'REVIEW' : 'PRACTICE'
      title = `${repeated ? 'Review' : 'Practice'} ${needKey}`
      reason = repeated
        ? `Published feedback corrected “${original}” to “${correction}” in ${signals.length} entries.`
        : `Your published feedback corrected “${original}” to “${correction}”.`
    } else if (kind === 'PRONUNCIATION_NEED') {
      type = 'PRACTICE'; title = `Practice pronunciation: ${needKey}`
      reason = repeated ? `Your published feedback highlighted ${needKey} in ${signals.length} entries.` : `Your published feedback includes pronunciation guidance for ${needKey}.`
    } else if (kind === 'VOCABULARY_NEED') {
      type = repeated ? 'PRACTICE' : 'LEARN'; title = `Build vocabulary: ${needKey}`
      reason = repeated ? `Published feedback has highlighted ${needKey} more than once.` : `Your published feedback marked ${needKey} as a vocabulary item to learn.`
    } else if (kind === 'HOMEWORK_WEAK') {
      type = 'RECOVERY_CHECK'; title = `Revisit ${needKey}`
      reason = 'A reviewed homework score was below the defined 60-point practice threshold.'
    } else if (kind === 'HOMEWORK_STRONG') {
      type = 'MASTERY_CHECK'; title = `Check mastery: ${needKey}`
      reason = 'A reviewed homework score was at least 60; a short mastery check can confirm retention.'
    } else if (kind === 'ATTENDANCE_ABSENCE') {
      type = 'RECOVERY_CHECK'; title = 'Reconnect with recent learning'
      reason = 'Recent attendance records show an absence that may need a short recovery review.'
    } else if (kind === 'SPEAKING_TOPIC_DIFFICULTY') {
      type = 'PRACTICE'; title = `Practice speaking: ${needKey}`
      reason = `You reported difficulty with ${needKey} during speaking practice.`
    } else {
      type = 'PRACTICE'; title = `Apply this improvement: ${needKey}`
      reason = 'Published teacher feedback includes an improvement opportunity for this topic.'
    }
    const dedupeKey = recommendationDedupeKey(input.studentId, type, needKey, `${kind}:${skillCode || 'unspecified'}`)
    const evidenceCycleKey = recommendationEvidenceCycleKey(signals)
    if (!evidenceCycleKey) continue
    const matchingHistory = (input.existingRecommendations || []).filter((recommendation) => recommendation.dedupeKey === dedupeKey)
    const unresolved = matchingHistory.some((recommendation) => ['PENDING', 'ACCEPTED'].includes(recommendation.status))
    if (unresolved || input.activeDedupeKeys?.includes(dedupeKey)) continue
    if (matchingHistory.some((recommendation) => recommendation.evidenceCycleKey === evidenceCycleKey)) continue
    const dedupeCycle = matchingHistory.reduce((maximum, recommendation) => Math.max(maximum, recommendation.dedupeCycle || 1), 0) + 1
    const signalPriority = calculateRecommendationPriority({
      signals, now: input.now, goalTopicKeys: input.goals,
      masteryEstablished: kind === 'HOMEWORK_STRONG',
    }) || PRIORITY_RULES.minimum
    recs.push({
      id: `det:${dedupeKey}:${dedupeCycle}`,
      studentId: input.studentId,
      type,
      needKey,
      title,
      reason,
      skillCode,
      levelId: input.levelId || null,
      stageId: input.stageId || null,
      signals,
      goals: [...(input.goals || [])],
      now: input.now,
      expiresAt: input.expiresAt || null,
      dedupeKey,
      evidenceCycleKey,
      dedupeCycle,
      priority: signalPriority,
      status: 'PENDING',
      sourceSignalKeys: signals.map((signal) => signal.dedupeKey),
    })
  }
  return recs.sort((a, b) => b.priority - a.priority || a.dedupeKey.localeCompare(b.dedupeKey))
}

export const recommendationStatusTransitions: Record<RecommendationStatus, readonly RecommendationStatus[]> = {
  PENDING: ['ACCEPTED', 'DISMISSED', 'EXPIRED'],
  ACCEPTED: ['COMPLETED', 'DISMISSED', 'EXPIRED'],
  COMPLETED: [],
  DISMISSED: [],
  EXPIRED: [],
}

export function canTransitionRecommendation(from: string, to: string) {
  return recommendationStatuses.includes(from as RecommendationStatus)
    && recommendationStatuses.includes(to as RecommendationStatus)
    && recommendationStatusTransitions[from as RecommendationStatus].includes(to as RecommendationStatus)
}

export function recommendationIsExpired(recommendation: { status: string; expiresAt?: Date | null }, now: Date) {
  return ['PENDING', 'ACCEPTED'].includes(recommendation.status)
    && Boolean(recommendation.expiresAt && recommendation.expiresAt <= now)
}

export function calculateEvidenceMastery(evidence: readonly { completed: boolean; score: number | null }[]) {
  const scores = evidence.filter((item) => item.completed && item.score !== null).map((item) => item.score as number)
  if (scores.length < 3) return null
  return {
    score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    evidenceCount: scores.length,
    source: 'COMPLETED_SCORED_EVIDENCE' as const,
  }
}

export const publishedResourceSchema = z.object({
  id: boundedId,
  title: z.string().trim().min(1).max(200),
  resourceType: z.string().trim().min(1).max(80),
  isPublished: z.literal(true),
  isActive: z.boolean().optional(),
  levelId: z.string().trim().max(180).nullable().optional(),
  stageId: z.string().trim().max(180).nullable().optional(),
  skillCode: z.string().trim().max(100).nullable().optional(),
  order: z.number().int().default(0),
})
export type PublishedLearningResource = z.infer<typeof publishedResourceSchema>

export function selectPublishedResource(input: {
  resources: readonly unknown[]
  skillCode?: string | null
  levelId?: string | null
  stageId?: string | null
}) {
  return input.resources
    .map((resource) => publishedResourceSchema.safeParse(resource))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data)
    .filter((resource) => resource.isPublished && resource.isActive !== false)
    .filter((resource) => !input.skillCode || resource.skillCode === input.skillCode)
    .filter((resource) => !input.levelId || resource.levelId === input.levelId)
    .filter((resource) => !input.stageId || resource.stageId === input.stageId)
    .sort((a, b) => {
      return a.order - b.order || a.id.localeCompare(b.id)
    })[0] || null
}

export const dailyLearningStepSchema = z.object({
  type: z.enum(dailyStepTypes),
  title: z.string().trim().min(1).max(200),
  durationMinutes: z.number().int().min(1).max(25),
  recommendationId: z.string().trim().max(180).nullable().optional(),
  resourceId: z.string().trim().max(180).nullable().optional(),
  skillCode: z.string().trim().max(100).nullable().optional(),
  levelId: z.string().trim().max(180).nullable().optional(),
  stageId: z.string().trim().max(180).nullable().optional(),
  reason: z.string().trim().min(1).max(500),
})
export type DailyLearningStep = z.infer<typeof dailyLearningStepSchema>

export const dailyLearningPlanSchema = z.object({
  status: z.enum(['READY', 'NO_RECOMMENDATIONS', 'NO_SUITABLE_RESOURCE']),
  dailyKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalMinutes: z.number().int().min(0).max(25),
  steps: z.array(dailyLearningStepSchema).max(5),
})
export type DailyLearningPlan = z.infer<typeof dailyLearningPlanSchema>
export type DailyPlanRecommendation = Pick<
  DeterministicRecommendation,
  'id' | 'studentId' | 'type' | 'title' | 'reason' | 'skillCode' | 'levelId' | 'stageId'
>

export function buildDailyLearningPlan(input: {
  dailyKey: string
  recommendations: readonly DailyPlanRecommendation[]
  resources: readonly unknown[]
  preferredMinutes?: number
  levelId?: string | null
  stageId?: string | null
}): DailyLearningPlan {
  const preferred = Math.max(10, Math.min(25, Math.round(input.preferredMinutes || 15)))
  if (!input.recommendations.length) return dailyLearningPlanSchema.parse({ status: 'NO_RECOMMENDATIONS', dailyKey: input.dailyKey, totalMinutes: 0, steps: [] })
  const steps: DailyLearningStep[] = []
  let total = 0
  for (const recommendation of input.recommendations) {
    if (steps.length >= 5 || total >= preferred) break
    const levelId = recommendation.levelId || input.levelId
    const stageId = recommendation.stageId || input.stageId
    const resource = selectPublishedResource({
      resources: input.resources,
      skillCode: recommendation.skillCode,
      levelId,
      stageId,
    })
    if (!resource) continue
    const remaining = preferred - total
    const durationMinutes = Math.min(10, remaining)
    const type: DailyStepType = recommendation.type === 'LEARN' ? 'READ'
      : recommendation.type === 'REVIEW' ? 'CORRECT'
        : recommendation.type === 'MASTERY_CHECK' ? 'MASTERY_CHECK' : 'PRACTICE'
    steps.push(dailyLearningStepSchema.parse({
      type, title: recommendation.title, durationMinutes,
      recommendationId: recommendation.id, resourceId: resource.id,
      skillCode: recommendation.skillCode, levelId: levelId || null,
      stageId: stageId || null, reason: recommendation.reason,
    }))
    total += durationMinutes
  }
  if (!steps.length) return dailyLearningPlanSchema.parse({ status: 'NO_SUITABLE_RESOURCE', dailyKey: input.dailyKey, totalMinutes: 0, steps: [] })
  // Short plans are topped up only by real selected resources, never synthetic work.
  while (total < Math.min(10, preferred) && steps.length < 5) {
    const source = steps[steps.length - 1]
    const increment = Math.min(5, Math.min(10, preferred) - total)
    steps.push(dailyLearningStepSchema.parse({ ...source, type: 'REFLECT', title: `Reflect: ${source.title}`, durationMinutes: increment }))
    total += increment
  }
  return dailyLearningPlanSchema.parse({ status: 'READY', dailyKey: input.dailyKey, totalMinutes: total, steps })
}

export const dailySessionTransitionMap: Record<DailySessionStatus, readonly DailySessionStatus[]> = {
  NOT_STARTED: ['IN_PROGRESS', 'ABANDONED'],
  IN_PROGRESS: ['PAUSED', 'COMPLETED', 'ABANDONED'],
  PAUSED: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
  COMPLETED: [],
  ABANDONED: [],
}

export function canTransitionDailySession(from: string, to: string) {
  return dailySessionStatuses.includes(from as DailySessionStatus)
    && dailySessionStatuses.includes(to as DailySessionStatus)
    && dailySessionTransitionMap[from as DailySessionStatus].includes(to as DailySessionStatus)
}

export function completedRecommendationIds(
  steps: readonly { status: string; recommendationId?: string | null }[],
) {
  const ids = new Set<string>()
  for (const step of steps) {
    const id = step.recommendationId?.trim()
    if (step.status === 'COMPLETED' && id) ids.add(id)
  }
  return [...ids]
}

export function canTransitionDailyStep(from: string, to: string) {
  const transitions: Record<(typeof dailyStepStatuses)[number], readonly string[]> = {
    PENDING: ['IN_PROGRESS', 'SKIPPED'],
    IN_PROGRESS: ['COMPLETED', 'SKIPPED'],
    COMPLETED: [],
    SKIPPED: [],
  }
  return dailyStepStatuses.includes(from as (typeof dailyStepStatuses)[number]) && transitions[from as (typeof dailyStepStatuses)[number]].includes(to)
}

export const dailySessionProgressSchema = z.object({
  currentStepIndex: z.number().int().min(0).max(5),
  completedStepIndexes: z.array(z.number().int().min(0).max(4)).max(5),
  stepStatuses: z.array(z.enum(dailyStepStatuses)).max(5),
})

export function dailyPlanSnapshotIsImmutable(originalSnapshot: string, nextSnapshot: string) {
  return originalSnapshot === nextSnapshot
}

export const teacherSuggestionSchema = z.object({
  studentId: boundedId,
  type: z.enum(['FEEDBACK_EXPRESSION', 'MISTAKE', 'EBI', 'HOMEWORK', 'VOCABULARY', 'SPEAKING_PROMPT', 'RESOURCE']),
  draft: z.record(z.string(), z.unknown()),
  reason: z.string().trim().min(1).max(500),
  expiresAt: z.coerce.date().nullable().optional(),
})
export const teacherSuggestionApprovalSchema = z.object({ approved: z.literal(true) })

export function publicRecommendationReason(reason: string) {
  return reason.trim().slice(0, 500)
}
