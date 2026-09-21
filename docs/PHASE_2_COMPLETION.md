# B Fluent EDU — Phase 2 Completion

**Status:** Complete — additive domain and database foundation  
**Scope:** Model mapping, MongoDB schema contracts, migration planning, and
validation only  
**Database safety:** No production connection, database write, migration,
collection deletion, reset, or `prisma db push` was performed.

## 1. Models inspected

All current models in `prisma/schema.prisma` were inspected, including:

- Identity/system: `User`, `StudentProfile`, `TeacherProfile`, `AuditLog`,
  `Certificate`, `SiteSettings`, `PageContent`
- Commercial: `Package`, `Subscription`, `Cart`, `CartItem`, `Coupon`,
  `TrialBooking`
- Classes/live: `Session`, `SessionStudent`, `LiveSession`,
  `LiveParticipant`
- Homework/writing: `Assignment`, `Submission`, `FreeWriting`, `WritingTest`,
  `WritingTestSubmission`
- Learning: `Word`, `DailyWord`, `Lesson`, `Exercise`, `LessonProgress`,
  `ExerciseAttempt`, `ListeningContent`, `ListeningExercise`,
  `ListeningProgress`, `ListeningExerciseAttempt`, `ConversationScenario`,
  `ConversationProgress`, `VoiceRecording`, `TextConversation`,
  `TextConversationAttempt`
- Legacy assessment: `Test`, `TestQuestion`, `TestAttempt`,
  `PlacementQuestion`, `TestSettings`, `PlacementTestAttempt`
- Legacy gamification: `UserGamification`, `Badge`, `UserBadge`,
  `DailyActivity`

Current Prisma delegate references were mapped across the route handlers,
helpers, dashboard code, and seed code.

## 2. Models kept

- `User`
- `StudentProfile`
- `TeacherProfile`
- `AuditLog`
- `Certificate`
- `Package`
- `Subscription`
- `Cart`
- `CartItem`
- `Session`
- all current learning content and progress models

These remain compatibility sources because active APIs, history, or ownership
relations still depend on them.

## 3. Models adapted

- `User`: additive normalized-phone, status, verification/activity, and target
  relation fields.
- `StudentProfile`: additive official/recommended level and stage references.
- `TeacherProfile`: additive group, schedule, and enrollment relations.
- `AuditLog`: additive entity, metadata, and success fields.
- `Package`, `Subscription`, and `Coupon`: additive target commercial links.
- `Session`: additive level, stage, group, participant, attendance, feedback,
  homework, and QMeet relations.
- `LiveSession`/`LiveParticipant`: kept as compatibility records; no QMeet
  reinterpretation.
- learning, vocabulary, conversation, and voice models: mapped to target
  resource/progress/submission boundaries without data copying.

## 4. Models merged conceptually

No existing collections were physically merged. The following were mapped for
future source-aware projections:

- `SessionStudent` → `SessionParticipant` plus `Attendance`
- `Assignment`/`Submission` → `Homework`/`HomeworkSubmission` plus
  `HomeworkReview`
- `FreeWriting` and writing feedback → target homework/feedback records
- lesson, listening, conversation, and vocabulary content → `Resource`
- existing progress/attempt histories → `LearningProgress`

## 5. Models deprecated

These remain intact but receive no new target-domain dependency:

- `Test`, `TestQuestion`
- `WritingTest`
- `UserGamification`

## 6. Models marked for later removal

Removal is not authorized in Phase 2. These require retention/export and
dependency approval first:

- `TestAttempt`
- `PlacementQuestion`
- `TestSettings`
- `PlacementTestAttempt`
- `WritingTestSubmission`
- `Badge`, `UserBadge`, `DailyActivity`

## 7. Additive schema changes

Added target contracts for:

- Identity: `StaffPermission`
- Learning: `Level`, `LevelStage`, `Skill`, `Resource`,
  `LearningProgress`, `StudentLearningProfile`
- Commercial/groups: `Enrollment`, `LearningGroup`, `GroupMember`,
  `GroupSchedule`, `SubscriptionType`
- Classes: `SessionParticipant`, `Attendance`, `QMeetMeeting`
- Feedback: `SessionFeedback`, `FeedbackExpression`, `FeedbackMistake`,
  `FeedbackPronunciation`, `FeedbackEBI`
- Homework: `Homework`, `HomeworkItem`, `HomeworkSubmission`,
  `HomeworkReview`
- Community: `SpeakingRoom`, `SpeakingRoomMember`, `SpeakingRoomMessage`
- Communication: `Notification`, `WhatsAppAccount`, `WhatsAppContact`,
  `WhatsAppConversation`, `WhatsAppMessage`, `WhatsAppQueue`
- Intelligence: `AIRecommendation`, `AIInteraction`

Additive indexes and stable uniqueness constraints were added for ownership,
status, level/stage, progress, session participation, feedback, homework,
notification, WhatsApp queue, and AI access paths.

## 8. Database operations performed

None.

- No `MONGODB_URI` production value was accessed.
- No `prisma db push` was run.
- No collection was created, dropped, renamed, or modified.
- No seed, backfill, reset, or data migration was run.
- Prisma Client was generated locally from the schema.

## 9. Data migration performed

None. The migration sequence, conflict handling, snapshot gate, and rollback
strategy are documented in `docs/PHASE_2_MIGRATION_PLAN.md`.

## 10. Data safety verification

- MongoDB remains the only Prisma datasource.
- Existing models and legacy fields remain present.
- New relations are additive and optional where they bridge old data.
- Optional phone/provider identifiers are indexed but not made unique before
  duplicate reconciliation.
- Legacy scalar IDs are not falsely converted into verified provider relations.
- No destructive Prisma operation was accepted or bypassed.

## 11. Tests

- `npm run test:foundation` — passed, 5 tests.
- `npm run test:phase2` — passed, 6 schema contract tests.
- `npx eslint tests/phase2-schema.test.ts` — passed.

The Phase 2 tests cover MongoDB datasource preservation, legacy model
preservation, identity permissions, level/stage separation, subscription
types, groups, sessions, QMeet, feedback, and homework relationships.

## 12. TypeScript

- `npx tsc --noEmit` — passed.

## 13. Prisma and build

- `npx prisma validate --schema prisma/schema.prisma` with a non-credentialed
  validation environment — passed.
- `npx prisma generate --schema prisma/schema.prisma` with a non-credentialed
  validation environment — passed.
- `npm run build` — passed.

No database URI was committed or used to connect to a database.

## 14. Known issues

- The running development workflow does not currently have `MONGODB_URI`, so
  database-backed routes cannot be exercised against real data.
- Existing Next.js middleware deprecation warnings remain.
- Full repository lint has pre-existing failures documented in Phase 1; the
  changed Phase 2 test file passes targeted lint.
- Existing authentication, password recovery, and route authorization gaps
  remain outside Phase 2.
- Target models are contracts only; no target API or UI was built.

## 15. Migration risks

- Existing phone values may be missing, duplicated, or differently formatted.
- Legacy level strings, placement attempts, and AI recommendations can disagree.
- `SessionStudent.attended` does not provide enough information to infer every
  future attendance state.
- Existing scalar teacher/student/live IDs may be orphaned or semantically
  different from target relations.
- Existing JSON strings and base64 audio require explicit conversion and
  storage policies.
- Applying indexes or schema changes to production still requires a snapshot
  and reviewed Prisma/MongoDB diff.

## 16. Recommended Phase 3 scope

Phase 3 should be planned separately and should focus on authentication and
RBAC implementation:

1. reconcile identity status and normalized-phone policy;
2. close inactive-account and password-recovery authorization gaps;
3. introduce the approved OTP persistence/delivery boundary;
4. migrate API authorization route by route;
5. refresh stale session role/status claims safely;
6. verify student, teacher, manager, staff, and admin permissions against the
   new `StaffPermission` contract.

Phase 3 was not started automatically.