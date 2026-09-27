import assert from 'node:assert/strict'
import test from 'node:test'
import { buildStrictStudentDailyPlan } from '@/lib/phase9/student-service'
import {
  buildDailyLearningPlan,
  calculateEvidenceMastery,
  calculateRecommendationPriority,
  canTransitionDailySession,
  canTransitionDailyStep,
  canTransitionRecommendation,
  dailyPlanSnapshotIsImmutable,
  generateDeterministicRecommendations,
  normalizePublishedFeedbackSignals,
  normalizeReviewedHomeworkSignal,
  normalizeSpeakingActivitySignal,
  phase9DatabaseGuard,
  recommendationDedupeKey,
  recommendationEvidenceCycleKey,
  recommendationIsExpired,
  selectPublishedResource,
  type NormalizedLearningSignal,
} from '@/lib/phase9/engine'

const now = new Date('2025-03-10T12:00:00.000Z')

function signal(overrides: Partial<NormalizedLearningSignal> = {}): NormalizedLearningSignal {
  return {
    studentId: 'student-1',
    type: 'MISTAKE',
    source: 'FEEDBACK',
    sourceEntityType: 'SessionFeedback',
    sourceEntityId: 'feedback-1',
    sourceItemKey: 'mistake:0',
    dedupeKey: 'feedback:feedback-1:mistake:0',
    skillCode: 'GRAMMAR',
    levelId: null,
    stageId: null,
    topicKey: 'past perfect',
    strength: 1,
    occurredAt: now,
    expiresAt: null,
    evidence: { original: 'I have went', correction: 'I have gone' },
    ...overrides,
  }
}

test('published feedback normalizes student-facing mistakes, pronunciation, EBI and vocabulary only', () => {
  const normalized = normalizePublishedFeedbackSignals({
    id: 'feedback-1',
    studentId: 'student-1',
    status: 'PUBLISHED',
    publishedAt: now,
    teacherNotes: 'Private note: do not expose this',
    summary: 'Student-facing summary',
    expressions: [{ expression: 'on the other hand', category: 'IDIOM' }],
    mistakes: [
      { original: 'I have went', correction: 'I have gone', explanation: 'Use the past participle.' },
      { original: 'I have went', correction: 'I have gone', explanation: 'Use the past participle.' },
    ],
    pronunciation: [{ target: '/th/', guidance: 'Place the tongue gently between the teeth.' }],
    ebi: [{ betterExpression: 'Could you help me?', explanation: 'A more natural request.', priority: 'HIGH' }],
  })
  assert.equal(normalized.length, 5)
  assert.equal(normalized.filter((item) => item.type === 'MISTAKE')[0].strength, 2)
  assert.equal(normalized.some((item) => JSON.stringify(item).includes('Private note')), false)
  assert.equal(normalized.some((item) => item.type === 'VOCABULARY_NEED'), true)
  assert.throws(() => normalizePublishedFeedbackSignals({
    id: 'draft', studentId: 'student-1', status: 'DRAFT', publishedAt: now,
  }))
})

test('reviewed homework creates evidence-based weak/strong signals and ignores unscored reviews', () => {
  const weak = normalizeReviewedHomeworkSignal({
    submissionId: 'submission-1', homeworkId: 'homework-1', studentId: 'student-1',
    status: 'REVIEWED', reviewedAt: now, score: 48, skillCode: 'WRITING',
  })
  const strong = normalizeReviewedHomeworkSignal({
    submissionId: 'submission-2', homeworkId: 'homework-1', studentId: 'student-1',
    status: 'REVIEWED', reviewedAt: now, score: 90, skillCode: 'WRITING',
  })
  const unscored = normalizeReviewedHomeworkSignal({
    submissionId: 'submission-3', homeworkId: 'homework-1', studentId: 'student-1',
    status: 'REVIEWED', reviewedAt: now, score: null,
  })
  assert.equal(weak?.type, 'HOMEWORK_WEAK')
  assert.equal(strong?.type, 'HOMEWORK_STRONG')
  assert.equal(unscored, null)
  assert.equal(weak?.evidence?.score, 48)
})

test('speaking normalization records activity or self-reported difficulty, never speech quality', () => {
  const active = normalizeSpeakingActivitySignal({
    studentId: 'student-1', roomId: 'room-1', messageId: 'message-1', createdAt: now, topicKey: 'travel',
  })
  const difficulty = normalizeSpeakingActivitySignal({
    studentId: 'student-1', roomId: 'room-1', messageId: 'message-2', createdAt: now,
    topicKey: 'job interviews', difficultyReported: true,
  })
  assert.equal(active.type, 'SPEAKING_ACTIVITY')
  assert.equal(difficulty.type, 'SPEAKING_TOPIC_DIFFICULTY')
  assert.equal(JSON.stringify(active).includes('qualityScore'), false)
})

test('priority deterministically combines evidence, recurrence, recency and goals', () => {
  const single = calculateRecommendationPriority({ signals: [signal()], now })
  const repeated = calculateRecommendationPriority({
    signals: [signal(), signal({ dedupeKey: 'second', occurredAt: new Date('2025-03-08T12:00:00.000Z') })],
    now, goalTopicKeys: ['past perfect'], upcomingClassRelevant: true,
  })
  const stale = calculateRecommendationPriority({
    signals: [signal({ occurredAt: new Date('2025-01-01T00:00:00.000Z') })], now,
  })
  assert.ok(repeated! > single!)
  assert.ok(single! > stale!)
  assert.equal(calculateRecommendationPriority({ signals: [], now }), null)
})

test('recommendations require evidence, apply deterministic types and deduplicate equivalent unresolved needs', () => {
  const repeatedMistakes = [
    signal(),
    signal({ sourceEntityId: 'feedback-2', dedupeKey: 'feedback:feedback-2:mistake:0', occurredAt: new Date('2025-03-09T12:00:00.000Z') }),
  ]
  const result = generateDeterministicRecommendations({
    studentId: 'student-1', signals: repeatedMistakes, goals: ['past perfect'],
    now, expiresAt: new Date('2025-04-01T00:00:00.000Z'),
  })
  assert.equal(result.length, 1)
  assert.equal(result[0].type, 'REVIEW')
  assert.match(result[0].reason, /in 2 entries/)
  assert.equal(result[0].priority > 0, true)
  assert.equal(result[0].status, 'PENDING')
  assert.deepEqual(result[0].sourceSignalKeys, repeatedMistakes.map((item) => item.dedupeKey))
  assert.equal(generateDeterministicRecommendations({ studentId: 'student-1', signals: [], now }).length, 0)
  assert.equal(generateDeterministicRecommendations({
    studentId: 'student-1', signals: repeatedMistakes, now, activeDedupeKeys: [result[0].dedupeKey],
  }).length, 0)
  assert.equal(recommendationDedupeKey('student-1', 'REVIEW', 'Past Perfect', 'MISTAKE:GRAMMAR'), result[0].dedupeKey)
})

test('single mistake gives a truthful practice reason, while unsupported mistakes are skipped', () => {
  const onlyMistake = signal({
    dedupeKey: 'feedback:single:mistake:0',
    sourceEntityId: 'single',
    evidence: { original: 'I have went', correction: 'I have gone' },
  })
  const [recommendation] = generateDeterministicRecommendations({
    studentId: 'student-1', signals: [onlyMistake], now,
  })
  assert.equal(recommendation.type, 'PRACTICE')
  assert.match(recommendation.reason, /“I have went” to “I have gone”/)
  const [withoutExplanation] = generateDeterministicRecommendations({
    studentId: 'student-1', signals: [signal({ evidence: undefined })], now,
  })
  assert.equal(withoutExplanation, undefined)
})

test('closed recommendation history permits a new evidence cycle but active needs remain deduplicated', () => {
  const firstEvidence = signal({ dedupeKey: 'signal-old', occurredAt: new Date('2025-03-01T00:00:00Z') })
  const first = generateDeterministicRecommendations({
    studentId: 'student-1', signals: [firstEvidence], now,
  })[0]
  assert.ok(first)
  const oldHistory = {
    dedupeKey: first.dedupeKey,
    evidenceCycleKey: first.evidenceCycleKey,
    dedupeCycle: first.dedupeCycle,
    status: 'COMPLETED',
  }
  assert.equal(generateDeterministicRecommendations({
    studentId: 'student-1', signals: [firstEvidence], now, existingRecommendations: [oldHistory],
  }).length, 0)
  const newEvidence = signal({ dedupeKey: 'signal-new', occurredAt: new Date('2025-03-09T00:00:00Z') })
  const reopened = generateDeterministicRecommendations({
    studentId: 'student-1', signals: [firstEvidence, newEvidence], now, existingRecommendations: [oldHistory],
  })[0]
  assert.equal(reopened.dedupeKey, first.dedupeKey)
  assert.equal(reopened.dedupeCycle, first.dedupeCycle + 1)
  assert.equal(reopened.evidenceCycleKey, recommendationEvidenceCycleKey([firstEvidence, newEvidence]))
  assert.notEqual(reopened.evidenceCycleKey, first.evidenceCycleKey)
  assert.equal(generateDeterministicRecommendations({
    studentId: 'student-1', signals: [firstEvidence, newEvidence], now,
    existingRecommendations: [{ ...oldHistory, status: 'ACCEPTED' }],
  }).length, 0)
})

test('recommendation lifecycle and expiry preserve completed history', () => {
  assert.equal(canTransitionRecommendation('PENDING', 'ACCEPTED'), true)
  assert.equal(canTransitionRecommendation('ACCEPTED', 'COMPLETED'), true)
  assert.equal(canTransitionRecommendation('COMPLETED', 'PENDING'), false)
  assert.equal(recommendationIsExpired({ status: 'PENDING', expiresAt: new Date('2025-03-09T00:00:00Z') }, now), true)
  assert.equal(recommendationIsExpired({ status: 'COMPLETED', expiresAt: new Date('2025-03-09T00:00:00Z') }, now), false)
})

test('mastery uses only at least three completed scored evidence items', () => {
  assert.equal(calculateEvidenceMastery([{ completed: true, score: 95 }, { completed: true, score: 90 }]), null)
  assert.deepEqual(calculateEvidenceMastery([
    { completed: true, score: 80 }, { completed: true, score: 90 },
    { completed: true, score: 100 }, { completed: false, score: 100 },
  ]), { score: 90, evidenceCount: 3, source: 'COMPLETED_SCORED_EVIDENCE' })
})

test('resource selector only returns existing published active matching resources', () => {
  const resources = [
    { id: 'draft', title: 'Draft', resourceType: 'LESSON', isPublished: false as const, levelId: 'b1', skillCode: 'SPEAKING' },
    { id: 'inactive', title: 'Inactive', resourceType: 'LESSON', isPublished: true as const, isActive: false, skillCode: 'SPEAKING' },
    { id: 'wrong-level', title: 'Wrong', resourceType: 'LESSON', isPublished: true as const, levelId: 'a1', skillCode: 'SPEAKING' },
    { id: 'missing-skill', title: 'Unmapped', resourceType: 'LESSON', isPublished: true as const, levelId: 'b1' },
    { id: 'wrong-skill', title: 'Grammar', resourceType: 'LESSON', isPublished: true as const, levelId: 'b1', skillCode: 'GRAMMAR' },
    { id: 'wrong-stage', title: 'Other stage', resourceType: 'LESSON', isPublished: true as const, levelId: 'b1', stageId: 's2', skillCode: 'SPEAKING' },
    { id: 'good', title: 'Speaking', resourceType: 'LESSON', isPublished: true as const, levelId: 'b1', stageId: 's1', skillCode: 'SPEAKING', order: 1 },
  ]
  assert.equal(selectPublishedResource({ resources, skillCode: 'SPEAKING', levelId: 'b1', stageId: 's1' })?.id, 'good')
  assert.equal(selectPublishedResource({ resources, skillCode: 'LISTENING', levelId: 'b1', stageId: 's1' }), null)
})

test('daily plan uses real resources and remains within a 10–25 minute bounded session', () => {
  const recommendation = {
    id: 'recommendation-1', studentId: 'student-1', type: 'PRACTICE' as const, needKey: 'past perfect',
    title: 'Practice past perfect', reason: 'Two reviewed items need practice.', skillCode: 'GRAMMAR',
    levelId: 'b1', stageId: 's1', signals: [signal()], goals: [], now,
    expiresAt: null, dedupeKey: 'dedupe-1', priority: 7, status: 'PENDING' as const,
    evidenceCycleKey: 'signal-cycle-1', dedupeCycle: 1,
    sourceSignalKeys: ['signal-1'],
  }
  const resources = [
    { id: 'resource-1', title: 'Past perfect lesson', resourceType: 'LESSON', isPublished: true as const, levelId: 'b1', stageId: 's1', skillCode: 'GRAMMAR' },
  ]
  const plan = buildDailyLearningPlan({ dailyKey: '2025-03-10', recommendations: [recommendation], resources, levelId: 'b1', stageId: 's1' })
  assert.equal(plan.status, 'READY')
  assert.ok(plan.totalMinutes >= 10 && plan.totalMinutes <= 25)
  assert.equal(plan.steps[0].resourceId, 'resource-1')
  assert.equal(buildDailyLearningPlan({ dailyKey: '2025-03-10', recommendations: [], resources }).status, 'NO_RECOMMENDATIONS')
  assert.equal(buildDailyLearningPlan({ dailyKey: '2025-03-10', recommendations: [recommendation], resources: [] }).status, 'NO_SUITABLE_RESOURCE')
  const incompatibleOnly = [{
    id: 'unmapped', title: 'Unmapped', resourceType: 'LESSON',
    isPublished: true, levelId: 'b1', stageId: 's1',
  }]
  assert.equal(buildDailyLearningPlan({
    dailyKey: '2025-03-10', recommendations: [recommendation], resources: incompatibleOnly,
    levelId: 'b1', stageId: 's1',
  }).status, 'NO_SUITABLE_RESOURCE')
  assert.equal(buildDailyLearningPlan({
    dailyKey: '2025-03-10',
    recommendations: [recommendation],
    resources: [{ ...resources[0], id: 'wrong-target', levelId: 'a1', stageId: 's2' }],
    levelId: 'b1',
    stageId: 's1',
  }).status, 'NO_SUITABLE_RESOURCE')
})

test('student daily-plan adapter never falls back to another or wrong-skill resource', () => {
  const recommendation = {
    id: 'rec-speaking',
    studentId: 'student-1',
    type: 'PRACTICE' as const,
    title: 'Practice speaking',
    reason: 'Published feedback noted a speaking difficulty.',
    skillCode: 'SPEAKING',
    levelId: 'b1',
    stageId: 's1',
  }
  const wrongSkillResource = {
    id: 'resource-grammar',
    title: 'Grammar lesson',
    resourceType: 'LESSON',
    isPublished: true,
    levelId: 'b1',
    stageId: 's1',
    skillCode: 'GRAMMAR',
    order: 0,
  }
  const wrongSkillPlan = buildStrictStudentDailyPlan({
    dailyKey: '2025-03-10',
    recommendations: [{ ...recommendation, resource: wrongSkillResource }],
    levelId: 'b1',
    stageId: 's1',
  })
  assert.equal(wrongSkillPlan.status, 'NO_SUITABLE_RESOURCE')

  const noSkillRecommendation = { ...recommendation, id: 'rec-general', skillCode: null }
  const noWrongSkillFallback = buildStrictStudentDailyPlan({
    dailyKey: '2025-03-10',
    recommendations: [
      { ...recommendation, resource: null },
      { ...noSkillRecommendation, resource: wrongSkillResource },
    ],
    levelId: 'b1',
    stageId: 's1',
  })
  assert.equal(noWrongSkillFallback.status, 'NO_SUITABLE_RESOURCE')

  const goodResource = { ...wrongSkillResource, id: 'resource-speaking', skillCode: 'SPEAKING' }
  const ready = buildStrictStudentDailyPlan({
    dailyKey: '2025-03-10',
    recommendations: [{ ...recommendation, resource: goodResource }],
    levelId: 'b1',
    stageId: 's1',
  })
  assert.equal(ready.status, 'READY')
  assert.equal(ready.steps[0].resourceId, 'resource-speaking')
})

test('daily session and step lifecycle reject tampering and snapshots remain immutable', () => {
  assert.equal(canTransitionDailySession('NOT_STARTED', 'IN_PROGRESS'), true)
  assert.equal(canTransitionDailySession('COMPLETED', 'IN_PROGRESS'), false)
  assert.equal(canTransitionDailySession('PAUSED', 'COMPLETED'), true)
  assert.equal(canTransitionDailyStep('PENDING', 'IN_PROGRESS'), true)
  assert.equal(canTransitionDailyStep('COMPLETED', 'PENDING'), false)
  const snapshot = JSON.stringify({ steps: [{ title: 'Read', durationMinutes: 10 }] })
  assert.equal(dailyPlanSnapshotIsImmutable(snapshot, snapshot), true)
  assert.equal(dailyPlanSnapshotIsImmutable(snapshot, JSON.stringify({ steps: [] })), false)
})

test('database guard returns DATABASE_UNAVAILABLE before any database work', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  delete process.env.PHASE5_DATABASE_ENABLED
  const response = phase9DatabaseGuard()
  assert.equal(response?.status, 503)
  assert.equal((await response!.json()).error.code, 'DATABASE_UNAVAILABLE')
  if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
  else process.env.PHASE5_DATABASE_ENABLED = original
})

test.skip('MongoDB integration: persisted signals, recommendations, and immutable daily learning sessions', () => {
  // Blocked explicitly: MongoDB remains unavailable; no persistence assertion is claimed.
})