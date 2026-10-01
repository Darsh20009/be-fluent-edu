import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')
const homepage = read('app/page.tsx')
const layout = read('app/layout.tsx')
const dashboardRoute = read('app/dashboard/page.tsx')
const studentDashboard = read('app/dashboard/student/StudentDashboardClient.tsx')
const studentHome = read('app/dashboard/student/components/RedesignedHomeTab.tsx')
const adminDashboard = read('app/dashboard/admin/AdminDashboardClient.tsx')
const adminOverview = read('app/dashboard/admin/components/AdminOverviewRedesign.tsx')
const teacherDashboard = read('app/dashboard/teacher/TeacherDashboardClient.tsx')
const teacherFeedbackPage = read('app/dashboard/teacher/feedback/page.tsx')
const teacherFeedback = read('app/dashboard/teacher/feedback/TeacherFeedbackWorkspace.tsx')
const studentNavigation = read('app/phase4/nav.tsx')
const managerDashboard = read('app/dashboard/manager/page.tsx')
const marketingFrame = read('components/marketing/MarketingFrame.tsx')

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
  assert.match(studentHome, /ResourceMessage/)
  assert.match(studentHome, /تعذر تحميل هذه المعلومات/)
  assert.match(studentHome, /إعادة المحاولة/)
  assert.doesNotMatch(studentHome, /error\.message|error\.stack/)
  assert.doesNotMatch(studentHome, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/i)
})

test('approved role screens use their real routes and supported lifecycle APIs', () => {
  assert.match(studentDashboard, /components\/RedesignedHomeTab/)
  assert.match(adminDashboard, /components\/AdminOverviewRedesign/)
  assert.equal((adminDashboard.match(/\/api\/admin\/stats/g) || []).length, 1, 'Admin stats are fetched once and shared with the overview')
  assert.match(adminDashboard, /HomeTab stats=\{stats\}/)
  assert.match(adminDashboard, /router\.push\('\/dashboard\/admin\/whatsapp'\)/)
  assert.match(adminDashboard, /router\.push\('\/dashboard\/admin\/classes'\)/)
  for (const endpoint of ['/api/admin/feedback', '/api/admin/homework']) {
    assert.ok(adminOverview.includes(endpoint), `Missing existing admin read API: ${endpoint}`)
  }
  assert.doesNotMatch(adminOverview, /\/api\/admin\/stats/)
  assert.match(teacherFeedbackPage, /TeacherFeedbackWorkspace/)
  assert.match(teacherDashboard, /href="\/dashboard\/teacher\/feedback"/)
  for (const endpoint of ['/api/teacher/classes/sessions', '/api/teacher/feedback']) {
    assert.ok(teacherFeedback.includes(endpoint), `Missing existing teacher read API: ${endpoint}`)
  }
  assert.match(teacherFeedback, /READY_TO_PUBLISH/)
  assert.match(teacherFeedback, /PUBLISHED/)
})

test('manager role reaches its permission-scoped workspace and WhatsApp CRM', () => {
  assert.match(dashboardRoute, /role === 'MANAGER'/)
  assert.match(dashboardRoute, /redirect\('\/dashboard\/manager'\)/)
  assert.match(managerDashboard, /session\.user\.role !== 'MANAGER'/)
  assert.match(managerDashboard, /\/dashboard\/admin\/whatsapp/)
  assert.match(managerDashboard, /Phase4Nav area="manager"/)
  assert.match(studentNavigation, /area === 'manager'/)
  assert.doesNotMatch(managerDashboard, /AdminOverviewRedesign|AdminDashboardClient/)
})

test('coupon lookup stays on public marketing pages instead of every authenticated route', () => {
  assert.doesNotMatch(layout, /LatestCouponPopup/)
  assert.match(homepage, /LatestCouponPopup/)
  assert.match(marketingFrame, /LatestCouponPopup/)
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