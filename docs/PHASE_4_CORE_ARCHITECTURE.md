# Phase 4 Core Architecture

## Scope

Phase 4 establishes the first product foundation around people, profiles,
levels, stages, staff permissions, and role-specific navigation. It does not
implement subscriptions, groups, classes, homework, feedback, AI
recommendations, QMeet, CRM, or the final visual redesign.

## Data model

Phase 2 models are reused:

- `User` is the single identity and status source.
- `StudentProfile` stores student-specific profile data and official/recommended
  level references.
- `TeacherProfile` stores teacher bio and specialties.
- `StaffPermission` stores explicit staff capabilities.
- `Level` and `LevelStage` represent the official learning structure.
- `StudentLearningProfile` stores goals and learning-profile JSON fields.

Phase 4 adds `StudentLevelRecommendation` to preserve teacher, student, level,
stage, reason, and creation time without overwriting the official level.
The schema change is additive and MongoDB-only.

## Request flow

Every new API follows:

`route → validation → authenticated session → permission → business rule → Prisma → response`

Server identity comes from the current session and is re-resolved from
MongoDB by the centralized Phase 3 helpers. Client user IDs and roles are not
trusted.

## Product surfaces

- Admin/Manager: `/dashboard/admin/people`, `/dashboard/admin/levels`
- Teacher: `/dashboard/teacher/students`
- Student: `/dashboard/student/profile`
- Health: `/api/health`

The existing dashboards and legacy learning routes remain available but are
not replaced by this foundation.

## Health behavior

`GET /api/health` returns application readiness and one of:

- `database: healthy`, HTTP 200 when a safe MongoDB ping succeeds
- `database: not_configured`, HTTP 503 when `MONGODB_URI` is missing
- `database: unavailable`, HTTP 503 when the ping fails

No connection string, stack trace, or credential is returned.