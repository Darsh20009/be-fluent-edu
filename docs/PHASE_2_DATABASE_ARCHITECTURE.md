# B Fluent EDU — Phase 2 Database Architecture

**Status:** Additive foundation defined  
**Database:** MongoDB only  
**Schema source:** `prisma/schema.prisma`  
**Migration status:** No database operation was performed

## 1. Architecture principles

1. MongoDB is the only application database. The Prisma datasource remains
   `provider = "mongodb"` and reads `MONGODB_URI`.
2. Existing collections and fields are compatibility data. Phase 2 does not
   rename, delete, reset, or reinterpret them.
3. `User` is the single identity root. Student and teacher data remains in
   profiles; staff permissions are separate records linked to the same user.
4. Official level is distinct from teacher/AI recommendations and from the
   learning stage. No additive model grants teachers or AI authority to change
   the official level silently.
5. Payment ownership (`Subscription`) is distinct from service placement
   (`Enrollment`) and group membership (`GroupMember`).
6. A formal class (`Session`) is distinct from its participants, attendance,
   feedback, homework, and optional QMeet record.
7. WhatsApp, notifications, AI, speaking rooms, and feedback have data
   contracts only in this phase. Their complete transports, UIs, and realtime
   workflows remain out of scope.

## 2. Domain boundaries and major entities

### Identity

- `User` remains the authentication and ownership root.
- `StudentProfile` and `TeacherProfile` remain one-to-one compatibility
  profiles.
- `StaffPermission` stores permission grants without creating another login
  system.
- `StudentLearningProfile` stores the target learning-intelligence projection
  and keeps official/recommended level references separate.

The existing `email` requirement, `phone`, `isActive`, and password fields are
kept for compatibility. `normalizedPhone`, `status`, verification time, and
activity time are additive. A later data review must decide how existing
records are backfilled before making phone uniqueness authoritative.

### Learning

- `Level` contains official level definitions such as A1 through C2.
- `LevelStage` supports C1.1-style stages and future stages for other levels.
- `Skill` is a reusable learning capability definition.
- `Resource` is the target content boundary. `legacyModel` and `legacyId`
  provide a non-destructive bridge to lessons, listening content,
  conversations, and vocabulary.
- `LearningProgress` is the target progress projection. Existing lesson,
  exercise, listening, and conversation history remains in its original model.

No legacy learning record is copied automatically. A future backfill must be
idempotent and record its source model and source ID.

### Commercial and groups

- `Package` remains the pricing and offer source.
- `Subscription` remains payment and quota history.
- `Enrollment` represents a student’s service/group placement and can point to
  a subscription, package, group, and teacher profile.
- `LearningGroup`, `GroupMember`, and `GroupSchedule` provide the target group
  architecture. Automatic matching is not implemented.

The new group models do not treat `SessionStudent` rows as group membership.
That table currently combines attendance and enrollment semantics and requires
row-level mapping before any migration.

### Classes

- `Session` remains the compatibility class record and gains optional level,
  stage, group, participant, attendance, feedback, homework, and QMeet
  relations.
- `SessionParticipant` is the target membership/participation record.
- `Attendance` is the target attendance record.
- `QMeetMeeting` stores a provider boundary around a session. Existing
  `externalLink` and `LiveSession` values are not assumed to be QMeet IDs.

The target states (`DRAFT`, `SCHEDULED`, `READY`, `LIVE`, `ENDED`,
`FEEDBACK_PENDING`, `COMPLETED`) are represented as application string
contracts in Phase 2 to avoid forcing existing status data through a new enum.

### Feedback and homework

- `SessionFeedback` is the parent feedback record for one student in one
  session.
- `FeedbackExpression`, `FeedbackMistake`, `FeedbackPronunciation`, and
  `FeedbackEBI` are separate, editable detail records.
- `Homework`, `HomeworkItem`, `HomeworkSubmission`, and `HomeworkReview`
  separate teacher-authored work, student submissions, and teacher review.

Legacy `Assignment`, `Submission`, `FreeWriting`, and writing-test records are
not converted automatically. Their existing grades and feedback remain
available for a later migration.

### Community and communication

- `SpeakingRoom`, `SpeakingRoomMember`, and `SpeakingRoomMessage` are separate
  from formal QMeet classes.
- `Notification` stores channel/event records for in-app, WhatsApp, and email.
- `WhatsAppAccount`, `WhatsAppContact`, `WhatsAppConversation`,
  `WhatsAppMessage`, and `WhatsAppQueue` prepare CRM and delivery storage.

The queue model stores idempotency and retry metadata but does not start a
Baileys connection or send messages.

### Intelligence

- `AIRecommendation` stores a recommendation with optional level/stage target,
  lifecycle status, and expiry.
- `AIInteraction` stores an auditable input/output boundary and optional
  student reference. It is not an AI engine or an automatic level authority.

## 3. Relationship rules

### Identity ownership

All new user-owned records use a foreign key to `User.id`. Existing relations
are retained even where names use legacy capitalization or scalar IDs. New
relations use explicit relation names where a user participates in more than
one role.

### Level authority

- `StudentProfile.officialLevelId` and `officialStageId` are the future
  authoritative placement references.
- `recommendedLevelId` and `recommendedStageId` are non-authoritative.
- `StudentLearningProfile` mirrors both distinctions for learning intelligence.
- Existing `levelInitial`, `levelCurrent`, `targetLevel`, placement scores, and
  attempt results are not removed or silently rewritten.

### Legacy bridges

`Resource.legacyModel` and `Resource.legacyId` are intentionally scalar. They
allow a future migration tool to identify source records without forcing
unverified relations between heterogeneous legacy models.

`GroupMember.enrollmentId`, `SpeakingRoom.createdById`, `AIInteraction.studentId`,
and `LiveSession`/`LiveParticipant` identifiers remain scalar where a relation
would falsely claim that historical ownership is verified.

## 4. Indexes and uniqueness

The additive schema includes indexes for the expected access paths:

- user ownership, role/status, normalized phone
- active levels and ordered stages
- resource type/publication and legacy source lookup
- student progress/status/resource
- subscription/enrollment/group status
- group level/stage/teacher membership
- session participants and attendance
- QMeet provider/status
- feedback student/teacher/status
- homework assignment, submission, and review queues
- speaking-room members/messages
- notification delivery and idempotency lookup
- WhatsApp account/conversation/message/queue delivery paths
- AI recommendation and interaction history

Unique constraints are limited to stable natural relationships:

- existing user email and profile user IDs
- level code and level-stage `(levelId, code)`
- learning-profile user and student-profile IDs
- session participant `(sessionId, userId)`
- attendance `(sessionId, userId)`
- one QMeet record per session
- feedback `(sessionId, studentId)`
- speaking-room member `(roomId, userId)`

Optional phone and provider identifiers are indexed but not made unique in
Phase 2. Existing data has not been normalized or deduplicated, and MongoDB
unique-index behavior around missing optional fields must be verified against a
production snapshot before enforcing uniqueness.

## 5. MongoDB and Prisma considerations

- IDs remain UUID strings mapped to MongoDB `_id`; no ObjectId conversion is
  introduced.
- Prisma relation fields describe application ownership but do not repair
  orphaned scalar IDs in old collections.
- `onDelete: Cascade` is used only on new ownership edges and existing
  compatibility relations already using that behavior. No delete operation was
  run.
- Existing JSON-like strings remain strings. New `*Json` fields are explicit
  serialized payload boundaries until a validated structured-data contract is
  approved.
- Compound indexes and optional-field indexes must be reviewed with real
  MongoDB query plans before production application.
- `MONGODB_URI` is required to run Prisma commands. Local validation in this
  phase may use a non-connected placeholder URI; it must never be treated as
  production access.
- `prisma db push`, reset, collection drops, and destructive migrations are
  prohibited until a production snapshot and schema diff are reviewed.

## 6. Legacy coexistence strategy

Legacy placement, assessment, writing-test, vocabulary-test, gamification,
chat, live, and dashboard systems remain available. The target models are
additive and must not become an invisible second source of truth.

Until a migration is approved:

- old routes continue to read/write old models;
- new services must declare whether they read target data, legacy data, or a
  compatibility projection;
- no background backfill is assumed;
- every copied record must retain a source model and source ID;
- removal requires dependency inventory, retention/export approval, rollback
  plan, and production verification.