# Phase 9 — Learning Intelligence

## Status and scope

Phase 9 adds a deterministic learning-intelligence foundation: signal normalization, evidence-based recommendations, student profile and signal reads, daily learning-plan/session logic, teacher intelligence reads and suggestion drafts, and administrator reporting. The available behavior is described here as implemented, not as a claim that every Phase 9 specification item is complete.

The persistence boundary remains blocked by MongoDB availability. Phase 9 APIs are guarded by `PHASE5_DATABASE_ENABLED`; unless it is exactly `true`, they return HTTP 503 with `DATABASE_UNAVAILABLE` before database access. No successful MongoDB write, deployed persistence, or real database integration is claimed.

## Learning signals

A normalized signal records a student, type and source, an idempotency key, occurrence time, strength, optional skill/level/stage/topic references, optional source-entity references, optional expiry, and a constrained evidence record. Strength is bounded from 0 to 5. Signals reference source entities and retain selected evidence fields rather than copying entire source records.

Implemented normalization/persistence hooks:

| Source | Current behavior |
| --- | --- |
| Published feedback | Converts student-visible mistakes, pronunciation guidance, EBI improvement opportunities, and expressions categorized as VOCABULARY, IDIOM, SLANG, or CHUNK. Draft feedback is rejected. Private `teacherNotes` and internal metadata are not passed to the normalizer. |
| Reviewed homework | A scored review becomes `HOMEWORK_WEAK` below 60, or `HOMEWORK_STRONG` at 60 and above. An unscored review creates no signal. The actual score is retained as evidence. |
| Speaking room | A persisted message records `SPEAKING_ACTIVITY` and the server-owned room topic. Difficulty signals are supported by the normalizer when difficulty is reported, but the current message pipeline always sets `difficultyReported: false`. This is not speech-quality analysis. |
| Student goal | Saved `StudentProfile.goal` and saved monthly/weekly goals in `StudentLearningProfile.goalsJson` create slot-specific `STUDENT_GOAL` signals. Student edits, authorized admin edits, and registration call the reconciler in the source transaction. Equivalent active goals do not duplicate; changed or removed goals expire the prior signal while retaining its evidence. |
| Explicit attendance absence | Only a persisted `Attendance` row whose status is exactly `ABSENT` creates `ATTENDANCE_ABSENCE`. Teacher/admin attendance writes reconcile the signal in the same transaction. Any correction expires the active signal; later explicit absence creates a new historical revision. No activity or missing-event inference is used. |

The type/source enums also include session, resource, progress and other signal categories. Their presence in the data model does not mean corresponding ingestion hooks are implemented. In particular, upcoming-class signal integration is not wired.

Signal keys are source-specific and unique per student. Immutable source events upsert with an empty update, making a replay a no-op. Goal and attendance state signals use source-slot or attendance-row identity plus a revision; superseded rows retain their evidence with `expiresAt` set to the correction time. When database writes are enabled, each integration runs inside the source transaction, so a failed signal write aborts the source update too.

## Profile and mastery

The student profile read combines official level/stage and goal data, stored learning-profile JSON fields (target skills, strengths, weaknesses, vocabulary, pronunciation, speaking needs, and engagement), and completed scored learning-progress rows. It groups progress by skill, level and stage. Mastery is returned only when at least three completed scored evidence items exist; the score is the rounded arithmetic mean. It is labeled `COMPLETED_SCORED_EVIDENCE`, not an independently measured or AI-generated score.

This evidence calculation is implemented as a profile foundation. It should not be confused with a general mastery model or a signal that every mastery-dependent recommendation path is active.

## Deterministic recommendation rules

Recommendations require at least one eligible signal; unsupported signal types are ignored. Current rules include:

| Signal need | Recommendation |
| --- | --- |
| Normalized mistake with original and correction evidence | `PRACTICE` for one signal; `REVIEW` when repeated. |
| Pronunciation need | `PRACTICE`, including a single published guidance entry. |
| Vocabulary need | `LEARN` for a single item; `PRACTICE` when repeated. |
| Weak reviewed homework | `RECOVERY_CHECK`. |
| Strong reviewed homework | `MASTERY_CHECK` (a confirmation check, not a mastery assertion). |
| Attendance absence | `RECOVERY_CHECK` only for an explicit, active `ABSENT` attendance signal. |
| Reported speaking-topic difficulty | Targeted `PRACTICE`; current speaking ingestion records activity rather than reported difficulty. |
| Published EBI | `PRACTICE` to apply the improvement. |

Equivalent needs are grouped by signal kind and a normalized topic/skill key. The stable `dedupeKey` identifies the student and learning need (including need category and skill), deliberately not the current recommendation action; therefore a need can change from `PRACTICE` to `REVIEW` without becoming a different unresolved need. The schema enforces uniqueness on `(studentId, dedupeKey, dedupeCycle)`.

Each recommendation also stores an `evidenceCycleKey`, currently derived from the newest signal's dedupe key in that need group, and a monotonically increasing `dedupeCycle`. An active `PENDING` or `ACCEPTED` need suppresses duplicates. A terminal history record with the same evidence cycle is not repeated; when genuinely new evidence changes the cycle, the engine may create the next cycle number while preserving earlier recommendation history. The persistence upsert does not overwrite an existing cycle's evidence or lifecycle state. The schema's `(studentId, dedupeKey, evidenceCycleKey)` index supports history lookup.

### Priority calculation

For a non-empty group of signals:

```text
priority = round(
  max(signal strength)
  + min(3, signal count - 1)
  + recency points
  + goal match bonus
  + upcoming-class bonus
  - established-mastery penalty
)
```

Recency uses the newest signal in the group: 3 points within 3 days, 2 within 7 days, 1 within 30 days, otherwise 0. A matching goal adds 2; upcoming-class relevance adds 1; established mastery subtracts 2. The final result is clamped to 1–10. These factors are deterministic and exposed as named constants.

The current recommendation refresh supplies goals. It does not supply upcoming-class relevance. It applies the mastery penalty to the `HOMEWORK_STRONG` group; it does not load the profile mastery aggregate to classify arbitrary needs as mastered. Therefore the full priority-factor interface is not yet wired to all its potential data inputs.

## Recommendation lifecycle

Statuses are `PENDING`, `ACCEPTED`, `COMPLETED`, `DISMISSED`, and `EXPIRED`. Implemented transitions are:

- `PENDING` → `ACCEPTED`, `DISMISSED`, or `EXPIRED`
- `ACCEPTED` → `COMPLETED`, `DISMISSED`, or `EXPIRED`
- terminal statuses have no outgoing transitions

Recommendation refresh assigns generated records a 30-day expiry. Pending and accepted recommendations expire when their expiry time is reached; completed recommendations are not expired by that check. Student endpoints support accepting and dismissing. This implementation does not expose a student completion endpoint for recommendations; completing the daily plan does not itself mark linked recommendations completed.

## Daily learning

The plan builder targets a requested duration clamped to 10–25 minutes (15 by default), considers no more than five steps, and uses existing published resources matched exactly to the student's official level, stage, and skill. A generic, missing-context, wrong-stage, or wrong-skill resource is not used as a fallback. Recommendation resource links are returned only when the resource is published and its level/stage/skill IDs exactly match the recommendation's IDs. The current service does not pass a duration preference, so its default target is 15 minutes. It does not synthesize work without a real selected resource. If there are no eligible recommendations the plan is `NO_RECOMMENDATIONS`; if there are recommendations but no suitable resources it is `NO_SUITABLE_RESOURCE`. Otherwise it is `READY`.

Each selected recommendation/resource contributes a step of up to 10 minutes. Recommendation types map to `READ` for `LEARN`, `CORRECT` for `REVIEW`, `MASTERY_CHECK` for `MASTERY_CHECK`, and `PRACTICE` otherwise. The active strict service adapter does not top up short plans with synthetic or additional reflection work; total duration can be below 10 minutes when only one suitable recommendation/resource is available. The supported step enum also includes `EXAMPLE`, `REFLECT`, `SIMILAR`, but those are not currently emitted by the active service adapter.

The daily key is the UTC date. Starting a ready plan creates one session per student/day, stores an immutable plan snapshot and creates step rows. A subsequent read returns that snapshot instead of silently recomputing the active session plan. Session states include `NOT_STARTED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, and `ABANDONED`; the progress endpoint supports start/complete/skip of the current step and pause/resume. Completion requires every step to be completed or skipped. There is no current endpoint to abandon a session.

## AI boundaries and privacy

Recommendations are generated by deterministic rules. Teacher intelligence explicitly returns `PROVIDER_UNAVAILABLE` / `DETERMINISTIC_ONLY`; admin settings report the provider unavailable. No connected AI provider, AI-generated recommendation content, or AI tool execution is claimed. Do not treat installed AI-related dependencies or the `AIRecommendation` model name as evidence of provider connectivity.

Feedback normalization deliberately excludes private teacher notes. API projections filter evidence to selected fields and return short, bounded reasons; prompts, secrets, and internal reasoning are not exposed. Student data access is keyed from the authenticated identity, while teacher access additionally checks a server-owned assignment relationship. See [Authorization](PHASE_9_AUTHORIZATION.md) and [API](PHASE_9_API.md).

## User interfaces

Implemented Phase 9 UI entrypoints are `/dashboard/student/learning`, `/dashboard/teacher/intelligence`, and `/dashboard/admin/intelligence`. The student screen presents daily learning, recommendations, progress/evidence, goals, and learning-profile views; the teacher view supports assigned-student intelligence and suggestion drafting/explicit approval; the admin view presents overview counts, recommendation reporting, and service settings. The screens surface database/provider availability rather than inventing records. UI availability is distinct from database-backed functionality while MongoDB is blocked.

## Persistence and validation boundary

Prisma schema models describe signals, recommendations, daily sessions/steps, and teacher suggestions, but a schema declaration is not evidence of successful MongoDB persistence. The database guard uses the existing `PHASE5_DATABASE_ENABLED` flag; when disabled, route handlers respond with HTTP 503 `DATABASE_UNAVAILABLE`. MongoDB remains an infrastructure blocker. No migration, database write, real persistence test, or production database integration is asserted here.

Related implementation: `lib/phase9/engine.ts`, `lib/phase9/pipeline.ts`, `lib/phase9/student-service.ts`, and `lib/phase9/staff-service.ts`.