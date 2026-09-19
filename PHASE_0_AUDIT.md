# B Fluent EDU — Phase 0 Repository Audit

**Audit date:** 2026-09-19  
**Scope:** Read-only repository audit and safe migration plan  
**Phase rule:** No database deletion, model deletion, authentication replacement, frontend rebuild, production deployment, or removal of legacy features was performed.

## A. EXECUTIVE SUMMARY

The repository is a working Next.js/React/TypeScript application with a MongoDB-oriented Prisma schema, NextAuth credentials authentication, student/teacher/admin dashboards, learning features, subscriptions, chat, email notifications, AI integrations, and a browser-based WebRTC meeting surface.

The current codebase is not yet aligned with the B Fluent EDU target architecture. The largest blockers are:

1. **Competing persistence assumptions:** the active schema uses MongoDB, while deployment and migration documentation references PostgreSQL/AWS. `schema-postgres.prisma` is actually SQLite-backed and `prisma/dev.db` is checked in.
2. **Authentication and authorization gaps:** credentials login uses email or phone and JWT sessions, but inactive users can still authenticate; middleware only covers dashboard page navigation; several admin and password-reset APIs require immediate review.
3. **Parallel legacy product systems:** placement testing, generic tests, vocabulary tests, writing tests, achievements, leaderboard, XP, and streaks remain connected to pages, APIs, navigation, and database models.
4. **Meeting/realtime duplication:** the project has multiple Socket.IO startup implementations and a static WebRTC meeting app. No QMeet integration was found.
5. **WhatsApp is not integrated:** current WhatsApp behavior is contact links, phone fields, and logged/manual messages. No Baileys, webhook, queue, or persisted conversation model exists.
6. **Notification infrastructure is incomplete:** email delivery exists through SMTP2GO, but there is no persisted notification center, delivery tracking, retry queue, or SSE notification stream.
7. **Deployment is not fully specified:** Replit works in development on port 5000, but Render is documented only, no Render manifest exists, and local filesystem uploads are not durable for a horizontally scaled deployment.
8. **Sensitive configuration risk:** `.replit` contains plaintext provider configuration and credentials in the imported project. Values are not reproduced in this report. They must be rotated and moved to secret storage before publishing.

The safest migration strategy is to first choose and document one database/deployment contract, harden authentication and API authorization, map existing data and routes to the target core relationship, then rebuild internal interfaces incrementally. Existing models and data should remain until every dependency is mapped and a rollback plan exists.

## B. CURRENT ARCHITECTURE

### Runtime and framework

- Next.js App Router with React and TypeScript.
- Root application directory: `app/`.
- Shared components: `components/`.
- Domain helpers, integrations, and services: `lib/`.
- Prisma schema and operational scripts: `prisma/` and `scripts/`.
- Custom Node HTTP server with Socket.IO: `start-server.js`.
- Additional duplicate server implementations: `server.js` and `server/socket.js`.
- Styling uses Tailwind CSS and global CSS.
- `next.config.ts` enables permissive development origins, remote images from any HTTPS hostname, SVG images, and `typescript.ignoreBuildErrors`.
- `app/layout.tsx` composes metadata, theme, session, toast, PWA, and global UI providers.

### Data flow

The runtime starts `start-server.js`, which:

1. Creates the Next app in development or production mode.
2. Copies `MONGODB_URI` into `DATABASE_URL` for the runtime Prisma helper.
3. Creates an HTTP server for Next.
4. Attaches a Socket.IO server at `/api/socket/io`.
5. Listens on `0.0.0.0:5000`.

The active Prisma datasource is MongoDB and reads `MONGODB_URI` from `prisma/schema.prisma`. The Prisma client helper reads `DATABASE_URL`, which creates a configuration mismatch that currently works only because the custom server maps the variables.

### Realtime

- Browser WebRTC and Socket.IO meeting UI exists under `public/meet/`.
- `start-server.js` contains the richer room/signaling implementation used by the main workflow.
- `server.js` and `server/socket.js` contain alternate implementations with different event behavior and ports.
- Socket.IO CORS is wildcard in the active and duplicate implementations.
- There is no authenticated room membership, durable pub/sub, horizontal scaling strategy, or server-side event schema validation.

### Current Replit setup

- Workflow: `Be Fluent Server`.
- Command: `npm run dev`.
- Web port: 5000.
- Development server status was verified during setup; the home page returned HTTP 200 after missing homepage image imports were redirected to existing public assets.
- This audit did not change the application behavior.

## C. CURRENT FRONTEND ROUTES

The following is the complete page route inventory found under `app/`.

### Public and marketing

| Route | Role | Purpose | Status | Direction |
|---|---|---|---|---|
| `/` | Public | Brand homepage, plans, level CTA, testimonials, FAQ | Working foundation | Keep as brand foundation |
| `/0` | Public | Alternate or legacy homepage surface | Unclear duplicate | Review, then deprecate if unused |
| `/about-path` | Public | Learning path information | Existing | Keep or rebuild into target marketing |
| `/achievements` | Public/auth-adjacent | Achievement and leaderboard-style surface | Legacy gamification surface | Deprecate after dependency review |
| `/chat` | Authenticated | Chat surface | Existing | Rebuild into target communication |
| `/contact` | Public | Contact form | Existing | Keep, harden |
| `/grammar` | Public/student | Grammar learning surface | Existing | Rebuild or reuse content |
| `/grammar-rules` | Public/student | Grammar rules | Existing | Keep/rebuild |
| `/learning-path` | Public | Learning path map | Existing | Rebuild around official levels/goals |
| `/packages` | Public | Package listing | Existing | Keep as commerce foundation |
| `/placement-test` | Public/student | Adaptive placement flow | Legacy product feature | Do not remove yet; map and replace later |
| `/settings` | Authenticated | Settings surface | Existing/role unclear | Review |
| `/ui-showcase` | Internal/dev | UI primitive showcase | Tooling surface | Keep for migration reference, not product navigation |

### Authentication

| Route | Role | Purpose | Status | Direction |
|---|---|---|---|---|
| `/auth/login` | Public | Email/phone plus password credentials login | Existing primary route | Replace UX later with one modal flow |
| `/auth/register` | Public | Multi-step registration, package/payment receipt flow | Existing | Rebuild after auth contract is approved |
| `/auth/forgot-password` | Public | Identifier lookup and password reset | Unsafe legacy flow | Rebuild before production |

### Admin

| Route | Role | Purpose | Status | Direction |
|---|---|---|---|---|
| `/admin/placement-test` | Admin | Legacy placement management | Duplicate admin surface | Deprecate after dashboard migration |
| `/admin/settings` | Admin | Legacy settings surface | Outside dashboard guard | Review and consolidate |

### Dashboards

| Route | Role | Purpose | Status | Direction |
|---|---|---|---|---|
| `/dashboard` | Authenticated | Role resolver and redirect | Existing | Keep as role gateway |
| `/dashboard/admin` | Admin/assistant | Admin dashboard tabs | Existing but broad | Rebuild into Control Center |
| `/dashboard/teacher` | Teacher/admin | Teacher dashboard tabs | Existing | Rebuild into target teacher app |
| `/dashboard/teacher/sessions` | Teacher/admin | Separate teacher sessions page | Duplicate session surface | Consolidate |
| `/dashboard/student` | Student | Student dashboard tabs | Existing | Rebuild from target information architecture |

### Student subroutes

Existing student pages include:

- `/dashboard/student/achievements`
- `/dashboard/student/ai-assistant`
- `/dashboard/student/cart`
- `/dashboard/student/checkout`
- `/dashboard/student/conversation-practice`
- `/dashboard/student/discover-words`
- `/dashboard/student/free-writing`
- `/dashboard/student/leaderboard`
- `/dashboard/student/lessons`
- `/dashboard/student/lessons/[id]`
- `/dashboard/student/level-progress`
- `/dashboard/student/my-orders`
- `/dashboard/student/schedule-sessions`
- `/dashboard/student/test-words`
- `/dashboard/student/video-learning`
- `/dashboard/student/vocabulary`
- `/dashboard/student/vocabulary/daily`
- `/dashboard/student/vocabulary/flashcards`
- `/dashboard/student/vocabulary/test`
- `/dashboard/student/writings`
- `/dashboard/student/writing-tests`

These routes mix the target learning concepts with legacy tests, gamification, placement, and achievement-heavy UX. The target product should eventually expose student Home, My Classes, Learning, Homework, Feedback, Speaking Rooms, Goals, and Profile as the primary navigation.

### Other dynamic/system pages

- `/invoice/[id]`
- `/session/[id]`
- `/loading`
- `/not-found`
- `/sitemap.xml` generated by `app/sitemap.ts`

### Frontend route issues

- Student child pages rely heavily on broad middleware and API checks; several pages do not repeat role checks themselves.
- `/admin/settings` and `/admin/placement-test` sit outside the `/dashboard` middleware matcher.
- Placement-test and gamification links are still present in marketing and student navigation.
- Teacher sessions exist both inside the teacher dashboard and as a separate page.

## D. CURRENT BACKEND/API ROUTES

The repository contains Next.js route handlers grouped below. This is a complete inventory by domain; dynamic segments are shown with brackets.

### Admin

`/api/admin/certificates`, `/api/admin/cleanup`, `/api/admin/clear-data`, `/api/admin/coupons`, `/api/admin/leads`, `/api/admin/learning-path`, `/api/admin/lessons`, `/api/admin/lessons/[id]`, `/api/admin/lessons/[id]/exercises`, `/api/admin/logs`, `/api/admin/packages`, `/api/admin/packages/[id]`, `/api/admin/page-content`, `/api/admin/placement-tests`, `/api/admin/placement-test/questions`, `/api/admin/placement-test/questions/[id]`, `/api/admin/seed`, `/api/admin/send-email`, `/api/admin/send-test-link`, `/api/admin/settings`, `/api/admin/stats`, `/api/admin/students`, `/api/admin/students/assign-teacher`, `/api/admin/subscriptions`, `/api/admin/subscriptions/[id]`, `/api/admin/subscriptions/[id]/approve`, `/api/admin/subscriptions/[id]/balance`, `/api/admin/teachers`, `/api/admin/test-settings`, `/api/admin/tests`, `/api/admin/users`, `/api/admin/users/[id]/toggle`.

**Audit status:** many routes use role checks, but several admin routes were found without a detectable session guard. Highest-risk examples are `seed`, `settings`, `tests`, placement question CRUD, `send-test-link`, `clear-data`, and user toggle.

### Authentication and public commerce

`/api/auth/[...nextauth]`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/view-password`, `/api/book-trial`, `/api/contact`, `/api/coupons/active`, `/api/packages`, `/api/packages/[id]`, `/api/subscriptions`, `/api/cart`, `/api/checkout`.

### AI and content

`/api/ai-assistant`, `/api/ai/placement-test`, `/api/grammar-check`, `/api/translate`, `/api/video-learning`, `/api/placement-test`.

### Chat, conversation, and live

`/api/chat/available-contacts`, `/api/chat/conversations`, `/api/chat/mark-read`, `/api/chat/messages`, `/api/chat/messages/[id]`, `/api/conversation/progress`, `/api/conversation/scenarios`, `/api/conversation/text-conversations`, `/api/conversation/voice-recordings`, `/api/live/start`, `/api/live/end`.

### Lessons, learning, words, vocabulary, and gamification

`/api/assignments/student`, `/api/exercises/[id]/attempt`, `/api/lessons`, `/api/lessons/[id]`, `/api/lessons/[id]/progress`, `/api/gamification/add-xp`, `/api/gamification/badges`, `/api/gamification/leaderboard`, `/api/gamification/stats`, `/api/words`, `/api/words/[id]`, `/api/words/categories`, `/api/words/discover`, `/api/words/import`, `/api/vocabulary/daily`, `/api/vocabulary/flashcards`, `/api/vocabulary/test`, `/api/vocabulary/upload`.

### Student

`/api/student/certificates`, `/api/student/certificates/auto`, `/api/student/certificates/download-pdf`, `/api/student/free-writing`, `/api/student/level-adjust`, `/api/student/level-progress`, `/api/student/performance-metrics`, `/api/student/placement-test/submit`, `/api/student/schedule-sessions`, `/api/student/sessions/[id]`, `/api/student/stats`, `/api/student/subscriptions`, `/api/student/subscriptions/[id]`, `/api/student/subscription-status`, `/api/student/writings/my-submissions`, `/api/student/writing-tests`, `/api/student/writing-tests-submit`.

### Teacher

`/api/teacher/assignments`, `/api/teacher/assignments/[id]`, `/api/teacher/assignments/[id]/grade`, `/api/teacher/free-writing`, `/api/teacher/free-writing/[id]`, `/api/teacher/free-writing/[id]/grade`, `/api/teacher/manuscripts`, `/api/teacher/sessions`, `/api/teacher/sessions/[id]`, `/api/teacher/sessions/[id]/attendance`, `/api/teacher/setup`, `/api/teacher/stats`, `/api/teacher/students`, `/api/teacher/writing-tests`, `/api/teacher/writing-tests/[id]`, `/api/teacher/writing-tests/[id]/grade`.

### Sessions, uploads, and shared subscriptions

`/api/sessions/student`, `/api/sessions/teacher`, `/api/subscriptions`, `/api/upload`, `/api/upload/receipt`.

### API status

- The API surface is broad and contains useful domain foundations.
- Auth patterns are mixed: centralized helpers, direct `getServerSession`, role checks, and some unguarded legacy routes.
- API contracts are not described in a single OpenAPI or equivalent source of truth.
- Public upload of receipts writes to `public/uploads/receipts` and should be treated as a storage and privacy risk.
- API route authorization must be audited before any frontend rebuild, because a new UI could expose existing unsafe handlers.

## E. CURRENT DATABASE MODELS

### Active database

`prisma/schema.prisma` uses:

- Prisma Client JS generator.
- MongoDB datasource.
- `MONGODB_URI`.
- String UUID IDs mapped to MongoDB `_id`.
- Mostly application-level relations and cascades.
- No explicit `@@index` declarations.

### Model grouping

#### AUTH

- `User`
- `AuditLog`

`User` stores email, name, phone, password hash, role, profile photo, active flag, timestamps, and relations to nearly every user-owned domain.

#### STUDENT

- `StudentProfile`
- `Word`
- `DailyWord`
- `Certificate`

Student profile also stores denormalized placement score/percentage and level fields.

#### TEACHER

- `TeacherProfile`

Teacher profiles own sessions and writing tests and are referenced by subscriptions and grading records.

#### ADMIN / CONTENT

- `SiteSettings`
- `PageContent`
- `Coupon`
- `AuditLog`

There is no separate Admin model. Admin is represented through `User.role`.

#### SUBSCRIPTIONS / COMMERCE

- `Package`
- `Subscription`
- `Cart`
- `CartItem`
- `Coupon`

`StudentProfile.packageId` and `Coupon.applicablePackageId` are scalar IDs rather than Prisma relations.

#### SESSIONS / GROUPS

- `Session`
- `SessionStudent`
- `LiveSession`
- `LiveParticipant`

There is no explicit `Group` model. `SessionStudent` is the main enrollment/join table. `LiveSession` and `LiveParticipant` contain scalar IDs without relations.

#### HOMEWORK / FEEDBACK

- `Assignment`
- `Submission`
- `WritingTest`
- `WritingTestSubmission`
- `FreeWriting`

Assignment teacher/student IDs are scalar fields without relations. Writing and free-writing overlap with the target feedback/homework concepts.

#### LEARNING

- `Lesson`
- `Exercise`
- `LessonProgress`
- `ExerciseAttempt`
- `ListeningContent`
- `ListeningExercise`
- `ListeningProgress`
- `ListeningExerciseAttempt`
- `ConversationScenario`
- `ConversationProgress`
- `VoiceRecording`
- `TextConversation`
- `TextConversationAttempt`

These models preserve meaningful learning history and should not be removed without a migration map.

#### TESTS / PLACEMENT

- `Test`
- `TestQuestion`
- `TestAttempt`
- `PlacementQuestion`
- `TestSettings`
- `PlacementTestAttempt`

There are two parallel placement architectures: generic `Test`/`TestQuestion`/`TestAttempt` and placement-specific models.

#### GAMIFICATION

- `UserGamification`
- `Badge`
- `UserBadge`
- `DailyActivity`

The schema contains XP, points, levels, streaks, badges, and activity counters.

#### TRIAL / LEAD

- `TrialBooking`

This is a weakly connected standalone model and may be legacy lead intake, but it must be confirmed against production data and admin usage.

### Schema risks

- MongoDB relation and cascade behavior must be verified before destructive operations.
- Scalar IDs can silently orphan data.
- JSON-like values are stored as strings in several models.
- No explicit indexes are declared despite dashboard, ownership, and progress queries.
- Placement state is duplicated between profile fields and attempt records.
- The PostgreSQL-named schema is actually SQLite and should not be treated as a migration source without confirmation.
- There are no WhatsApp, AI result, or notification models.

## F. CURRENT AUTHENTICATION

### Current flow

- NextAuth Credentials provider in `lib/auth.ts`.
- Login accepts `emailOrPhone`.
- Email is detected by the presence of `@`; otherwise phone lookup is used.
- Passwords are compared with bcrypt.
- JWT session strategy with approximately 90-day max age.
- JWT stores user ID, role, and active state.
- `SessionProvider` wraps the app from `app/layout.tsx`.
- Middleware uses `withAuth` for `/dashboard/:path*` only.
- Shared server helpers exist in `lib/auth-helpers.ts`.

### Current registration

- Multi-step registration in `app/auth/register/page.tsx`.
- Collects profile details, package choice, payment receipt, and registration data.
- `app/api/auth/register/route.ts` creates a STUDENT, StudentProfile, and pending Subscription.
- New users are created with `isActive: false`.
- Registration currently redirects toward `/placement-test?fromRegistration=true`.
- Email/phone verification and OTP are not implemented.

### Current password recovery

The recovery design is unsafe and must be treated as a blocking issue:

- Forgot-password endpoint confirms whether an account exists and exposes a user ID.
- Reset endpoint accepts an arbitrary user ID and a new password without a signed token, OTP, expiry, or authenticated proof.
- `view-password` is another unauthenticated password mutation path that returns a temporary password.
- There is no rate limiting or anti-enumeration behavior.

### Authorization gaps

- Inactive users can authenticate because the `isActive` check is commented out.
- Dashboard middleware does not protect APIs.
- API protection is inconsistent.
- Admin seed/settings/tests/placement utilities and user toggle require immediate route-by-route guard review.
- JWT role and active claims can remain stale for up to the session lifetime after account changes.
- Embedded login posts `LOGIN_SUCCESS` to `window.top` with wildcard target origin.

### Target direction

There should be one authentication system for all roles. The primary public UX should become:

`Home → Login modal → phone number → WhatsApp verification code → server resolves role → correct dashboard`.

That is a future implementation direction, not a Phase 0 change.

## G. PLACEMENT TEST DEPENDENCY MAP

### User-facing pages

- `app/placement-test/page.tsx`
- `app/placement-test/PlacementTestContent.tsx`
- `app/dashboard/student/level-progress/page.tsx`
- `components/gamification/LevelProgressWidget.tsx`
- Student dashboard placement banner and registration redirect.

### API paths

- `app/api/ai/placement-test/route.ts`: current page flow; Kimi-generated adaptive questions and persistence.
- `app/api/placement-test/route.ts`: separate static question flow.
- `app/api/student/placement-test/submit/route.ts`: database-backed question bank flow.
- `app/api/admin/placement-tests/route.ts`.
- `app/api/admin/placement-test/questions/route.ts`.
- `app/api/admin/placement-test/questions/[id]/route.ts`.
- `app/api/admin/test-settings/route.ts`.
- `app/api/admin/send-test-link/route.ts`.
- `app/api/student/level-progress/route.ts`.
- `app/api/student/level-adjust/route.ts`.

### Data models and helpers

- `StudentProfile.placementTestScore`
- `StudentProfile.placementTestPercentage`
- `PlacementQuestion`
- `TestSettings`
- `PlacementTestAttempt`
- Generic `Test`, `TestQuestion`, and `TestAttempt`
- `lib/placement-test-questions.ts`
- `lib/placement-test-questions.ts` and AI placement helpers
- `lib/student-level-system.ts`

### Dependency and risk map

- The public page currently uses the AI/Kimi flow, not the database-backed student submit route.
- The client sends correctness information that the AI finish path trusts; server-side scoring is not authoritative in that path.
- Multiple scoring and persistence paths can disagree.
- Level progress uses learning activity and can adjust levels separately from official staff-controlled levels.
- Marketing links remain on the homepage and marketing frame.
- The target specification says official levels must be controlled by authorized staff and must not be automatically assigned by the old placement test.

**Decision for future phases:** preserve all current data and code during migration; select one authoritative placement-history model or replace the user experience with staff-controlled level assignment after dependencies are mapped.

## H. LEGACY TEST FEATURE MAP

### Generic test system

- Models: `Test`, `TestQuestion`, `TestAttempt`.
- Admin endpoints: `/api/admin/tests`, `/api/admin/test-settings`.
- The model supports placement and other test types such as final levels.
- No complete student-facing generic exam flow was found.

### Vocabulary test system

- Pages:
  - `/dashboard/student/vocabulary/test`
  - `/dashboard/student/test-words`
- API: `/api/vocabulary/test`.
- Uses student words and level-based word data.
- Updates word review/known state.
- Does not consistently connect to XP or streak updates.

### Writing test system

- Pages:
  - `/dashboard/student/writings`
  - `/dashboard/student/writing-tests`
- APIs:
  - `/api/student/writing-tests`
  - `/api/student/writing-tests-submit`
  - `/api/teacher/writing-tests`
  - `/api/teacher/writing-tests/[id]`
  - `/api/teacher/writing-tests/[id]/grade`
- Models: `WritingTest`, `WritingTestSubmission`.
- Grading produces feedback and grammar errors, but the two student submission paths do not have identical XP behavior.

### Trial

- No `trial-test` assessment was found.
- `TrialBooking` and `/api/book-trial` are trial booking/lead functionality, not an assessment.

### Target direction

The target product is not an exam platform. Do not delete these systems in Phase 0. Treat them as legacy dependencies and map all links, model relations, user data, and APIs before deprecating them.

## I. GAMIFICATION DEPENDENCY MAP

### Models

- `UserGamification`
- `Badge`
- `UserBadge`
- `DailyActivity`
- `BadgeCategory`
- `BadgeRarity`

### Services and APIs

- `lib/gamification.ts`: rewards, XP, points, levels, streaks, badges, ranking, and initialization.
- `/api/gamification/stats`
- `/api/gamification/badges`
- `/api/gamification/leaderboard`
- `/api/gamification/add-xp`

### Pages and components

- `/achievements`
- `/dashboard/student/achievements`
- `/dashboard/student/leaderboard`
- `components/gamification/GamificationHeader.tsx`
- `components/gamification/StreakDisplay.tsx`
- `components/gamification/LevelProgress.tsx`
- `components/gamification/LevelProgressWidget.tsx`
- `components/gamification/BadgeCard.tsx`
- Student Home integration.

### Findings

- XP and gamification are prominent in the current student experience.
- Generic `add-xp` accepts client-supplied custom XP from an authenticated caller and requires abuse review.
- Some learning activities award XP while others do not.
- `perfectScores` badge logic was found without a clear increment path.
- The target direction explicitly removes leaderboard, achievement-heavy dashboard, and gamification-heavy UX.
- Keep the historical data during migration; decide later whether it remains behind a low-priority profile/progress surface or is deprecated.

## J. STUDENT SYSTEM AUDIT

### Current structure

- Main route: `/dashboard/student`.
- Client controller: `StudentDashboardClient.tsx`.
- Tabs/components cover home, sessions, homework, certificates, packages, subscriptions, lessons, vocabulary, writing, conversation, video, AI assistant, orders, scheduling, achievements, leaderboard, and level progress.
- Student API namespace exists, but general learning and gamification APIs are separate.

### Data dependencies

- `User`
- `StudentProfile`
- `Subscription`
- `Package`
- `SessionStudent`
- `Session`
- `Assignment`
- `Submission`
- `Lesson` and progress/attempt models
- Vocabulary and conversation models
- Gamification models
- Certificates and writing models

### Current strengths

- Student data is mostly scoped through the authenticated user ID.
- Student stats aggregate words, sessions, subscriptions, assignments, and next session.
- Student and teacher responsibilities are separated across API namespaces.

### Current issues

- Inactive/pending accounts are not reliably blocked.
- The dashboard exposes legacy placement, tests, achievements, and leaderboard concepts.
- Some student pages depend on broad middleware rather than local role checks.
- Student Home contains hardcoded presentation values such as weekly XP.
- Level adjustment and placement logic overlap.
- Assignment stats contain an unusual teacher filter that should be verified.

### Target student rebuild

The target navigation should be:

`Home / My Classes / Learning / Homework / Feedback / Speaking Rooms / Goals / Profile`.

Existing data should be mapped into these surfaces, not deleted.

## K. TEACHER SYSTEM AUDIT

### Current structure

- Main route: `/dashboard/teacher`.
- Separate route: `/dashboard/teacher/sessions`.
- Main UI includes home, students, sessions, assignments, writing tests, manuscripts, chat, and an admin link.
- APIs cover setup, stats, students, sessions, attendance, assignments, grading, writing tests, free writing, and manuscripts.

### Current strengths

- `requireTeacher` centralizes part of teacher/admin access.
- Ordinary teacher session and student queries are partly scoped to the teacher profile.
- Session creation sends email notifications.

### Current issues

- Admin behavior partly depends on the mutable display name `Be Fluent`.
- The dashboard UI shows an admin link without consistently checking the current role.
- Ownership checks are mixed between centralized helpers and ad hoc route logic.
- Chat recipient ownership/relationship validation is incomplete.
- Writing and free-writing workflows overlap and have inconsistent XP behavior.
- QMeet is not a real backend integration; session links are stored as generic external links.

### Target teacher rebuild

The target teacher navigation is:

`Dashboard / My Classes / My Students / Feedback / Homework / Learning Resources / QMeet / Profile`.

## L. ADMIN SYSTEM AUDIT

### Current structure

- Main route: `/dashboard/admin`.
- Main tabs include stats, leads, users, students, subscriptions, coupons, lessons, placement tests, page content, email, logs, and system settings.
- Separate legacy admin pages exist for settings and placement tests.
- Admin and assistant roles are mixed; some mutations are ADMIN-only and some read operations permit ASSISTANT.

### Current strengths

- Admin stats and the main dashboard have server-side role checks.
- There are existing administrative CRUD endpoints for users, packages, lessons, subscriptions, teachers, and content.

### Critical issues

- Unauthenticated or insufficiently guarded admin endpoints were found.
- Admin seed creates predictable test accounts and can return passwords.
- `clear-data` is gated by development environment rather than robust authorization.
- User toggle endpoint does not consistently use a session check.
- Assistant-facing UI may expose functions intended for admins.
- Placement/test admin tools duplicate future learning and level management.

### Target admin rebuild

The target is a Control Center with:

`Students / Teachers / Learning / Subscriptions / Groups / Classes / Feedback / Homework / Speaking Rooms / WhatsApp / AI / System`.

The target admin surface should be built only after route authorization and domain contracts are stabilized.

## M. SUBSCRIPTION/GROUP AUDIT

### Current subscription flow

- `Package` defines title, price, lessons, duration, and active state.
- `Subscription` links a user and package, with payment/status/quota/teacher assignment fields.
- Cart and cart item models support package purchase.
- Registration can create a pending subscription and accepts a receipt URL.
- Admin approval route updates subscription and sends email; WhatsApp behavior is only logged/manual.

### Group model status

- No explicit `Group` Prisma model exists.
- `SessionStudent` acts as a session enrollment join table.
- A future group system will need a clear relationship among student, level, subscription, group, class, QMeet room, attendance, feedback, homework, and progress.

### Risks

- Student package IDs are scalar, not relational.
- Subscription status and active account status are separate and not enforced consistently.
- Local receipt uploads are public filesystem objects.
- Teacher assignment relation exists, but groups are not modeled.
- Deleting packages/users/teachers can cascade or orphan operational data.

## N. CLASS/QMEET AUDIT

### Current class/session system

- `Session` belongs to `TeacherProfile`.
- `SessionStudent` links students to sessions.
- Session includes room, external link, password, recording URL, and WhatsApp number fields.
- Teacher APIs create/update sessions and attendance.
- `/session/[id]` and the static meeting surface provide a class-room entry point.

### QMeet status

No QMeet API or SDK implementation was found. No `/api/qmeet/v1/meetings` handlers were found. The actual implementation is a custom browser WebRTC meeting app under `public/meet/`.

### Current meeting capabilities

- Browser media capture.
- Peer connections.
- Screen sharing.
- Local recording.
- Chat and hand raising.
- Socket.IO signaling.

### Missing or unsafe capabilities

- No server-side recording persistence.
- No authenticated room membership.
- URL query parameters influence room/user/role.
- Wildcard Socket.IO CORS.
- Multiple incompatible Socket.IO servers.
- No QMeet API contract.
- No attendance integration demonstrated end-to-end.

## O. WHATSAPP AUDIT

### Found

- User phone fields.
- Session WhatsApp number.
- Site settings WhatsApp/support numbers.
- Floating WhatsApp/contact buttons.
- Links and manual contact messages in checkout and admin views.
- Subscription approval logs a proposed message.

### Not found

- `@whiskeysockets/baileys`.
- WhatsApp Cloud API, Twilio, or 360dialog integration.
- QR connection or linked-device service.
- Session persistence.
- Inbound webhook.
- Message queue/retry.
- Delivery state.
- AI reply pipeline.
- Human takeover state.
- WhatsApp conversation model.
- SSE stream for WhatsApp administration.

### Assessment

The current WhatsApp functionality is manual/contact-oriented, not automation. The target WhatsApp admin area requires a separate integration design, consent model, secure session storage, queueing, delivery tracking, and auditability.

## P. AI AUDIT

### Existing integrations

- `/api/ai-assistant` uses an OpenAI server key and model configuration.
- `/api/grammar-check` uses OpenAI and is role restricted.
- `/api/video-learning` uses OpenAI when configured.
- `lib/kimi.ts` is an OpenAI-compatible Moonshot/Kimi client.
- `/api/ai/placement-test` uses Kimi for adaptive placement.

### Existing non-AI learning behavior

- Conversation practice uses predefined scenarios, scripts, and keyword matching.
- Learning content and vocabulary are largely local/static plus Prisma persistence.

### Production readiness

The OpenAI/Kimi calls are real external integrations, but missing or incomplete controls include:

- Structured output validation.
- Rate limits.
- Usage and cost limits.
- Prompt versioning.
- Moderation.
- Provider fallback.
- Streaming.
- Observability.
- Persisted AI request/result records.

Do not add AI functionality in Phase 0.

## Q. NOTIFICATION AUDIT

### Current notifications

- SMTP2GO integration in `lib/email.ts`.
- Email is used by sessions, subscriptions, assignments, and certificates.
- Toast notifications use `react-hot-toast`.
- Some failures are logged rather than queued or retried.

### Missing

- `Notification` Prisma model.
- In-app notification center.
- Unread/read persistence.
- Notification preferences.
- Delivery tracking.
- Retry queue.
- Push notifications.
- SSE notification stream.
- WhatsApp delivery state.

### Assessment

Email is a real integration but not an operational notification platform. The target product needs a durable notification contract that can support class reminders, homework, feedback, subscription state, and WhatsApp communication.

## R. FRONTEND DESIGN AUDIT

### Existing foundation

- Bilingual Arabic/English direction.
- RTL support and theme context.
- Green/gray Be Fluent visual language.
- Responsive Tailwind layouts.
- Reusable UI primitives in `components/ui/`.
- UI showcase at `/ui-showcase`.

### Inconsistencies

- Many surfaces use ad hoc inline Tailwind rather than shared primitives.
- Dashboard, marketing, auth, and chat components use different card, button, modal, and empty-state patterns.
- Legacy test/gamification surfaces increase navigation and visual clutter.
- Dashboard information architecture does not match the target product.
- Several flows use decorative animation and older dashboard patterns that should be evaluated against the calmer mobile-first direction.
- Accessibility contracts and keyboard/focus behavior are not documented.
- There is no design-token governance or component test/story system.

### Direction

Do not redesign in Phase 0. The internal UI should be rebuilt from the target architecture after the data/auth/API audit is approved. The public homepage can remain a brand/content foundation.

## S. DEPLOYMENT AUDIT

### Replit

- `.replit` configures Node.js 20 and a web workflow.
- `npm run dev` starts the custom server.
- Port 5000 is correctly exposed for the current workflow.
- Development preview was verified.

### Render

- `DEPLOYMENT.md` describes a manual Render deployment.
- No `render.yaml` exists.
- The document assumes PostgreSQL/AWS variables while the active schema is MongoDB.
- The target specification says Render plus MongoDB; the repository is not yet aligned to that contract.

### PostgreSQL/AWS

- PostgreSQL appears in deployment and migration documents.
- `EXTERNAL_DATABASE_URL` appears in operational scripts.
- AWS/RDS references exist in documentation.
- No AWS SDK, RDS infrastructure, or database migration implementation was found.

### Vercel

- Vercel appears in the stock README and public template assets only.
- No Vercel configuration was found.
- The custom long-lived Socket.IO server is not a straightforward serverless deployment fit.

### Storage

- Uploads are written to local `public/uploads/`.
- This is not durable/shared storage for a horizontally scaled or ephemeral deployment.
- Receipt uploads are especially sensitive because they return public URLs.

### Configuration risk

- Provider credentials are present in imported project configuration and must not remain there.
- `next.config.ts` exposes `NEXTAUTH_SECRET` and `NEXTAUTH_URL` through the Next config `env` section.
- Remote image hostname `**`, permissive SVG handling, wildcard Socket.IO CORS, and ignored TypeScript build errors should be narrowed before publishing.

## T. REUSABLE CODE

### Reusable now, after validation

- `lib/auth-helpers.ts` role and ownership helper foundation.
- `lib/prisma.ts` client lifecycle pattern, after database contract cleanup.
- `components/ui/` primitives: Button, Input, Card, Modal, ConfirmModal, Badge, LoadingSpinner, Alert, Tabs, Table.
- Theme and RTL context.
- Email helper, after adding explicit failure handling and queue strategy.
- Existing package/subscription CRUD patterns.
- Existing session/student/teacher relationships.
- Existing learning content and vocabulary data.
- Existing assignment and feedback data.
- Existing chat persistence model.

### Reuse with caution

- Existing dashboards: use for domain discovery, not as the target layout.
- Existing placement and gamification services: preserve data dependencies but do not assume target UX.
- Existing WebRTC client: reuse only after room auth and backend ownership are redesigned.
- Existing static uploads: migrate to durable object storage before production.

## U. REBUILD REQUIRED

The following areas require a deliberate future rebuild, not ad hoc restyling:

1. Internal student frontend around the target navigation.
2. Internal teacher frontend around classes, students, feedback, homework, resources, and QMeet.
3. Admin Control Center around operational domains.
4. Primary authentication UX into one modal/phone/verification flow.
5. Official level assignment and goal/progress model.
6. Group/class/QMeet relationship.
7. Feedback and homework relationship.
8. WhatsApp integration and admin control plane.
9. Notification center and durable delivery model.
10. Deployment contract and storage layer.
11. API authorization boundary and shared validation.

No rebuild was started by this audit.

## V. DEPRECATE

Candidates for staged deprecation after dependency and data confirmation:

- Public placement-test marketing CTAs and the current adaptive test UX.
- Generic exam/test admin scaffolding.
- Vocabulary test and writing-test UX where it conflicts with learning practice.
- Leaderboard, achievements, XP, and streak-first navigation.
- Separate `/admin/settings` and `/admin/placement-test` pages.
- Separate teacher sessions page if embedded sessions becomes canonical.
- Duplicate `server.js`, `server/socket.js`, and `start-server.js` startup behavior; select one canonical server.
- `schema-postgres.prisma` and SQLite development database as migration sources, after the database decision.
- Legacy `/0` page if confirmed unused.

Deprecation must include link inventory, data retention, redirects, and rollback.

## W. REMOVE

Nothing was removed in Phase 0. Possible future removal candidates, only after approval and dependency checks:

- Unused duplicate route surfaces.
- Unused test/placement/gamification UI and API handlers after data migration.
- Duplicate Socket.IO servers and unused event contracts.
- Stale deployment scripts and conflicting schema files.
- AppleDouble `._*` files and large archive artifacts if confirmed not required.
- Local receipt/upload paths after durable storage migration.

Never remove database models, collections, or user data solely because they appear legacy.

## X. MIGRATION RISKS

### Critical

- Plaintext secrets and provider credentials in project configuration.
- Unauthenticated password reset and temporary-password endpoints.
- Unauthenticated or insufficiently guarded admin mutation endpoints.
- Inactive users can authenticate.
- Public unrestricted receipt upload.
- Wildcard realtime CORS and unauthenticated room signaling.

### High

- Choosing MongoDB, PostgreSQL, or SQLite incorrectly could cause data loss or a broken deployment.
- Placement has multiple scoring and persistence systems.
- User deletion can cascade across learning, chat, subscriptions, and progress.
- Scalar IDs without relations can orphan records.
- JWT role/active state can be stale.
- Local filesystem uploads are not durable.
- Duplicate server implementations can create incompatible event behavior.

### Medium

- No schema indexes for frequent ownership/progress/dashboard queries.
- JSON-like fields stored as strings.
- Inconsistent XP hooks and hardcoded dashboard values.
- Email failures are logged instead of retried.
- No route contract or automated end-to-end test suite was found.
- `typescript.ignoreBuildErrors` can hide production defects.

### Safe migration constraints

- Keep the current MongoDB data intact.
- Snapshot/checkpoint before any Phase 1 implementation.
- Map every model and route before deletion or renaming.
- Introduce new contracts alongside old ones where needed.
- Add read-only verification and rollback paths before destructive migration.

## Y. RECOMMENDED PHASE ORDER

1. **Phase 0 — Audit and approval:** this report, route/model maps, risk register, and explicit product decisions.
2. **Phase 1 — Safety and contracts:** move secrets to managed storage, rotate exposed credentials, close critical auth/API gaps, select MongoDB/Render as the authoritative deployment contract, and define API validation conventions.
3. **Phase 2 — Core domain mapping:** formalize level, subscription, group, class, attendance, feedback, homework, learning, goals, and progress relationships without deleting legacy data.
4. **Phase 3 — Authentication foundation:** design the single role-resolving authentication flow and migration path from current credentials/JWT users.
5. **Phase 4 — Public and auth UX:** keep the homepage brand foundation while introducing the approved modal/verification login experience.
6. **Phase 5 — Student product:** build Home, Classes, Learning, Homework, Feedback, Speaking Rooms, Goals, and Profile using the existing data map.
7. **Phase 6 — Teacher product:** build Classes, Students, Feedback, Homework, Resources, QMeet, and Profile.
8. **Phase 7 — Admin Control Center:** consolidate operational management and enforce role-specific functions.
9. **Phase 8 — Integrations:** implement QMeet, WhatsApp, notification delivery, and authenticated realtime with explicit contracts.
10. **Phase 9 — Legacy retirement:** remove or redirect placement/test/gamification surfaces only after usage, data, and dependency sign-off.
11. **Phase 10 — Deployment readiness:** durable storage, Render configuration, production build, route smoke checks, monitoring, backups, and rollback.

## Z. PHASE 1 IMPLEMENTATION PLAN

Phase 1 should begin only after this audit is accepted. It should be intentionally narrow and security/contract focused.

### Workstream 1: secrets and configuration

- Rotate any credentials present in tracked project configuration.
- Move runtime values to Replit Secrets during development and Render secret storage for production.
- Remove secret values from project files and future generated artifacts.
- Keep only variable names and non-sensitive defaults in documentation.

### Workstream 2: authentication and authorization

- Replace password reset with expiring, signed, one-time verification.
- Remove or lock down temporary-password behavior.
- Decide whether inactive users may authenticate; enforce the approved decision server-side.
- Audit every `/api/admin/*`, upload, live, chat, and student/teacher mutation route.
- Centralize role and ownership checks.
- Add rate limiting and input validation for public auth and upload routes.

### Workstream 3: database/deployment contract

- Confirm MongoDB as the target database together with Render.
- Treat `prisma/schema.prisma` as the candidate active source only after comparing it to production.
- Mark PostgreSQL/AWS/SQLite documentation and scripts as historical until reconciled.
- Document backup, migration, and rollback procedures.
- Add indexes based on measured dashboard and ownership queries.

### Workstream 4: domain contract

- Define the canonical relationships:
  `Student → Level → Subscription → Group → Class → QMeet → Attendance → Feedback → Homework → Learning → Speaking Rooms → Goals → Progress`.
- Map existing model IDs and records to each relationship.
- Decide how official levels differ from historical placement attempts.
- Decide whether legacy test/gamification data remains visible, archived, or hidden.

### Workstream 5: verification

- Add route-level authorization checks before frontend work.
- Verify development startup and a production build.
- Add smoke coverage for login, registration, role routing, subscription state, class access, homework, and admin boundaries.
- Verify no secret values appear in logs, repository files, or client bundles.

### Phase 1 exit criteria

- Database and deployment contract is approved.
- Critical auth and admin API risks are closed or explicitly accepted with mitigations.
- Secret storage is clean and credentials have been rotated.
- Canonical domain relationships and legacy retention decisions are documented.
- A checkpoint exists before any internal frontend rebuild.

---

**Phase 0 status:** Audit complete.  
**Implementation status:** No Phase 1 or product migration changes were made by this audit.  
**Next decision required:** Approve or revise this audit and the Phase 1 scope before implementation.