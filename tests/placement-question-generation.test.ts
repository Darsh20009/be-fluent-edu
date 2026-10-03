import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parsePlacementQuestionDrafts,
  placementQuestionGenerationRequestSchema,
  placementQuestionLevel,
} from '../lib/placement-question-generation'

const question = {
  question: 'Choose the correct form: She ___ to school every day.',
  questionAr: 'اختر الصيغة الصحيحة: هي ___ إلى المدرسة كل يوم.',
  options: ['go', 'goes', 'going', 'gone'],
  correctAnswer: 'goes',
  explanation: 'Use the third-person singular form with she in the present simple.',
  category: 'Grammar',
}

test('question generation request is bounded to valid bands and small batches', () => {
  assert.equal(placementQuestionGenerationRequestSchema.safeParse({ band: 'A1.1', count: 3, topic: 'present simple' }).success, true)
  assert.equal(placementQuestionGenerationRequestSchema.safeParse({ band: 'A9.1', count: 3 }).success, false)
  assert.equal(placementQuestionGenerationRequestSchema.safeParse({ band: 'A1.1', count: 6 }).success, false)
  assert.equal(placementQuestionGenerationRequestSchema.safeParse({ band: 'A1.1', count: 2, unexpected: true }).success, false)
})

test('generated questions require the requested count and one listed correct answer', () => {
  const content = JSON.stringify({ questions: [question] })
  assert.deepEqual(parsePlacementQuestionDrafts(content, 1), [question])
  assert.throws(() => parsePlacementQuestionDrafts(content, 2), /INVALID_RESPONSE/)
  assert.throws(() => parsePlacementQuestionDrafts(JSON.stringify({
    questions: [{ ...question, correctAnswer: 'walks' }],
  }), 1), /INVALID_RESPONSE/)
})

test('generated questions reject duplicate distractors, duplicate questions, and malformed JSON', () => {
  assert.throws(() => parsePlacementQuestionDrafts(JSON.stringify({
    questions: [{ ...question, options: ['go', 'go', 'going', 'gone'] }],
  }), 1), /INVALID_RESPONSE/)
  assert.throws(() => parsePlacementQuestionDrafts(JSON.stringify({
    questions: [question, { ...question }],
  }), 2), /INVALID_RESPONSE/)
  assert.throws(() => parsePlacementQuestionDrafts('{broken', 1), /INVALID_RESPONSE/)
})

test('placement question level is derived from its validated band', () => {
  assert.equal(placementQuestionLevel('B2.3'), 'B2')
  assert.equal(placementQuestionLevel('X1'), null)
})