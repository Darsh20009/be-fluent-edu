# B Fluent EDU — Phase 2 Model Map

**Status:** Baseline mapping completed  
**Database contract:** MongoDB through `prisma/schema.prisma`  
**Safety rule:** This document is a mapping contract. It does not authorize
collection deletion, `prisma db push`, destructive schema changes, or data
migration.

## 1. Mapping rules

- `KEEP` means the existing model remains the authoritative compatibility model.
- `ADAPT` means the model remains in place while additive fields, relations, or
  a compatibility service gradually align it with the target domain.
- `MERGE` means the current data has more than one semantic source and needs an
  explicit record-level migration plan before consolidation.
- `DEPRECATE` means no new target-domain dependency should be created, but the
  model and its data remain available.
- `REMOVE_LATER` means removal is a future operation only after export,
  dependency migration, retention approval, and rollback planning.

Code references below identify the current consumers found in `app/`, `lib/`,
`components/`, `models/`, and `prisma/seed.ts`. Existing route consumers are
not being rewritten in this phase.

## 2. Current model map

### Identity and system

| Current model | Target model | Fields and relations inspected | Code references | API references | Risk | Action | Reason |
|---|---|---|---|---|---|---|---|
| `User` | `User` | `id`, required `email`, `name`, optional `phone`, `passwordHash`, string `role`, `isActive`, timestamps; relations to almost every user-owned model | `lib/auth.ts`, `lib/auth-helpers.ts`, `lib/prisma.ts`, `prisma/seed.ts`, admin/student/teacher routes | `/api/auth/*`, `/api/admin/users`, `/api/admin/students`, `/api/admin/teachers`, most student/teacher APIs | Critical | ADAPT | It is the single identity source already used by authentication and all ownership relations. Preserve email/password compatibility while adding normalized phone, status, and target permissions additively. |
| `StudentProfile` | `StudentProfile` and `StudentLearningProfile` | `userId` unique; age, legacy level fields, goal, package/receipt fields, placement score/percentage, verification; belongs to `User` | `lib/student-level-system.ts`, `prisma/seed.ts`, student dashboard code | `/api/student/*`, `/api/placement-test`, `/api/ai/placement-test`, `/api/admin/students`, `/api/auth/register` | Critical | ADAPT | Student identity and legacy placement history must remain. Official level, stage, recommendations, and learning intelligence need a separate additive profile rather than overwriting legacy fields. |
| `TeacherProfile` | `TeacherProfile` | `userId` unique; bio, subjects; owns sessions, writing tests, free-writing grading, assigned subscriptions | `lib/auth-helpers.ts`, teacher dashboard, `prisma/seed.ts` | `/api/teacher/*`, `/api/admin/teachers`, `/api/admin/students/assign-teacher`, `/api/sessions/teacher` | Critical | ADAPT | Existing teacher IDs are referenced by sessions and subscriptions. Keep the profile and add target group/class relations without changing IDs. |
| `AuditLog` | `AuditLog` | `action`, optional `userId`, free-form `details`, `createdAt`; currently no relation from `userId` | `lib/audit/index.ts`, admin routes | `/api/admin/logs`, approval and cleanup routes | High | ADAPT | The target requires actor, entity, metadata, timestamp, and outcome. Existing string details and IDs must remain readable while structured fields are added. |
| `SiteSettings` | System settings | Marketing/support fields and serialized learning path | Admin settings and learning-path pages | `/api/admin/settings`, `/api/admin/learning-path` | Medium | ADAPT | Settings mix operational and marketing concerns. Preserve the singleton-like record and split ownership later without deleting values. |
| `PageContent` | Content configuration | `page`, `section`, `field`, `value`, `type`; unique page/section/field | No direct Prisma delegate was found in the inspected route set; schema and admin content contract remain | Planned/admin page-content surface | Medium | ADAPT | It is a reusable content registry, but its fields are not domain resources. Keep it as configuration until content ownership is reviewed. |
| `Certificate` | System certificate artifact | Student ID, level, issuer, issue date, URL, manual flag | Student certificate pages and auto-certificate route | `/api/student/certificates*`, `/api/admin/certificates` | High | KEEP | Certificates are durable student artifacts and are not part of the Phase 2 removal list. Keep them isolated from new learning progress. |
| `StaffPermission` | `StaffPermission` | **New:** user, permission key, scope, grant/revoke status, timestamps | No current model or delegate | No current API | Medium | ADD | Staff permissions must remain centralized. Add a model linked to the single `User` identity; do not create separate admin authentication. |

### Commercial and enrollment

| Current model | Target model | Fields and relations inspected | Code references | API references | Risk | Action | Reason |
|---|---|---|---|---|---|---|---|
| `Package` | `Package` | Title/description in two languages, price/discount, lesson count, duration, active flag; cart and subscription relations | `prisma/seed.ts`, checkout/cart/admin package routes | `/api/packages*`, `/api/cart`, `/api/checkout`, `/api/admin/packages*`, subscription routes | Critical | ADAPT | It already represents the commercial offer. Add target subscription type/capacity metadata without hardcoding prices elsewhere. |
| `Subscription` | `Subscription` and `Enrollment` | Student/package IDs, payment fields, status enum, teacher assignment, date range, lesson quotas, preferred days | Checkout, student/admin subscription routes, teacher/student scheduling routes | `/api/subscriptions`, `/api/student/subscriptions*`, `/api/admin/subscriptions*`, `/api/checkout` | Critical | ADAPT | Payment and quota history must not be rewritten. `Enrollment` will represent placement into a group or service separately from payment ownership. |
| `Cart` | Cart | Unique student owner, cart items, timestamps | Cart and checkout routes | `/api/cart`, `/api/checkout` | Medium | KEEP | Active checkout state is already isolated and does not need to become an enrollment. |
| `CartItem` | Cart line | Cart/package IDs, unique cart/package pair | Cart and checkout routes | `/api/cart`, `/api/checkout` | Medium | KEEP | Preserve current checkout behavior; package relation remains valid. |
| `Coupon` | Coupon | Unique code, discount string, expiry, active flag, package convention, use count | Coupon banner/admin coupon routes | `/api/coupons/active`, `/api/admin/coupons`, checkout | Medium | ADAPT | Coupon data is commercial history. Keep the package convention until a package-coupon relation is mapped from production data. |

### Classes, groups, and realtime

| Current model | Target model | Fields and relations inspected | Code references | API references | Risk | Action | Reason |
|---|---|---|---|---|---|---|---|
| `Session` | `Session` | Teacher ID, title, start/end, string status, room/link fields, assignments, `SessionStudent[]` | Teacher/student session routes, `lib/auth-helpers.ts` | `/api/sessions/*`, `/api/teacher/sessions*`, `/api/student/sessions/[id]`, `/api/live/*` | Critical | ADAPT | This is the current class record. Add target group, level/stage, state, participant, attendance, feedback, homework, and QMeet relations without renaming existing fields. |
| `SessionStudent` | `SessionParticipant` and `Attendance` | Session/student pair, attended flag, unique pair, cascade relations | Teacher/student stats, scheduling, attendance, assignment routes | `/api/sessions/student`, `/api/teacher/sessions/[id]/attendance`, student stats | Critical | MERGE | One legacy join table currently carries both membership and attendance. Split those meanings additively and preserve every existing row before any later consolidation. |
| `LiveSession` | `QMeetMeeting` | Session/teacher IDs, status, start/end; no Prisma relations | Live start/end routes | `/api/live/start`, `/api/live/end` | High | ADAPT | Existing records are live-class compatibility records, not confirmed QMeet IDs. Add provider metadata only after an import mapping exists. |
| `LiveParticipant` | `SessionParticipant` / `Attendance` | Live/user IDs, role, join/leave, raised hand; no relation to `LiveSession` or `User` | Schema only; no direct Prisma delegate usage found | Realtime server and live routes, not a complete Prisma API | High | ADAPT | Preserve realtime history and scalar IDs. Do not reinterpret `liveId` as a QMeet ID. |
| `TrialBooking` | Lead/trial booking | Name, phone, email, levels, plan, price, status, notes | Admin leads and booking routes | `/api/book-trial`, `/api/admin/leads` | Medium | DEPRECATE | It is operational lead data, not an enrollment or class. Keep it until operations confirms retention and replacement ownership. |

### Learning and resources

| Current model | Target model | Fields and relations inspected | Code references | API references | Risk | Action | Reason |
|---|---|---|---|---|---|---|---|
| `Lesson` | `Resource` | Bilingual content, order/level/category, video/article fields, publish flag; owns exercises and lesson progress | Admin and student lesson routes | `/api/lessons*`, `/api/admin/lessons*`, certificate auto route | High | ADAPT | It is a meaningful learning resource. Preserve content and IDs while introducing target resource classification and level/stage relations. |
| `Exercise` | `Resource` item | Lesson ID, type enum, JSON-like strings, answer/explanation/media, points; owns attempts | Admin exercise and student attempt routes | `/api/admin/lessons/[id]/exercises`, `/api/exercises/[id]/attempt` | High | ADAPT | Preserve learning content and attempts. Do not make the legacy exercise contract the only future resource type. |
| `LessonProgress` | `LearningProgress` | Student/lesson unique pair, completion/video/article/exercise score, timestamps | Student level/performance/certificate helpers | `/api/lessons/[id]/progress`, exercise attempt route, student metrics | Critical | ADAPT | This is durable learning history. Add a target progress projection rather than deleting or rewriting it. |
| `ExerciseAttempt` | `LearningProgress` activity | Student/exercise answer, correctness, points, timestamp | Student level and performance helpers | `/api/exercises/[id]/attempt` | High | ADAPT | Preserve scoring history and map it into target skills/resources later. |
| `ListeningContent` | `Resource` | Audio/video metadata, transcript, level/category, publish flag; owns exercises/progress | Schema model; no current Prisma delegate usage found | No active delegate API found | Medium | ADAPT | It is a learning resource whose current API surface is incomplete. Keep data and give it a target resource classification. |
| `ListeningExercise` | `Resource` item | Content ID, type, question, answer, explanation, timestamp; owns attempts | Schema model; no current Prisma delegate usage found | No active delegate API found | Medium | ADAPT | Preserve content for future listening resources. |
| `ListeningProgress` | `LearningProgress` | Content ID, optional visitor ID, completion/duration/score | Schema model; no current Prisma delegate usage found | No active delegate API found | Medium | ADAPT | Visitor and student progress have different ownership semantics; do not merge until that distinction is mapped. |
| `ListeningExerciseAttempt` | `LearningProgress` activity | Exercise ID, optional visitor ID, answer, correctness, points | Schema model; no current Prisma delegate usage found | No active delegate API found | Medium | ADAPT | Retain anonymous history and define ownership policy later. |
| `ConversationScenario` | `Resource` / speaking resource | Bilingual scenario, category, level, JSON dialogue, publish/order; owns progress | Conversation scenario route | `/api/conversation/scenarios` | Medium | ADAPT | Reuse scenario content as speaking resources without forcing the legacy JSON contract onto all resources. |
| `ConversationProgress` | `LearningProgress` | Student/scenario unique pair, current step, score, completion | Conversation routes | `/api/conversation/progress`, `/api/conversation/scenarios` | High | ADAPT | Preserve student practice history and map it to skills/resources later. |
| `VoiceRecording` | HomeworkSubmission / speaking submission | Student, base64 audio, duration, prompt/category, timestamps | Conversation voice route | `/api/conversation/voice-recordings` | Critical | ADAPT | Keep history, but future storage must use durable object references instead of storing base64 audio in MongoDB. |
| `TextConversation` | `Resource` / speaking resource | Bilingual prompts, level, JSON questions, publish/order; owns attempts | Text conversation route | `/api/conversation/text-conversations` | Medium | ADAPT | Preserve existing practice content and expose it through the target resource boundary later. |
| `TextConversationAttempt` | `LearningProgress` activity | Student/conversation answers, score, question count, completion | Text conversation route | `/api/conversation/text-conversations` | High | ADAPT | Preserve practice history and avoid a second student-progress source of truth. |
| `Word` | `Resource` / learning vocabulary | Student-owned vocabulary, review counters, scheduling, level/category | Vocabulary/words routes and `lib/student-level-system.ts` | `/api/words*`, `/api/vocabulary/*`, student stats/performance | High | ADAPT | Student vocabulary is learning history. Preserve spaced-review fields while mapping vocabulary into resources and progress. |
| `DailyWord` | `Resource` | Global word content, level/category, date/order | Daily vocabulary route | `/api/vocabulary/daily` | Medium | ADAPT | Treat as published learning content, not as a second student identity or progress model. |

### Homework, feedback, and writing

| Current model | Target model | Fields and relations inspected | Code references | API references | Risk | Action | Reason |
|---|---|---|---|---|---|---|---|
| `Assignment` | `Homework` | Scalar session/teacher/student IDs, title/description/type, attachment and due date; relation to submissions | Teacher assignment routes, auth ownership helper, student stats | `/api/teacher/assignments*`, `/api/assignments/student`, student stats | High | ADAPT | It is the closest current homework model. Add target ownership and item/submission relations without breaking scalar IDs. |
| `Submission` | `HomeworkSubmission` / `HomeworkReview` | Assignment/student IDs, text/options/files, grade, feedback, grammar errors, timestamps | Teacher grading and student assignment routes | `/api/assignments/student`, `/api/teacher/assignments/[id]/grade` | Critical | MERGE | Submission and review are currently one record. Preserve grades and feedback, then split authored submission from teacher review additively. |
| `FreeWriting` | Homework/feedback | Student/teacher IDs, content, grade, feedback, grammar errors | Teacher/student writing and performance routes | `/api/student/free-writing`, `/api/teacher/free-writing*` | High | MERGE | It overlaps homework, writing practice, and feedback. Keep until ownership and historical records are mapped. |
| `WritingTest` | Legacy assessment / homework | Teacher-owned title/instructions/due date; owns writing submissions | Teacher/student writing-test routes | `/api/teacher/writing-tests*`, `/api/student/writing-tests*` | High | DEPRECATE | The target product is not exam-centered. Keep current assessment data while preventing new target dependencies. |
| `WritingTestSubmission` | Legacy submission history | Test/student content, manuscript, grade, feedback, grammar errors, timestamps | Teacher manuscripts/grading and student writing routes | `/api/student/writings/my-submissions`, `/api/student/writing-tests*`, `/api/teacher/writing-tests*` | Critical | REMOVE_LATER | Preserve all graded work and feedback before any later export or consolidation. |

### Communication and community

| Current model | Target model | Fields and relations inspected | Code references | API references | Risk | Action | Reason |
|---|---|---|---|---|---|---|---|
| `Chat` | SpeakingRoomMessage / communication message | From/to user IDs, content, attachments, saved flag, timestamp; user relations | Chat routes and chat components | `/api/chat/*` | High | ADAPT | Existing direct chat is not the target speaking-room model. Preserve messages and map them into a future communication boundary only after retention and moderation rules are defined. |
| No current model | `SpeakingRoom`, `SpeakingRoomMember`, `SpeakingRoomMessage` | New room, membership/moderation, topic/prompt, text/voice reference, reports and message state | None | None | Medium | ADD | Phase 2 establishes storage contracts only. No realtime room UI or full Socket.IO workflow is added. |
| No current model | `Notification` | New recipient, event/type, channel, payload reference, delivery state, timestamps, idempotency key | `lib/notifications/index.ts` has transport contracts only | None | Medium | ADD | Durable notification records and retries are required by the target architecture but were absent from the current schema. |
| No current model | WhatsAppAccount/Contact/Conversation/Message/Queue | New provider account, CRM contact, conversation, direction/content/provider status, queue scheduling/idempotency | `lib/whatsapp/index.ts` provider and queue boundary only | None | High | ADD | Add data contracts without enabling Baileys, OTP delivery, or CRM UI. |

### Legacy assessment and gamification

| Current model | Target model | Fields and relations inspected | Code references | API references | Risk | Action | Reason |
|---|---|---|---|---|---|---|---|
| `Test` | Legacy assessment | Generic test metadata, questions, attempts | Admin tests route | `/api/admin/tests` | High | DEPRECATE | Generic exams are outside the target product. Keep records and API compatibility until migration/export is approved. |
| `TestQuestion` | Legacy assessment item | Question/options/answer/explanation, level/category/order; optional test relation | Admin seed/stats and schema | `/api/admin/seed`, `/api/admin/stats` | High | DEPRECATE | Preserve question history and avoid new target dependencies. |
| `TestAttempt` | Legacy assessment history | Test/student score/status/timestamps | Schema relation; no direct delegate usage found | No active direct delegate route found | Critical | REMOVE_LATER | Attempts are historical evidence and cannot be dropped before retention/export decisions. |
| `PlacementQuestion` | Legacy placement content | Question, answer/options/media, level/type/category/order | Placement admin and student submit routes | `/api/placement-test`, `/api/student/placement-test/submit`, admin placement questions | High | REMOVE_LATER | The target official level is staff-controlled. Preserve this question bank until the replacement level workflow is approved. |
| `TestSettings` | Legacy assessment settings | Unique test type, count, time, pass score, shuffle | Schema and admin contract | `/api/admin/test-settings` | Medium | REMOVE_LATER | Keep settings for old routes but do not use them as the target level authority. |
| `PlacementTestAttempt` | Legacy placement history | Student/test type, score/percentage/result/details, timestamps | AI and placement submit/admin attempts routes | `/api/ai/placement-test`, `/api/student/placement-test/submit`, `/api/admin/placement-tests` | Critical | REMOVE_LATER | Placement evidence must remain available while official level authority moves to staff-controlled records. |
| `UserGamification` | Legacy progress history | XP, points, streaks, counters; owns badges/activity | `lib/gamification.ts` | `/api/gamification/*`, student dashboards | High | DEPRECATE | Do not create new target dependencies on XP or leaderboard behavior; retain history for a later decision. |
| `Badge` | Legacy achievement definition | Localized labels, requirement JSON, rewards, rarity; owns user badges | `lib/gamification.ts`, badge route | `/api/gamification/badges` | Medium | REMOVE_LATER | Preserve definitions until user history is exported or intentionally retired. |
| `UserBadge` | Legacy achievement history | Gamification/badge pair, earned time | `lib/gamification.ts` | Gamification APIs | High | REMOVE_LATER | User history must be retained during deprecation. |
| `DailyActivity` | Legacy activity history | Gamification/date unique pair, XP/points/activity counters | `lib/gamification.ts` | Gamification stats routes | High | REMOVE_LATER | Streak history is not part of the new core model but cannot be deleted in Phase 2. |

## 3. Target models with no current equivalent

The following models are additive contracts for Phase 2. They must not be
implemented as duplicate sources of truth when an existing model already owns
the same data:

| Domain | Target models | Initial source/ownership decision |
|---|---|---|
| Identity | `StaffPermission` | Relates to `User`; centralizes admin/manager/staff permissions. |
| Learning | `Level`, `LevelStage`, `Skill`, `Resource`, `LearningProgress`, `StudentLearningProfile` | New target records reference legacy content/history by ID until an explicit backfill is approved. |
| Commercial | `Enrollment` | Separates service/group placement from payment `Subscription`. |
| Groups | `LearningGroup`, `GroupMember`, `GroupSchedule` | New group architecture; do not reinterpret `SessionStudent` until row-level mapping exists. |
| Classes | `SessionParticipant`, `Attendance`, `QMeetMeeting` | Additive relations around current sessions and live records; no QMeet import is assumed. |
| Feedback | `SessionFeedback`, `FeedbackExpression`, `FeedbackMistake`, `FeedbackPronunciation`, `FeedbackEBI` | New teacher feedback records; legacy grades and free-writing feedback remain untouched. |
| Homework | `Homework`, `HomeworkItem`, `HomeworkSubmission`, `HomeworkReview` | New workflow contracts; current assignments/submissions remain compatibility data. |
| Community | `SpeakingRoom`, `SpeakingRoomMember`, `SpeakingRoomMessage` | Data-only foundation; no full realtime room implementation. |
| Communication | `Notification`, `WhatsAppAccount`, `WhatsAppContact`, `WhatsAppConversation`, `WhatsAppMessage`, `WhatsAppQueue` | Data-only foundation; no Baileys connection or complete OTP flow. |
| Intelligence | `AIRecommendation`, `AIInteraction` | Store explainable recommendations/interactions; no complete AI engine. |

## 4. Relationship and ownership findings

1. `User` is already the only practical identity root. Creating separate
   student/teacher authentication would split ownership and is prohibited.
2. `StudentProfile` contains legacy placement state. It must not be silently
   replaced by an AI or teacher recommendation.
3. `SessionStudent.attended` combines membership and attendance. New models
   must keep those concepts separate while preserving the old rows.
4. `Assignment` and `Submission` use scalar teacher/student IDs in important
   places. New relations must not assume that every historical scalar is
   valid.
5. `LiveSession` and `LiveParticipant` use scalar IDs without Prisma relations.
   They cannot be treated as QMeet records without an import mapping.
6. Several learning systems store JSON as strings. New contracts may use
   structured JSON only where Prisma MongoDB support and compatibility are
   verified; old strings remain unchanged.
7. There are no explicit indexes in the current schema. Target indexes should
   be additive and reviewed against real query patterns before being applied
   to production.

## 5. Phase 2 boundary

In scope:

- Additive target-domain data contracts after this mapping.
- Documentation of relationships, indexes, uniqueness, MongoDB limitations,
  legacy coexistence, and migration order.
- Validation and tests for the new contracts.

Out of scope:

- Deleting or renaming existing models or fields.
- `prisma db push`, reset, collection deletion, or production data migration.
- Complete WhatsApp OTP/Baileys integration.
- Complete QMeet integration.
- Complete realtime speaking rooms.
- New dashboards, login UI, or frontend rebuild.
- Phase 3 authentication and RBAC implementation.