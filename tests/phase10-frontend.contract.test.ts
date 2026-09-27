import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')
const homepage = read('app/page.tsx')
const studentDashboard = read('app/dashboard/student/StudentDashboardClient.tsx')
const studentHome = read('app/dashboard/student/components/HomeTab.tsx')
const studentNavigation = read('app/phase4/nav.tsx')

test('homepage package failures stay generic, truthful, and retryable', () => {
  assert.match(homepage, /fetch\(packageEndpoint/)
  assert.match(homepage, /response\.status === 503 \|\| errorCode === 'DATABASE_UNAVAILABLE'/)
  assert.match(homepage, /status: 'error'/)
  assert.match(homepage, /We could not load the packages\./)
  assert.match(homepage, /Please try again later\. We will not show unverified package details\./)
  assert.match(homepage, /aria-label=.*Loading packages/)
  assert.match(homepage, /Try again/)
  assert.doesNotMatch(homepage, /error\.message|error\.stack|PrismaClient|Internal server error/)
})

test('student home summaries use existing read APIs and safe unavailable states', () => {
  for (const endpoint of [
    '/api/student/classes',
    '/api/student/homework',
    '/api/student/feedback',
    '/api/student/learning/today',
    '/api/student/learning/profile',
    '/api/student/learning/recommendations',
  ]) {
    assert.ok(studentHome.includes(endpoint), `Missing existing read API: ${endpoint}`)
  }
  assert.match(studentHome, /loadResource\(url/)
  assert.match(studentHome, /BFErrorState/)
  assert.match(studentHome, /BFEmptyState/)
  assert.doesNotMatch(studentHome, /error\.message|error\.stack/)
  assert.doesNotMatch(studentHome, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/i)
})

test('subscription lookup failures are not presented as a confirmed inactive subscription', () => {
  assert.match(studentDashboard, /fetch\('\/api\/student\/subscription-status'/)
  assert.match(studentDashboard, /'error' in data && data\.error/)
  assert.match(studentDashboard, /setSubscriptionState\('unavailable'\)/)
  assert.match(studentDashboard, /subscriptionState !== 'ready' \|\| !hasSubscription/)
  assert.match(studentDashboard, /ستبقى الأدوات المقيدة مغلقة/)
  assert.match(studentDashboard, /onClick=\{\(\) => void fetchSubscriptionStatus\(\)\}/)
  assert.match(studentDashboard, /!user\.isActive && subscriptionState === 'ready'/)
  assert.doesNotMatch(studentDashboard, /data\.error\.message|error\.stack/)
})

test('canonical student navigation and accessible responsive homepage controls remain active', () => {
  assert.match(studentNavigation, /\/dashboard\/student\/learning/)
  assert.match(homepage, /aria-controls="mobile-navigation"/)
  assert.match(homepage, /min-h-11 min-w-11/)
  assert.match(homepage, /lg:hidden/)
  assert.match(homepage, /\/about-path/)
  assert.match(homepage, /\/learning-path/)
  assert.match(homepage, /\/packages/)
})