import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const source = readFileSync(join(process.cwd(), 'app/dashboard/phase9/IntelligenceClient.tsx'), 'utf8')

test('teacher suggestion UI keeps every displayed type on its allowed draft keys', () => {
  assert.match(source, /FEEDBACK_EXPRESSION: \['expression', 'meaning', 'example', 'category'\]/)
  assert.match(source, /MISTAKE: \['original', 'correction', 'explanation'\]/)
  assert.match(source, /EBI: \['betterExpression', 'explanation', 'priority'\]/)
  assert.match(source, /draft: safeDraft\(draft\)/)
})

test('teacher suggestion UI uses the create and explicit approval contracts', () => {
  assert.match(source, /\/api\/teacher\/intelligence\/suggestions/)
  assert.match(source, /const item = response\?\.item \?\? response/)
  assert.match(source, /suggestions\/\$\{item\.id\}\/approve/)
  assert.match(source, /JSON\.stringify\(\{ approved: true \}\)/)
  assert.match(source, /const result = response\?\.item \?\? response/)
})

test('student contract clients use profile for goals and mastery for progress', () => {
  assert.match(source, /tab === 'Recommendations' \? '\/api\/student\/learning\/recommendations' : '\/api\/student\/learning\/profile'/)
  assert.match(source, /data\.mastery/)
  assert.match(source, /item\.evidence\?\.score/)
  assert.match(source, /item\.evidence\?\.evidenceCount/)
})

test('today contract client renders plan status and snapshot step metadata', () => {
  assert.match(source, /plan\?\.status/)
  assert.match(source, /plan\?\.steps\?\.\[index\]/)
  assert.match(source, /step\.skillCode/)
  assert.match(source, /step\.resourceId/)
  assert.match(source, /step\.durationMinutes/)
})