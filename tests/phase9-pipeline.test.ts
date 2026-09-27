import assert from 'node:assert/strict'
import test from 'node:test'
import type { Prisma } from '@prisma/client'
import {
  persistPublishedFeedbackSignals,
  persistReviewedHomeworkSignal,
  persistSpeakingActivitySignal,
} from '@/lib/phase9/pipeline'

function makeTransaction(options: {
  feedback?: Record<string, unknown>
  roomTopic?: string
  existingSkillId?: string | null
} = {}) {
  const writes: Array<Record<string, unknown>> = []
  const calls = { profile: 0, skill: 0, feedback: 0, room: 0 }
  const tx = {
    studentLearningProfile: {
      findUnique: async () => {
        calls.profile += 1
        return { officialLevelId: 'level-official', officialStageId: 'stage-official' }
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
      upsert: async (args: Record<string, unknown>) => {
        writes.push(args)
        return { id: `signal-${writes.length}` }
      },
    },
  } as unknown as Prisma.TransactionClient
  return { tx, writes, calls }
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
  assert.deepEqual(mock.calls, { profile: 0, skill: 0, feedback: 0, room: 0 })
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