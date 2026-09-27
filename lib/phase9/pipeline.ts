import type { Prisma } from '@prisma/client'
import { goalsSchema } from '@/lib/phase4'
import {
  normalizeExplicitAbsenceSignal,
  normalizePublishedFeedbackSignals,
  normalizeReviewedHomeworkSignal,
  normalizeSpeakingActivitySignal,
  normalizeStudentGoalSignal,
  type NormalizedLearningSignal,
} from './engine'

type LearningPipelineClient = Pick<
  Prisma.TransactionClient,
  'learningSignal' | 'studentLearningProfile' | 'studentProfile' | 'skill' | 'sessionFeedback' | 'speakingRoom'
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

type StudentGoalSlot = 'overallGoal' | 'monthlyGoal' | 'weeklyFocus'

function goalTopicKey(goal: string) {
  return goal.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

async function supersedeSignals(
  tx: LearningPipelineClient,
  studentId: string,
  ids: readonly string[],
  occurredAt: Date,
) {
  if (!ids.length) return
  await tx.learningSignal.updateMany({
    where: { studentId, id: { in: [...ids] } },
    data: { expiresAt: occurredAt },
  })
}

/**
 * Reconcile only goals already saved by a domain write. Each goal slot has a
 * stable source reference; edits expire the prior signal instead of deleting
 * evidence. Re-adding an older goal creates a new historical revision.
 */
export async function persistStudentGoalSignals(
  tx: LearningPipelineClient,
  input: {
    studentId: string
    studentProfileId: string
    goals: Partial<Record<StudentGoalSlot, string | null | undefined>>
    occurredAt: Date
  },
) {
  assertDatabaseEnabled()
  let persisted = 0

  for (const goalSlot of ['overallGoal', 'monthlyGoal', 'weeklyFocus'] as const) {
    const history = await tx.learningSignal.findMany({
      where: {
        studentId: input.studentId,
        source: 'GOAL',
        sourceEntityType: 'StudentGoal',
        sourceEntityId: input.studentProfileId,
        sourceItemKey: goalSlot,
      },
      select: { id: true, topicKey: true, expiresAt: true },
    })
    const active = history.filter((signal) => !signal.expiresAt || signal.expiresAt > input.occurredAt)
    const goal = typeof input.goals[goalSlot] === 'string' ? input.goals[goalSlot]!.trim() : ''

    if (!goal) {
      await supersedeSignals(tx, input.studentId, active.map((signal) => signal.id), input.occurredAt)
      continue
    }

    const equivalent = active.filter((signal) => signal.topicKey === goalTopicKey(goal))
    if (equivalent.length) {
      const keepId = equivalent[0].id
      await supersedeSignals(
        tx,
        input.studentId,
        active.filter((signal) => signal.id !== keepId).map((signal) => signal.id),
        input.occurredAt,
      )
      continue
    }

    await supersedeSignals(tx, input.studentId, active.map((signal) => signal.id), input.occurredAt)
    const signal = normalizeStudentGoalSignal({
      studentId: input.studentId,
      goalId: input.studentProfileId,
      goalSlot,
      goal,
      revision: history.length + 1,
      occurredAt: input.occurredAt,
    })
    persisted += await persistLearningSignals(tx, [signal])
  }

  return persisted
}

function parseSavedGoals(value: string | null | undefined) {
  if (!value) return {}
  let decoded: unknown
  try {
    decoded = JSON.parse(value)
  } catch {
    throw new Error('Saved student goals could not be parsed; goal signals were not changed.')
  }
  const parsed = goalsSchema.safeParse(decoded)
  if (!parsed.success) throw new Error('Saved student goals are invalid; goal signals were not changed.')
  return parsed.data
}

/**
 * Read the persisted Phase 4 goal sources after a transaction has changed
 * them. The legacy StudentProfile.goal remains authoritative for overallGoal;
 * monthly and weekly goals come only from the saved learning-profile JSON.
 */
export async function persistSavedStudentGoals(tx: LearningPipelineClient, studentId: string) {
  assertDatabaseEnabled()
  const [studentProfile, existingLearningProfile] = await Promise.all([
    tx.studentProfile.findUnique({
      where: { userId: studentId },
      select: { id: true, goal: true, updatedAt: true },
    }),
    tx.studentLearningProfile.findUnique({
      where: { userId: studentId },
      select: { goalsJson: true, updatedAt: true },
    }),
  ])
  if (!studentProfile) return 0

  const savedGoals = parseSavedGoals(existingLearningProfile?.goalsJson)
  let learningProfile = existingLearningProfile
  if (learningProfile && savedGoals.overallGoal !== studentProfile.goal) {
    const synchronizedGoals = { ...savedGoals, overallGoal: studentProfile.goal }
    learningProfile = await tx.studentLearningProfile.update({
      where: { userId: studentId },
      data: { goalsJson: JSON.stringify(synchronizedGoals) },
      select: { goalsJson: true, updatedAt: true },
    })
  }
  const occurredAt = new Date(Math.max(
    studentProfile.updatedAt.getTime(),
    learningProfile?.updatedAt.getTime() || 0,
  ))

  return persistStudentGoalSignals(tx, {
    studentId,
    studentProfileId: studentProfile.id,
    goals: {
      overallGoal: studentProfile.goal,
      monthlyGoal: savedGoals.monthlyGoal,
      weeklyFocus: savedGoals.weeklyFocus,
    },
    occurredAt,
  })
}

/**
 * Attendance evidence is accepted only from the persisted Attendance row.
 * Corrections expire the active signal; a later explicit ABSENT creates a new
 * revision while leaving the old signal available in history.
 */
export async function persistAttendanceSignal(
  tx: LearningPipelineClient,
  input: {
    attendanceId: string
    studentId: string
    sessionId: string
    status: string
    occurredAt: Date
  },
) {
  assertDatabaseEnabled()
  const history = await tx.learningSignal.findMany({
    where: {
      studentId: input.studentId,
      source: 'ATTENDANCE',
      sourceEntityType: 'Attendance',
      sourceEntityId: input.attendanceId,
    },
    select: { id: true, dedupeKey: true, expiresAt: true },
  })
  const active = history.filter((signal) => !signal.expiresAt || signal.expiresAt > input.occurredAt)
  if (input.status !== 'ABSENT') {
    await supersedeSignals(tx, input.studentId, active.map((signal) => signal.id), input.occurredAt)
    return 0
  }

  if (active.length) {
    await supersedeSignals(tx, input.studentId, active.slice(1).map((signal) => signal.id), input.occurredAt)
    return 0
  }

  const signal = normalizeExplicitAbsenceSignal({
    studentId: input.studentId,
    attendanceId: input.attendanceId,
    sessionId: input.sessionId,
    status: 'ABSENT',
    revision: history.length + 1,
    occurredAt: input.occurredAt,
  })
  return persistLearningSignals(tx, [signal])
}