# Phase 7: Feedback and Homework

Phase 7 adds structured teacher feedback, reusable learning libraries, homework assignments, submissions, reviews, and notification outbox records without replacing legacy assignment routes.

## Feedback

Lifecycle: `DRAFT → READY_TO_PUBLISH → PUBLISHED`.

Draft feedback contains structured expressions, mistakes, pronunciation guidance, EBI items, a summary, and teacher notes. Publishing is restricted to `ENDED`, `FEEDBACK_PENDING`, or `COMPLETED` sessions and requires educational content. Published feedback is immutable for teachers unless an explicit override is recorded; administrative changes remain audited.

Students only receive published feedback for their own eligible session participation.

## Homework

Lifecycle: `DRAFT → PUBLISHED → OPEN → SUBMITTED → REVIEWED → COMPLETED`.

Group and session homework remains open independently of any one student's submission; submissions and reviews carry the per-student state. Supported content types are `TEXT`, `VOICE`, `VIDEO`, `FILE`, `LINK`, `VOCABULARY`, `SPEAKING`, and `PRACTICE`.

## Database safety

Phase 7 reuses the existing `PHASE5_DATABASE_ENABLED` gate. While disabled, all database routes return HTTP 503 with `DATABASE_UNAVAILABLE` before authentication or Prisma execution.