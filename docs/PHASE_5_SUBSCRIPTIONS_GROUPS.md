# Phase 5: Subscriptions, Packages, Enrollments, and Groups

Phase 5 adds the commercial and grouping domain without replacing the existing Prisma and MongoDB architecture.

## Domain

- Packages define type, optional level/stage eligibility, capacity, duration, lesson count, features, price configuration, and active state.
- Subscriptions belong to a student and package, track an explicit lifecycle, and can reference an assigned teacher and group.
- Enrollments connect a student to an approved subscription and optionally to a compatible group.
- Learning groups define level, stage, type, capacity, teacher, status, members, and schedules.
- Matching is server-side and filters by type, level, stage, capacity, teacher assignment, and schedule compatibility.
- Admin override is explicit, requires a reason, respects hard capacity, and produces an audit event.

## Database blocker

MongoDB command execution is currently unreliable. Every Phase 5 route checks `PHASE5_DATABASE_ENABLED` before authentication or Prisma access. The default is blocked and returns HTTP 503 with `DATABASE_UNAVAILABLE`. The flag must only be enabled after provider-side connectivity and normal database commands are independently verified.

No migration, `prisma db push`, seed, database write, or live application-data read was required to build or test this phase.