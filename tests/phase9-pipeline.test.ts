import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import type { Prisma } from '@prisma/client'
import {
  persistAttendanceSignal,
  persistPublishedFeedbackSignals,
  persistSavedStudentGoals,
  persistReviewedHomeworkSignal,
  persistSpeakingActivitySignal,
  persistStudentGoalSignals,
} from '@/lib/phase9/pipeline'

type MockSignalRow = {
  id: string
  studentId: string
  source?: string
  sourceEntityType?: string
  sourceEntityId?: string
  sourceItemKey?: string
  dedupeKey: string
  topicKey?: string | null
  expiresAt: Date | null
  evidenceJson?: string | null
  [key: string]: unknown
}

function makeTransaction(options: {
  feedback?: Record<string, unknown>
  roomTopic?: string
  existingSkillId?: string | null
  savedStudentProfile?: Record<string, unknown> | null
  savedLearningProfile?: Record<string, unknown> | null
  signals?: Array<Record<string, unknown>>
} = {}) {
  const writes: Array<Record<string, unknown>> = []
  const signalRows: MockSignalRow[] = (options.signals || []).map((signal, index) => ({
    id: `signal-existing-${index + 1}`,
    studentId: 'student-1',
    dedupeKey: `existing-${index + 1}`,
    expiresAt: null,
    ...signal,
  }))
  const calls = { profile: 0, skill: 0, feedback: 0, room: 0, signalFind: 0, signalUpdate: 0, studentProfile: 0 }
  const tx = {
    studentLearningProfile: {
      findUnique: async (args: Record<string, unknown>) => {
        const select = args.select as Record<string, unknown> | undefined
        if (select?.goalsJson) return options.savedLearningProfile || null
        calls.profile += 1
        return { officialLevelId: 'level-official', officialStageId: 'stage-official' }
      },
      update: async (args: Record<string, unknown>) => {
        const data = args.data as Record<string, unknown>
        options.savedLearningProfile = { ...options.savedLearningProfile, ...data }
        return options.savedLearningProfile
      },
    },
    studentProfile: {
      findUnique: async () => {
        calls.studentProfile += 1
        return options.savedStudentProfile || null
      },
    },
    skill: {
      findUnique: async () => {
        calls.skill += 1
        return options.existingSkillId ? { id: options.existingSkillId } : null
      },
    },
    sessionFeedback: {
      findUnique: async () => {
        calls.feedback += 1
        return options.feedback || null
      },
    },
    speakingRoom: {
      findUnique: async () => {
        calls.room += 1
        return options.roomTopic ? { topic: options.roomTopic } : null
      },
    },
    learningSignal: {
      findMany: async (args: Record<string, unknown>) => {
        calls.signalFind += 1
        const where = (args.where as Record<string, unknown> | undefined) || {}
        return signalRows.filter((signal) =>
          (!where.studentId || signal.studentId === where.studentId)
          && (!where.source || signal.source === where.source)
          && (!where.sourceEntityType || signal.sourceEntityType === where.sourceEntityType)
          && (!where.sourceEntityId || signal.sourceEntityId === where.sourceEntityId)
          && (!where.sourceItemKey || signal.sourceItemKey === where.sourceItemKey),
        )
      },
      updateMany: async (args: Record<string, unknown>) => {
        calls.signalUpdate += 1
        const where = args.where as { studentId: string; id?: { in?: string[] } }
        const ids = where.id?.in || []
        const data = args.data as Record<string, unknown>
        let count = 0
        for (const signal of signalRows) {
          if (signal.studentId === where.studentId && ids.includes(signal.id)) {
            Object.assign(signal, data)
            count += 1
          }
        }
        return { count }
      },
      upsert: async (args: Record<string, unknown>) => {
        writes.push(args)
        const create = args.create as Record<string, unknown>
        const existing = signalRows.find((signal) => signal.studentId === create.studentId && signal.dedupeKey === create.dedupeKey)
        if (!existing) signalRows.push({
          ...create,
          id: `signal-${signalRows.length + 1}`,
          expiresAt: (create.expiresAt as Date | null | undefined) ?? null,
        } as MockSignalRow)
        return { id: `signal-${writes.length}` }
      },
    },
  } as unknown as Prisma.TransactionClient
  return { tx, writes, calls, signalRows }
}

test('signal persistence fails closed before any transaction client call when DB gate is disabled', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  delete process.env.PHASE5_DATABASE_ENABLED
  const mock = makeTransaction()
  await assert.rejects(
    persistReviewedHomeworkSignal(mock.tx, {
      submissionId: 'submission-1',
      homeworkId: 'homework-1',
      studentId: 'student-1',
      reviewedAt: new Date('2026-01-01T00:00:00.000Z'),
      score: 40,
    }),
    /DATABASE_UNAVAILABLE/,
  )
  await assert.rejects(
    persistStudentGoalSignals(mock.tx, {
      studentId: 'student-1', studentProfileId: 'profile-1', goals: { overallGoal: 'Speak clearly' },
      occurredAt: new Date('2026-01-01T00:00:00.000Z'),
    }),
    /DATABASE_UNAVAILABLE/,
  )
  await assert.rejects(persistAttendanceSignal(mock.tx, {
    attendanceId: 'attendance-1', studentId: 'student-1', sessionId: 'session-1',
    status: 'ABSENT', occurredAt: new Date('2026-01-01T00:00:00.000Z'),
  }), /DATABASE_UNAVAILABLE/)
  await assert.rejects(persistSavedStudentGoals(mock.tx, 'student-1'), /DATABASE_UNAVAILABLE/)
  assert.deepEqual(mock.calls, { profile: 0, skill: 0, feedback: 0, room: 0, signalFind: 0, signalUpdate: 0, studentProfile: 0 })
  if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
  else process.env.PHASE5_DATABASE_ENABLED = original
})

test('feedback pipeline persists only published student-visible signals idempotently', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  process.env.PHASE5_DATABASE_ENABLED = 'true'
  try {
    const mock = makeTransaction({
      feedback: {
        id: 'feedback-1', studentId: 'student-1', status: 'PUBLISHED',
        teacherNotes: 'secret teacher-only context',
        expressions: [{ expression: 'on balance', category: 'IDIOM' }],
        mistakes: [{ original: 'I has', correction: 'I have', explanation: 'Use have.' }],
        pronunciation: [],
        ebi: [],
      },
    })
    assert.equal(await persistPublishedFeedbackSignals(mock.tx, 'feedback-1', new Date('2026-01-01T00:00:00.000Z')), 2)
    assert.equal(mock.writes.length, 2)
    assert.ok(mock.writes.every((write) => JSON.stringify(write).includes('"update":{}')))
    assert.ok(mock.writes.every((write) => !JSON.stringify(write).includes('secret teacher-only context')))
    assert.equal((mock.writes[0].where as { studentId_dedupeKey: { studentId: string } }).studentId_dedupeKey.studentId, 'student-1')
  } finally {
    if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
    else process.env.PHASE5_DATABASE_ENABLED = original
  }
})

test('unscored homework review produces no signal while scored reviews persist actual score', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  process.env.PHASE5_DATABASE_ENABLED = 'true'
  try {
    const mock = makeTransaction()
    assert.equal(await persistReviewedHomeworkSignal(mock.tx, {
      submissionId: 'submission-unscored', homeworkId: 'homework-1', studentId: 'student-1',
      reviewedAt: new Date('2026-01-01T00:00:00.000Z'), score: null,
    }), 0)
    assert.equal(mock.writes.length, 0)
    assert.equal(await persistReviewedHomeworkSignal(mock.tx, {
      submissionId: 'submission-scored', homeworkId: 'homework-1', studentId: 'student-1',
      reviewedAt: new Date('2026-01-01T00:00:00.000Z'), score: 45,
    }), 1)
    assert.equal(mock.writes.length, 1)
    const create = mock.writes[0].create as { evidenceJson: string }
    assert.equal(JSON.parse(create.evidenceJson).score, 45)
  } finally {
    if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
    else process.env.PHASE5_DATABASE_ENABLED = original
  }
})

test('speaking pipeline uses server-owned room topic and message identity', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  process.env.PHASE5_DATABASE_ENABLED = 'true'
  try {
    const mock = makeTransaction({ roomTopic: 'Travel conversations' })
    await persistSpeakingActivitySignal(mock.tx, {
      studentId: 'student-1', roomId: 'room-1', messageId: 'message-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    const create = mock.writes[0].create as { topicKey: string; sourceEntityId: string; source: string }
    assert.equal(create.topicKey, 'travel conversations')
    assert.equal(create.sourceEntityId, 'message-1')
    assert.equal(create.source, 'SPEAKING')
  } finally {
    if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
    else process.env.PHASE5_DATABASE_ENABLED = original
  }
})

test('student goal signals use saved values, avoid active duplicates, and preserve superseded history', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  process.env.PHASE5_DATABASE_ENABLED = 'true'
  try {
    const mock = makeTransaction()
    const firstAt = new Date('2026-02-01T00:00:00.000Z')
    const goals = { overallGoal: 'Speak fluently', monthlyGoal: 'Travel vocabulary', weeklyFocus: null }
    assert.equal(await persistStudentGoalSignals(mock.tx, {
      studentId: 'student-1', studentProfileId: 'profile-1', goals, occurredAt: firstAt,
    }), 2)
    assert.equal(mock.writes.length, 2)
    assert.ok(mock.writes.every((write) => (write.create as Record<string, unknown>).source === 'GOAL'))

    assert.equal(await persistStudentGoalSignals(mock.tx, {
      studentId: 'student-1', studentProfileId: 'profile-1', goals: { ...goals, overallGoal: '  SPEAK   FLUENTLY ' },
      occurredAt: new Date('2026-02-02T00:00:00.000Z'),
    }), 0)
    assert.equal(mock.writes.length, 2)

    const changedAt = new Date('2026-02-03T00:00:00.000Z')
    assert.equal(await persistStudentGoalSignals(mock.tx, {
      studentId: 'student-1', studentProfileId: 'profile-1',
      goals: { ...goals, overallGoal: 'Speak with confidence' }, occurredAt: changedAt,
    }), 1)
    const overallHistory = mock.signalRows.filter((signal) => signal.sourceItemKey === 'overallGoal')
    assert.equal(overallHistory.length, 2)
    assert.equal(overallHistory[0].expiresAt?.toISOString(), changedAt.toISOString())
    assert.equal(overallHistory[1].expiresAt, null)
    assert.notEqual(overallHistory[0].dedupeKey, overallHistory[1].dedupeKey)

    const clearedAt = new Date('2026-02-04T00:00:00.000Z')
    assert.equal(await persistStudentGoalSignals(mock.tx, {
      studentId: 'student-1', studentProfileId: 'profile-1',
      goals: { overallGoal: null, monthlyGoal: 'Travel vocabulary', weeklyFocus: null }, occurredAt: clearedAt,
    }), 0)
    assert.equal(mock.signalRows.filter((signal) => signal.sourceItemKey === 'overallGoal' && !signal.expiresAt).length, 0)
  } finally {
    if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
    else process.env.PHASE5_DATABASE_ENABLED = original
  }
})

test('saved goal pipeline reads persisted profile fields instead of inferring goals', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  process.env.PHASE5_DATABASE_ENABLED = 'true'
  try {
    const occurredAt = new Date('2026-03-01T00:00:00.000Z')
    const mock = makeTransaction({
      savedStudentProfile: { id: 'profile-1', goal: 'Speak clearly', updatedAt: occurredAt },
      savedLearningProfile: {
        goalsJson: JSON.stringify({ overallGoal: 'Speak clearly', monthlyGoal: 'Read daily', weeklyFocus: null }),
        updatedAt: occurredAt,
      },
    })
    assert.equal(await persistSavedStudentGoals(mock.tx, 'student-1'), 2)
    assert.deepEqual(
      mock.writes.map((write) => (write.create as Record<string, unknown>).topicKey as string).sort(),
      ['read daily', 'speak clearly'],
    )
    assert.ok(mock.writes.every((write) => (write.create as Record<string, unknown>).studentId === 'student-1'))
  } finally {
    if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
    else process.env.PHASE5_DATABASE_ENABLED = original
  }
})

test('only persisted ABSENT attendance creates signals; corrections supersede and later absence starts a new revision', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  process.env.PHASE5_DATABASE_ENABLED = 'true'
  try {
    const mock = makeTransaction()
    const firstAt = new Date('2026-04-01T00:00:00.000Z')
    const absent = {
      attendanceId: 'attendance-1', studentId: 'student-1', sessionId: 'session-1',
      status: 'ABSENT', occurredAt: firstAt,
    }
    assert.equal(await persistAttendanceSignal(mock.tx, absent), 1)
    assert.equal(await persistAttendanceSignal(mock.tx, { ...absent, occurredAt: new Date('2026-04-02T00:00:00.000Z') }), 0)
    assert.equal(mock.writes.length, 1)

    const correctedAt = new Date('2026-04-03T00:00:00.000Z')
    assert.equal(await persistAttendanceSignal(mock.tx, { ...absent, status: 'PRESENT', occurredAt: correctedAt }), 0)
    assert.equal(mock.signalRows[0].expiresAt?.toISOString(), correctedAt.toISOString())

    assert.equal(await persistAttendanceSignal(mock.tx, { ...absent, occurredAt: new Date('2026-04-04T00:00:00.000Z') }), 1)
    assert.equal(mock.signalRows.length, 2)
    assert.notEqual(mock.signalRows[0].dedupeKey, mock.signalRows[1].dedupeKey)
    assert.ok(mock.signalRows.every((signal) => JSON.parse(String(signal.evidenceJson)).status === 'ABSENT'))

    assert.equal(await persistAttendanceSignal(mock.tx, {
      attendanceId: 'attendance-2', studentId: 'student-1', sessionId: 'session-2',
      status: 'LATE', occurredAt: new Date('2026-04-05T00:00:00.000Z'),
    }), 0)
    assert.equal(mock.signalRows.length, 2)
  } finally {
    if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
    else process.env.PHASE5_DATABASE_ENABLED = original
  }
})

test('all five Phase 9 sources are wired through their persisted transaction paths', () => {
  const hooks = [
    ['app/api/teacher/feedback/[id]/transition/route.ts', 'persistPublishedFeedbackSignals'],
    ['app/api/admin/feedback/[id]/transition/route.ts', 'persistPublishedFeedbackSignals'],
    ['app/api/teacher/homework/submissions/[id]/review/route.ts', 'persistReviewedHomeworkSignal'],
    ['app/api/student/speaking/rooms/[id]/messages/route.ts', 'persistSpeakingActivitySignal'],
    ['app/api/student/goals/route.ts', 'persistSavedStudentGoals'],
    ['app/api/student/profile/route.ts', 'persistSavedStudentGoals'],
    ['app/api/admin/people/students/[id]/route.ts', 'persistSavedStudentGoals'],
    ['app/api/auth/register/route.ts', 'persistSavedStudentGoals'],
    ['app/api/teacher/classes/sessions/[id]/attendance/route.ts', 'persistAttendanceSignal'],
    ['app/api/admin/classes/sessions/[id]/attendance/route.ts', 'persistAttendanceSignal'],
  ] as const

  for (const [relativePath, helper] of hooks) {
    const source = readFileSync(join(process.cwd(), relativePath), 'utf8')
    assert.match(source, /prisma\.\$transaction\(/, `${relativePath} should commit the source mutation transactionally`)
    assert.ok(source.includes(`${helper}(tx`), `${relativePath} should call ${helper} inside the transaction`)
  }
})

test('teacher intelligence does not display superseded goal or attendance signals as active evidence', () => {
  const source = readFileSync(join(process.cwd(), 'lib/phase9/staff-service.ts'), 'utf8')
  assert.ok(source.includes('where: { studentId, OR: [{ expiresAt: null }, { expiresAt: { gt: checkedAt } }] }'))
})