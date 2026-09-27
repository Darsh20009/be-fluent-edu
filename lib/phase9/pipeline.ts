import type { Prisma } from '@prisma/client'
import {
  normalizePublishedFeedbackSignals,
  normalizeReviewedHomeworkSignal,
  normalizeSpeakingActivitySignal,
  type NormalizedLearningSignal,
} from './engine'

type LearningPipelineClient = Pick<
  Prisma.TransactionClient,
  'learningSignal' | 'studentLearningProfile' | 'skill' | 'sessionFeedback' | 'speakingRoom'
>

function assertDatabaseEnabled() {
  if (process.env.PHASE5_DATABASE_ENABLED !== 'true') {
    throw new Error('DATABASE_UNAVAILABLE: Phase 9 signals must not access persistence while the database gate is disabled.')
  }
}

/**
 * Persist normalized signals idempotently. This helper deliberately receives
 * a transaction client, so callers can commit signals atomically with the
 * source event. Any failure is allowed to abort the source transaction.
 */
export async function persistLearningSignals(
  tx: LearningPipelineClient,
  input: readonly NormalizedLearningSignal[],
) {
  assertDatabaseEnabled()
  if (!input.length) return 0

  const studentIds = [...new Set(input.map((signal) => signal.studentId))]
  const profiles = await Promise.all(studentIds.map(async (studentId) => {
    const profile = await tx.studentLearningProfile.findUnique({
      where: { userId: studentId },
      select: { officialLevelId: true, officialStageId: true },
    })
    return [studentId, profile] as const
  }))
  const profileByStudent = new Map(profiles)
  const skillIds = new Map<string, string | null>()

  let persisted = 0
  for (const signal of input) {
    let skillId: string | null = null
    if (signal.skillCode) {
      if (!skillIds.has(signal.skillCode)) {
        const skill = await tx.skill.findUnique({
          where: { code: signal.skillCode },
          select: { id: true },
        })
        skillIds.set(signal.skillCode, skill?.id ?? null)
      }
      skillId = skillIds.get(signal.skillCode) ?? null
    }
    const profile = profileByStudent.get(signal.studentId)
    const evidence = {
      ...(signal.evidence || {}),
      ...(signal.skillCode ? { skillCode: signal.skillCode } : {}),
    }
    await tx.learningSignal.upsert({
      where: {
        studentId_dedupeKey: {
          studentId: signal.studentId,
          dedupeKey: signal.dedupeKey,
        },
      },
      create: {
        studentId: signal.studentId,
        type: signal.type,
        source: signal.source,
        sourceEntityType: signal.sourceEntityType || null,
        sourceEntityId: signal.sourceEntityId || null,
        sourceItemKey: signal.sourceItemKey || null,
        dedupeKey: signal.dedupeKey,
        skillId,
        levelId: signal.levelId || profile?.officialLevelId || null,
        stageId: signal.stageId || profile?.officialStageId || null,
        topicKey: signal.topicKey || null,
        strength: signal.strength,
        occurredAt: signal.occurredAt,
        expiresAt: signal.expiresAt || null,
        evidenceJson: Object.keys(evidence).length ? JSON.stringify(evidence) : null,
      },
      // Signals are immutable evidence. Replaying a source event is a no-op.
      update: {},
    })
    persisted += 1
  }
  return persisted
}

export async function persistPublishedFeedbackSignals(
  tx: LearningPipelineClient,
  feedbackId: string,
  publishedAt: Date,
) {
  assertDatabaseEnabled()
  const feedback = await tx.sessionFeedback.findUnique({
    where: { id: feedbackId },
    include: { expressions: true, mistakes: true, pronunciation: true, ebi: true },
  })
  if (!feedback || feedback.status !== 'PUBLISHED') {
    throw new Error('Published feedback source was not found in its expected state.')
  }
  const signals = normalizePublishedFeedbackSignals({
    id: feedback.id,
    studentId: feedback.studentId,
    status: 'PUBLISHED',
    publishedAt,
    // Explicit student-visible fields only. In particular, teacherNotes and
    // any internal/revision metadata are never passed to the normalizer.
    expressions: feedback.expressions.map(({ expression, category }) => ({ expression, category })),
    mistakes: feedback.mistakes.map(({ original, correction, explanation }) => ({ original, correction, explanation })),
    pronunciation: feedback.pronunciation.map(({ target, guidance, phonetic }) => ({ target, guidance, phonetic })),
    ebi: feedback.ebi.map(({ betterExpression, explanation, priority }) => ({ betterExpression, explanation, priority })),
  })
  return persistLearningSignals(tx, signals)
}

export async function persistReviewedHomeworkSignal(
  tx: LearningPipelineClient,
  input: {
    submissionId: string
    homeworkId: string
    studentId: string
    reviewedAt: Date
    score: number | null | undefined
  },
) {
  assertDatabaseEnabled()
  const signal = normalizeReviewedHomeworkSignal({
    ...input,
    status: 'REVIEWED',
  })
  return signal ? persistLearningSignals(tx, [signal]) : 0
}

export async function persistSpeakingActivitySignal(
  tx: LearningPipelineClient,
  input: {
    studentId: string
    roomId: string
    messageId: string
    createdAt: Date
  },
) {
  assertDatabaseEnabled()
  const room = await tx.speakingRoom.findUnique({
    where: { id: input.roomId },
    select: { topic: true },
  })
  if (!room) throw new Error('Speaking room source was not found while creating its learning signal.')
  const signal = normalizeSpeakingActivitySignal({
    ...input,
    topicKey: room.topic,
    difficultyReported: false,
  })
  return persistLearningSignals(tx, [signal])
}