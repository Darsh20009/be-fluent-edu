import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PLACEMENT_BANDS,
  bandAt,
  bandRank,
  determinePlacementBand,
  nextAdaptiveBand,
  targetQuestionsForBand,
} from '../lib/placement-bands'

test('the saved placement bank is balanced to exactly 1,000 questions across 24 bands', () => {
  assert.equal(PLACEMENT_BANDS.length, 24)
  assert.equal(PLACEMENT_BANDS[0], 'A1.1')
  assert.equal(PLACEMENT_BANDS.at(-1), 'C2.4')
  assert.equal(PLACEMENT_BANDS.reduce((total, _, index) => total + targetQuestionsForBand(index), 0), 1000)
  assert.equal(targetQuestionsForBand(0), 42)
  assert.equal(targetQuestionsForBand(16), 41)
})

test('adaptive difficulty moves up after correct answers and down after incorrect answers', () => {
  assert.equal(nextAdaptiveBand('A2.2', true), 'A2.4')
  assert.equal(nextAdaptiveBand('A2.2', false), 'A2.1')
  assert.equal(nextAdaptiveBand('C2.4', true), 'C2.4')
  assert.equal(nextAdaptiveBand('A1.1', false), 'A1.1')
})

test('placement result is bounded to supported bands and uses high-level evidence', () => {
  const highLevelAnswers = [
    'B2.1', 'B2.2', 'B2.4', 'C1.1', 'C1.2', 'C1.4', 'C2.1', 'C2.2',
  ].map((band) => ({ band, correct: true }))
  assert.equal(determinePlacementBand(highLevelAnswers), 'C2.2')
  assert.equal(determinePlacementBand([{ band: 'A1.1', correct: false }]), 'A1.1')
  assert.equal(bandRank(bandAt(999)), 23)
})