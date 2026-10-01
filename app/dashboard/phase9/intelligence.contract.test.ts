import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const source = readFileSync(join(process.cwd(), 'app/dashboard/phase9/IntelligenceClient.tsx'), 'utf8')
const studentPage = readFileSync(join(process.cwd(), 'app/dashboard/student/learning/page.tsx'), 'utf8')
const studentNavigation = readFileSync(join(process.cwd(), 'app/phase4/nav.tsx'), 'utf8')
const studentService = readFileSync(join(process.cwd(), 'lib/phase9/student-service.ts'), 'utf8')
const abandonRoute = readFileSync(join(process.cwd(), 'app/api/student/learning/today/abandon/route.ts'), 'utf8')

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
  assert.ok(source.includes("tab === 'Recommendations'"))
  assert.ok(source.includes('/api/student/learning/recommendations'))
  assert.ok(source.includes('/api/student/learning/profile'))
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

test('daily learning controls use the owned session lifecycle APIs', () => {
  for (const endpoint of [
    '/api/student/learning/today/complete',
    '/api/student/learning/today/abandon',
  ]) {
    assert.ok(source.includes(endpoint), `Missing daily session action: ${endpoint}`)
  }
  for (const action of ['START_STEP', 'PAUSE', 'RESUME', 'SKIP_STEP', 'COMPLETE_STEP']) {
    assert.ok(source.includes(`action: '${action}'`), `Missing progress action: ${action}`)
  }
  assert.match(studentService, /status: \{ in: \['PENDING', 'ACCEPTED'\] \}, OR:/)
  assert.match(studentService, /data: \{ status: 'ACCEPTED' \}/)
  assert.match(studentService, /completedRecommendationIds\(session\.steps\)/)
  assert.match(abandonRoute, /phase9DatabaseGuard\(\)/)
  assert.match(abandonRoute, /requireStudent\(\)/)
  assert.match(abandonRoute, /abandonTodayLearning\(access\.userId\)/)
})

test('student learning route preserves the canonical component, navigation, and all existing sections', () => {
  assert.match(studentPage, /import \{ StudentLearning \} from '@\/app\/dashboard\/phase9\/IntelligenceClient'/)
  assert.match(source, /export function StudentLearning\(\)/)
  assert.match(studentNavigation, /\/dashboard\/student\/learning/)
  for (const section of ['Today', 'Recommendations', 'Progress', 'Goals', 'Learning Profile']) {
    assert.ok(source.includes(`'${section}'`), `Missing student learning section: ${section}`)
  }
})