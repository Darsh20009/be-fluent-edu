import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAnonymizedLearnerContext,
  generateAiProposals,
  generateScopedProposals,
  ProposalGenerationError,
  type ProposalProvider,
  type ProposalSignal,
} from '@/lib/phase9/ai-proposals'
import {
  aiRecommendationData,
  loadScopedAiProposalDrafts,
  reviewAbortKind,
  reviewGeneratedSuggestionInTransaction,
  type AiSuggestionReviewRepository,
} from '@/lib/phase9/proposal-review'
import { ThanarahError } from '@/lib/thanarah'

const feedbackSignal: ProposalSignal = {
  studentId: 'student-a',
  source: 'FEEDBACK',
  type: 'MISTAKE',
  topicKey: 'past tense',
  skillCode: 'GRAMMAR',
  strength: 3,
  occurredAt: new Date('2025-03-01T00:00:00Z'),
  evidenceJson: JSON.stringify({
    original: 'I go yesterday',
    correction: 'I went yesterday',
    teacherNotes: 'private instructor note',
    private: 'do not send',
  }),
}

function context() {
  return buildAnonymizedLearnerContext({
    requestedStudentId: 'student-a',
    level: 'B1',
    stage: 'B1.2',
    goals: { weeklyFocus: 'Use past tense accurately', ignored: { private: true } },
    signals: [feedbackSignal],
    resources: [{
      id: 'resource-b1-grammar',
      title: 'Past tense practice',
      resourceType: 'PRACTICE',
      levelId: 'level-b1',
      stageId: 'stage-b1-2',
      skillCode: 'GRAMMAR',
    }],
  })
}

test('provider-backed proposals parse valid JSON and bind level/resource to supplied context', async () => {
  let messages: unknown
  const provider: ProposalProvider = async (input) => {
    messages = input
    return JSON.stringify({
      proposals: [{
        type: 'PRACTICE',
        title: 'Practice past tense',
        reason: 'Published feedback identified a past-tense correction.',
        skillCode: 'GRAMMAR',
        resourceId: 'resource-b1-grammar',
      }],
    })
  }
  const result = await generateAiProposals(context(), provider)
  assert.deepEqual(result, [{
    type: 'PRACTICE',
    title: 'Practice past tense',
    reason: 'Published feedback identified a past-tense correction.',
    skillCode: 'GRAMMAR',
    resourceId: 'resource-b1-grammar',
    level: 'B1',
    stage: 'B1.2',
  }])
  assert.equal(Array.isArray(messages), true)
})

test('malformed and out-of-scope provider JSON is rejected, never repaired', async () => {
  await assert.rejects(
    generateAiProposals(context(), async () => '{"proposals":['),
    (error: unknown) => error instanceof ProposalGenerationError && error.code === 'INVALID_PROVIDER_OUTPUT',
  )
  await assert.rejects(
    generateAiProposals(context(), async () => JSON.stringify({
      proposals: [{ type: 'PRACTICE', title: 'x', reason: 'y', skillCode: 'GRAMMAR', resourceId: 'invented-resource' }],
    })),
    (error: unknown) => error instanceof ProposalGenerationError && error.code === 'INVALID_PROVIDER_OUTPUT',
  )
  await assert.rejects(
    generateAiProposals(context(), async () => JSON.stringify({
      proposals: [{ type: 'PRACTICE', title: 'x', reason: 'y', skillCode: 'GRAMMAR', resourceId: null, extra: 'unexpected' }],
    })),
    (error: unknown) => error instanceof ProposalGenerationError && error.code === 'INVALID_PROVIDER_OUTPUT',
  )
})

test('missing Thanarah key reports unavailable without deterministic or fake fallback', async () => {
  let calls = 0
  await assert.rejects(
    generateAiProposals(context(), async () => {
      calls += 1
      throw new ThanarahError('MISSING_API_KEY')
    }),
    (error: unknown) => error instanceof ProposalGenerationError && error.code === 'PROVIDER_UNAVAILABLE',
  )
  assert.equal(calls, 1)
})

test('learner context excludes private notes, identities, unrelated sources and other learners', () => {
  const foreign = { ...feedbackSignal, studentId: 'student-b', evidenceJson: '{"original":"other learner secret"}' }
  const privateNoteSignal = { ...feedbackSignal, source: 'TEACHER_NOTE', evidenceJson: '{"teacherNotes":"secret"}' }
  const value = JSON.stringify(buildAnonymizedLearnerContext({
    requestedStudentId: 'student-a',
    level: 'B1',
    stage: null,
    goals: ['Learner goal'],
    signals: [feedbackSignal, foreign, privateNoteSignal],
    resources: [],
  }))
  assert.equal(value.includes('teacherNotes'), false)
  assert.equal(value.includes('private instructor note'), false)
  assert.equal(value.includes('other learner secret'), false)
  assert.equal(value.includes('student-a'), false)
  assert.equal(value.includes('student-b'), false)
  assert.equal(value.includes('PUBLISHED_FEEDBACK'), true)
})

test('generation enforces scoped authorization before loading and again before returning', async () => {
  let allowed = false
  let loads = 0
  let providerCalls = 0
  const input = {
    authorize: async () => allowed,
    loadContext: async () => {
      loads += 1
      return context()
    },
    provider: async () => {
      providerCalls += 1
      return JSON.stringify({
        proposals: [{ type: 'PRACTICE', title: 'Practice', reason: 'Reason', skillCode: null, resourceId: null }],
      })
    },
  }
  assert.deepEqual(await generateScopedProposals(input), { kind: 'FORBIDDEN' })
  assert.equal(loads, 0)
  allowed = true
  assert.deepEqual((await generateScopedProposals(input)).kind, 'GENERATED')
  assert.equal(providerCalls, 1)
  assert.equal(loads, 1)
  allowed = true
  let checks = 0
  const revokedDuringGeneration = await generateScopedProposals({
    ...input,
    authorize: async () => {
      checks += 1
      return checks === 1
    },
  })
  assert.deepEqual(revokedDuringGeneration, { kind: 'FORBIDDEN' })
  assert.equal(checks, 2)
})

function reviewRepository(initialStatus = 'PENDING_REVIEW', authorized = true) {
  const state: {
    status: string
    recommendations: Array<{ id: string; data: ReturnType<typeof aiRecommendationData> }>
  } = { status: initialStatus, recommendations: [] }
  let nextId = 0
  const repository: AiSuggestionReviewRepository = {
    isAuthorized: async () => authorized,
    findSuggestion: async () => ({
      id: 'suggestion-1',
      studentId: 'student-a',
      teacherId: 'teacher-a',
      type: 'AI_RECOMMENDATION',
      status: state.status,
      draftJson: JSON.stringify({
        proposal: {
          type: 'PRACTICE',
          title: 'Practice past tense',
          reason: 'Published feedback identified a past-tense correction.',
          skillCode: 'GRAMMAR',
          resourceId: null,
          levelId: 'level-b1',
          stageId: 'stage-b1-2',
        },
        sourceSignalKeys: ['feedback:key-1'],
        evidenceCycleKey: 'thanarah:cycle-1',
      }),
    }),
    findRecommendation: async (dedupeKey) => state.recommendations.find((row) => row.data.dedupeKey === dedupeKey) || null,
    createRecommendation: async (data) => {
      if (state.recommendations.some((row) => row.data.studentId === data.studentId && row.data.dedupeKey === data.dedupeKey && row.data.dedupeCycle === 1)) {
        throw Object.assign(new Error('unique collision'), { code: 'P2002' })
      }
      const created = { id: `recommendation-${++nextId}`, data }
      state.recommendations.push(created)
      return { id: created.id }
    },
    transitionSuggestion: async (from, to) => {
      if (state.status !== from) return 0
      state.status = to
      return 1
    },
    materializationDetails: async (draft) => ({
      levelId: draft.proposal.levelId,
      stageId: draft.proposal.stageId,
      skillId: 'skill-grammar',
      resourceValid: true,
    }),
  }
  return { repository, state }
}

test('approved AI suggestions materialize once with stable durable dedupe and provenance', async () => {
  const { repository, state } = reviewRepository()
  const first = await reviewGeneratedSuggestionInTransaction({
    repository, suggestionId: 'suggestion-1', reviewerId: 'teacher-a', decision: 'APPROVE',
  })
  assert.deepEqual(first, {
    kind: 'APPROVED',
    id: 'suggestion-1',
    status: 'APPROVED',
    materialized: true,
    recommendationId: 'recommendation-1',
  })
  const second = await reviewGeneratedSuggestionInTransaction({
    repository, suggestionId: 'suggestion-1', reviewerId: 'teacher-a', decision: 'APPROVE',
  })
  assert.deepEqual(second, { kind: 'CONFLICT' })
  assert.equal(state.recommendations.length, 1)
  assert.equal(state.recommendations[0].data.status, 'PENDING')
  assert.deepEqual(JSON.parse(state.recommendations[0].data.sourceSignalKeysJson!), ['feedback:key-1'])
  assert.deepEqual(JSON.parse(state.recommendations[0].data.payloadJson!), {
    origin: 'TEACHER_REVIEWED_THANARAH_PROPOSAL',
    suggestionId: 'suggestion-1',
    approvedById: 'teacher-a',
  })
})

test('rejecting an AI suggestion never creates a student recommendation', async () => {
  const { repository, state } = reviewRepository()
  const result = await reviewGeneratedSuggestionInTransaction({
    repository, suggestionId: 'suggestion-1', reviewerId: 'teacher-a', decision: 'REJECT',
  })
  assert.deepEqual(result, { kind: 'REJECTED', id: 'suggestion-1', status: 'REJECTED' })
  assert.equal(state.recommendations.length, 0)
  assert.deepEqual(await reviewGeneratedSuggestionInTransaction({
    repository, suggestionId: 'suggestion-1', reviewerId: 'teacher-a', decision: 'APPROVE',
  }), { kind: 'CONFLICT' })
})

test('review ownership is checked before loading or materializing a suggestion', async () => {
  const { repository, state } = reviewRepository('PENDING_REVIEW', false)
  await assert.rejects(
    reviewGeneratedSuggestionInTransaction({
      repository, suggestionId: 'suggestion-1', reviewerId: 'intruder', decision: 'APPROVE',
    }),
    (error: unknown) => reviewAbortKind(error) === 'FORBIDDEN',
  )
  assert.equal(state.recommendations.length, 0)
  assert.equal(state.status, 'PENDING_REVIEW')
})

test('proposal reload is teacher/student scoped, capped, strictly projected, and assignment rechecked', async () => {
  const draftJson = JSON.stringify({
    proposal: {
      type: 'PRACTICE',
      title: 'Practice past tense',
      reason: 'Published feedback identified a past-tense correction.',
      skillCode: 'GRAMMAR',
      resourceId: null,
      levelId: 'level-b1',
      stageId: 'stage-b1-2',
    },
    sourceSignalKeys: ['private provenance must not be returned'],
    evidenceCycleKey: 'internal evidence cycle',
  })
  let scope: { teacherId: string; studentId: string; limit: 50 } | undefined
  let allowed = true
  const records = [
    {
      id: 'draft-owned',
      teacherId: 'teacher-a',
      studentId: 'student-a',
      type: 'AI_RECOMMENDATION',
      status: 'PENDING_REVIEW',
      draftJson,
      reason: 'ignored database projection',
      createdAt: new Date('2025-03-01T00:00:00Z'),
    },
    {
      id: 'draft-other-teacher',
      teacherId: 'teacher-b',
      studentId: 'student-a',
      type: 'AI_RECOMMENDATION',
      status: 'PENDING_REVIEW',
      draftJson,
      reason: 'not owned',
      createdAt: new Date(),
    },
    {
      id: 'draft-invalid',
      teacherId: 'teacher-a',
      studentId: 'student-a',
      type: 'AI_RECOMMENDATION',
      status: 'PENDING_REVIEW',
      draftJson: '{"private":"do not return"}',
      reason: 'invalid',
      createdAt: new Date(),
    },
  ]
  const result = await loadScopedAiProposalDrafts({
    teacherId: 'teacher-a',
    studentId: 'student-a',
    authorize: async () => allowed,
    loadRecords: async (input) => {
      scope = input
      return records
    },
  })
  assert.deepEqual(scope, { teacherId: 'teacher-a', studentId: 'student-a', limit: 50 })
  assert.equal(result.kind, 'OK')
  if (result.kind === 'OK') {
    assert.equal(result.items.length, 1)
    assert.equal(result.items[0].id, 'draft-owned')
    const serialized = JSON.stringify(result.items)
    assert.equal(serialized.includes('draftJson'), false)
    assert.equal(serialized.includes('sourceSignalKeys'), false)
    assert.equal(serialized.includes('internal evidence cycle'), false)
    assert.equal(serialized.includes('teacher-b'), false)
  }
  let checks = 0
  const revokedDuringReload = await loadScopedAiProposalDrafts({
    teacherId: 'teacher-a',
    studentId: 'student-a',
    authorize: async () => ++checks === 1,
    loadRecords: async () => records,
  })
  assert.deepEqual(revokedDuringReload, { kind: 'FORBIDDEN' })
  assert.equal(checks, 2)
  allowed = false
  let queriedWhenUnassigned = false
  assert.deepEqual(await loadScopedAiProposalDrafts({
    teacherId: 'teacher-a',
    studentId: 'student-a',
    authorize: async () => allowed,
    loadRecords: async () => {
      queriedWhenUnassigned = true
      return records
    },
  }), { kind: 'FORBIDDEN' })
  assert.equal(queriedWhenUnassigned, false)
})