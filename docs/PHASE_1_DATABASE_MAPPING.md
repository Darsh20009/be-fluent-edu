# Phase 1 Database Mapping

## Database freeze

`prisma/schema.prisma` is MongoDB-backed through `MONGODB_URI`. No schema
change, `db push`, migration, collection drop, or data migration was performed
in Phase 1. The target domain names below are a mapping contract, not a reason
to create duplicate models blindly.

## Identity and system

| Existing model | Target model | Action | Data migration risk | Dependencies |
|---|---|---|---|---|
| User | User | KEEP / ADAPT | High: all domains reference user IDs | Auth, every dashboard |
| StudentProfile | StudentProfile | KEEP / ADAPT | High: placement fields are legacy but contain history | User, subscriptions |
| TeacherProfile | TeacherProfile | KEEP / ADAPT | High: sessions and grading reference profile IDs | User, sessions |
| AuditLog | AuditLog | KEEP / ADAPT | Medium: details are free-form strings | Admin and security events |
| SiteSettings | System settings | ADAPT | Medium: public content and support configuration are mixed | Marketing, admin |
| PageContent | Content configuration | ADAPT | Medium: unique page/section/field keys | Marketing and admin |

## Commercial and groups

| Existing model | Target model | Action | Data migration risk | Dependencies |
|---|---|---|---|---|
| Package | Package | KEEP / ADAPT | High: subscriptions and cart items reference it | Commerce |
| Subscription | Subscription | KEEP / ADAPT | Critical: payment and quota history | User, Package, teacher |
| Cart | Cart | KEEP | Medium: active checkout state | User |
| CartItem | Cart line | KEEP / ADAPT | Medium: package references | Cart, Package |
| Coupon | Coupon | KEEP / ADAPT | Medium: usage history and package convention | Checkout |
| SessionStudent | GroupMember / SessionParticipant | MERGE LATER | Critical: attendance/enrollment history | Session, User |
| TrialBooking | Lead / trial booking | DEPRECATE | Medium: may be operational lead data | Admin and contact flows |

There is no existing `LearningGroup`, `GroupSchedule`, or group-member model
with the target semantics. Design these additively after production data and
staff workflows are confirmed.

## Classes, attendance, and live

| Existing model | Target model | Action | Data migration risk | Dependencies |
|---|---|---|---|---|
| Session | Session | KEEP / ADAPT | Critical: teacher, schedule, assignments | Teacher, students |
| LiveSession | QMeetMeeting / live class record | ADAPT | High: identifiers are scalar and not fully related | Session, realtime |
| LiveParticipant | Attendance / participant record | ADAPT | High: `liveId` has no Prisma relation | LiveSession, User |
| SessionStudent | SessionParticipant / Attendance | ADAPT | Critical: existing attended values must be preserved | Session, User |

QMeet is currently represented by generic external links and live records.
Do not reinterpret those values as QMeet IDs until an import mapping exists.

## Learning, homework, and feedback

| Existing model | Target model | Action | Data migration risk | Dependencies |
|---|---|---|---|---|
| Assignment | Homework | ADAPT | High: assignment ownership is partly scalar | Session, User |
| Submission | HomeworkSubmission / HomeworkReview | ADAPT | Critical: grades and feedback are learning history | Assignment, User |
| FreeWriting | Feedback / submission | MERGE LATER | High: overlaps with writing and feedback | User, teacher |
| WritingTest | Homework or legacy assessment | DEPRECATE | High: teacher and student submissions reference it | Teacher |
| WritingTestSubmission | Submission history | DEPRECATE | Critical: preserve feedback and grades | User, WritingTest |
| Lesson | Resource / Learning unit | ADAPT | High: published content is reusable | Exercise, progress |
| Exercise | Learning resource item | ADAPT | High: attempts reference it | Lesson |
| LessonProgress | LearningProgress | ADAPT | Critical: progress history | User, Lesson |
| ExerciseAttempt | Learning activity history | KEEP / ADAPT | High: scoring history | User, Exercise |
| ListeningContent | Resource | ADAPT | Medium: content and progress are separate | Listening exercises |
| ListeningExercise | Resource item | ADAPT | Medium: attempts reference content | Listening content |
| ListeningProgress | LearningProgress | ADAPT | Medium: visitor and student semantics differ | Listening content |
| ListeningExerciseAttempt | Learning activity history | KEEP / ADAPT | Medium: visitor records need policy | Listening exercise |
| ConversationScenario | Speaking resource | ADAPT | Medium: JSON dialogue contract needs validation | Conversation progress |
| ConversationProgress | LearningProgress | ADAPT | High: student history | User, scenario |
| VoiceRecording | Speaking submission | ADAPT | Critical: base64 storage is not production-safe | User, storage |
| TextConversation | Speaking resource | ADAPT | Medium: JSON question contract | Attempts |
| TextConversationAttempt | Speaking practice history | ADAPT | High: student history | User, conversation |

## Tests, placement, and gamification

| Existing model | Target model | Action | Data migration risk | Dependencies |
|---|---|---|---|---|
| Test | Legacy assessment | DEPRECATE | High: questions and attempts reference it | Admin and student APIs |
| TestQuestion | Legacy assessment item | DEPRECATE | High: question history | Test |
| TestAttempt | Legacy assessment history | REMOVE LATER | Critical: preserve records before removal | User, Test |
| PlacementQuestion | Placement history | REMOVE LATER | High: admin content and attempts | Placement flows |
| TestSettings | Legacy assessment settings | REMOVE LATER | Medium: admin configuration | Placement/test APIs |
| PlacementTestAttempt | Placement history | REMOVE LATER | Critical: level evidence | User, StudentProfile |
| UserGamification | Progress history | DEPRECATE | High: XP and streak history | User, badges |
| Badge | Legacy achievement definition | REMOVE LATER | Medium: user badges reference it | Gamification |
| UserBadge | Legacy achievement history | REMOVE LATER | High: user history | UserGamification, Badge |
| DailyActivity | Legacy activity history | REMOVE LATER | High: streak history | UserGamification |

Placement and exam systems are not part of the target user experience, but
their data remains protected until a retention and export decision is approved.

## Target models with no current equivalent

The following require new, additive contracts after review: `Level`,
`LevelStage`, `Skill`, `Resource`, `StudentLearningProfile`, `Enrollment`,
`LearningGroup`, `GroupMember`, `GroupSchedule`, `SessionParticipant`,
`Attendance`, `QMeetMeeting`, `SessionFeedback`, feedback detail models,
`Homework`, `HomeworkItem`, `HomeworkReview`, speaking room models,
`Notification`, WhatsApp models, `AIRecommendation`, and `AIInteraction`.

No target model was added in Phase 1 because doing so without field-level
mapping and production data checks could create duplicate sources of truth.
