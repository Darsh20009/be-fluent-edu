# Phase 6: Classes, Sessions, and QMeet

Phase 6 adds an additive class-session foundation on the existing MongoDB Prisma models.

## Lifecycle

`DRAFT → SCHEDULED → READY → LIVE → ENDED → FEEDBACK_PENDING → COMPLETED`

Only the next documented transition is accepted. Sessions that are live or later cannot be rescheduled.

## Participants and attendance

Session participants are distinct from legacy `SessionStudent` records. A student must be an active member of the session group and cannot be added twice. Participant states are `SCHEDULED`, `JOINED`, `LEFT`, `CANCELLED`, and `ABSENT`.

Attendance states are `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED`. Only assigned teachers and authorized operations roles may mark attendance. Students may not mark themselves present.

## Join rules

`canStudentJoinSession` requires an authenticated, active, non-suspended student; active enrollment in the session group; an eligible participant state; a `READY` or `LIVE` session; and a time between 15 minutes before the start and the end.

## Database safety

Phase 6 uses the existing `PHASE5_DATABASE_ENABLED` safety mechanism. It remains disabled. Routes return HTTP 503 with `DATABASE_UNAVAILABLE` before authentication, Prisma, or provider execution.