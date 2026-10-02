import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const report = readFileSync(new URL('./FeedbackReport.tsx', import.meta.url), 'utf8')
const studentRoute = readFileSync(new URL('../../app/api/student/feedback/route.ts', import.meta.url), 'utf8')

test('student report renders the public session feedback fields', () => {
  for (const field of [
    'expression', 'meaning', 'example', 'category',
    'original', 'correction', 'explanation',
    'target', 'actual', 'guidance', 'phonetic', 'teacherNote',
    'betterExpression', 'priority', 'skillRatings',
  ]) {
    assert.match(report, new RegExp(`\\b${field}\\b`), `expected report rendering for ${field}`)
  }
  for (const category of ['VOCABULARY', 'IDIOM', 'SLANG', 'CHUNK']) {
    assert.match(report, new RegExp(`\\b${category}\\b`))
  }
  assert.match(report, /dir="auto"/)
  assert.match(report, /window\.print\(\)/)
  assert.match(report, /feedback-report-selected/)
})

test('student route excludes private top-level teacher notes', () => {
  assert.match(studentRoute, /summary:\s*true/)
  assert.match(studentRoute, /expressions:\s*true/)
  assert.doesNotMatch(studentRoute, /teacherNotes:\s*true/)
  assert.doesNotMatch(report, /item\.teacherNotes/)
})