import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const source = readFileSync(join(process.cwd(), 'app/dashboard/phase9/IntelligenceClient.tsx'), 'utf8')
const studentPage = readFileSync(join(process.cwd(), 'app/dashboard/student/learning/page.tsx'), 'utf8')
const studentNavigation = readFileSync(join(process.cwd(), 'app/phase4/nav.tsx'), 'utf8')
const studentService = readFileSync(join(process.cwd(), 'lib/phase9/student-service.ts'), 'utf8')
const abandonRoute = readFileSync(join(process.cwd(), 'app/api/student/learning/today/abandon/route.ts'), 'utf8')
const proposalRoute = readFileSync(join(process.cwd(), 'app/api/teacher/intelligence/students/[id]/proposals/route.ts'), 'utf8')
const proposalApproveRoute = readFileSync(join(process.cwd(), 'app/api/teacher/intelligence/suggestions/[id]/approve/route.ts'), 'utf8')
const proposalRejectRoute = readFileSync(join(process.cwd(), 'app/api/teacher/intelligence/suggestions/[id]/reject/route.ts'), 'utf8')
const adminSuggestionsRoute = readFileSync(join(process.cwd(), 'app/api/admin/intelligence/suggestions/route.ts'), 'utf8')
const teacherProposalsRoute = readFileSync(join(process.cwd(), 'app/api/teacher/intelligence/students/[id]/proposals/route.ts'), 'utf8')

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

test('teacher provider proposals use the assigned-student POST contract without a request body', () => {
  assert.match(source, /\/api\/teacher\/intelligence\/students\/\$\{encodeURIComponent\(id\.trim\(\)\)\}\/proposals/)
  assert.match(source, /api\(`[^`]+\/proposals`, \{ method: 'POST' \}\)/)
  assert.match(proposalRoute, /if \(!canSession\(access, 'teacher\.manageIntelligenceSuggestions'\)\)/)
  assert.match(proposalRoute, /mode: 'PROVIDER'/)
  assert.match(proposalRoute, /items: result\.suggestions/)
  assert.match(proposalRoute, /persisted: true/)
  assert.match(source, /result\?\.mode !== 'PROVIDER' \|\| result\?\.persisted !== true \|\| !Array\.isArray\(result\?\.items\)/)
  assert.match(proposalRejectRoute, /rejectSchema = z\.object\(\{ rejected: z\.literal\(true\) \}\)\.strict\(\)/)
  assert.match(proposalRejectRoute, /rejectTeacherSuggestion\(access, id\)/)
  assert.match(proposalApproveRoute, /approveTeacherSuggestion\(access, id\)/)
  assert.match(source, /body: JSON\.stringify\(\{ approved: true \}\)/)
  assert.match(source, /body: JSON\.stringify\(\{ rejected: true \}\)/)
})

test('provider proposals enter persisted teacher review and only approval materializes student recommendations', () => {
  assert.match(source, /data-testid="provider-proposals"/)
  assert.match(source, /data-testid="provider-proposal"/)
  assert.match(source, /suggestions\/\$\{encodeURIComponent\(item\.id\)\}\/approve/)
  assert.match(source, /suggestions\/\$\{encodeURIComponent\(item\.id\)\}\/reject/)
  assert.match(source, /materialized: true/)
  assert.match(source, /setProposals\(\(current\) => \[\.\.\.current, \.\.\.result\.items\]\)/)
  assert.match(source, /These proposals are saved for teacher review only\. They are not student recommendations until approved\./)
  assert.match(source, /item\.status === 'PENDING_REVIEW'/)
  assert.match(source, /Student recommendation records/)
  assert.match(source, /The AI provider is unavailable right now/)
  assert.match(source, /The provider response could not be safely reviewed/)
  assert.match(source, /The provider could not generate proposals/)
})

test('teacher restores assignment-bound pending proposals without generating another batch', () => {
  assert.match(teacherProposalsRoute, /export async function GET/)
  assert.match(teacherProposalsRoute, /getTeacherStudentProposalDrafts\(access, id\)/)
  assert.match(source, /\/api\/teacher\/intelligence\/students\/\$\{encodeURIComponent\(studentId\)\}\/proposals/)
  assert.match(source, /result\?\.ok !== true \|\| !Array\.isArray\(result\?\.items\)/)
  assert.match(source, /loadPendingProposals\(requestedId\)/)
  assert.match(source, /window\.sessionStorage\.getItem\('bf\.teacher\.intelligence\.studentId'\)/)
  assert.match(source, /void lookup\(savedId\)/)
  assert.match(source, /setProposals\(result\.items\)/)
})

test('admin intelligence loads the review queue and distinguishes approved materialization from rejection', () => {
  assert.match(adminSuggestionsRoute, /adminPendingAiSuggestions\(parsed\.data\.limit\)/)
  assert.match(adminSuggestionsRoute, /reviewAiSuggestionAsAdmin\(access\.userId, parsed\.data\.suggestionId, parsed\.data\.decision\)/)
  assert.match(source, /\/api\/admin\/intelligence\/suggestions\?limit=50/)
  assert.match(source, /body: JSON\.stringify\(\{ suggestionId: item\.id, decision \}\)/)
  assert.match(source, /result\?\.kind !== 'APPROVED' \|\| result\?\.materialized !== true/)
  assert.match(source, /result\?\.kind !== 'REJECTED'/)
  assert.match(source, /Approved and added to student recommendations\./)
  assert.match(source, /Rejected\. No student recommendation was created\./)
  assert.match(source, /Approving a manual teacher draft only marks it APPROVED; it does not create a student recommendation\./)
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