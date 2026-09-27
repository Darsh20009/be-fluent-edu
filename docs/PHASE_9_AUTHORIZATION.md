# Phase 9 Authorization and Privacy

## Authentication and database gate

Every Phase 9 HTTP route first checks `phase9DatabaseGuard()`. If `PHASE5_DATABASE_ENABLED !== "true"`, it returns HTTP 503 `DATABASE_UNAVAILABLE` without proceeding to authentication or persistence. Once the gate permits access, handlers apply existing role/session helpers:

- Student routes call `requireStudent()` and use the returned authenticated `userId` as the sole student owner key.
- Teacher routes call `requireTeacher()` and enforce an endpoint-specific capability with `canSession`.
- Admin intelligence routes require either the view-intelligence permission through `requireAnyPermission`.

The gate's precedence means a request made while the database is disabled receives the availability response before a role/permission response. Do not interpret a 503 as an authentication failure.

## Access matrix

| Actor | Allowed access | Tenant/student scope |
| --- | --- | --- |
| Student | Read own learning profile, signals, recommendations, daily plan/session; accept/dismiss own recommendation; operate own daily session. | Identity comes from the authenticated session. Recommendation and session queries include that user ID in the lookup/update predicates. |
| Teacher | View currently assigned student's intelligence and recommendation list with `teacher.viewStudentIntelligence`; create/approve suggestion drafts with `teacher.manageIntelligenceSuggestions`. | Assignment is rechecked server-side against current, live assignment records. Historical feedback and legacy session-student rows do not establish access. The client cannot specify a teacher owner. Suggestions are tied to the authenticated teacher and assigned student. |
| Admin / manager | Read overview, recommendation reporting, and settings with `admin.viewLearningIntelligence` or `manager.viewLearningIntelligence`. | Reports are intentionally administrative and may include student ID/name with recommendation summaries. These routes are read-only. |
| Staff | No Phase 9 access is granted by the Phase 9 permission list by default. | A custom grant would need to be explicit and is not implied by another role. |

The declared `admin.manageLearningIntelligence` and `manager.manageLearningIntelligence` capabilities do not currently correspond to Phase 9 write routes.

## Teacher assignment checks

Before returning a student's intelligence, staff-service verifies that the target is a `STUDENT` and that the teacher has a qualifying current assignment:

- active student membership in an active group assigned to the teacher;
- student participation in a scheduled/joined state in a scheduled, ready, or live teacher-owned session whose end time is still in the future;
- a paid, approved, non-rejected subscription assigned to the teacher and within its effective dates; or
- an active enrollment within its effective dates (and, when linked, a qualifying current subscription).

Historical feedback and legacy session-student rows deliberately do not grant access. The same current-assignment check is repeated for suggestion creation and approval. An inaccessible or nonexistent student is reported as not found for read APIs, avoiding disclosure of whether an unrelated student exists.

## Data minimization and privacy

- Feedback signals are made only from published, student-visible content. `teacherNotes` and revision/internal metadata are deliberately excluded.
- Normalized signals retain references and selected evidence rather than whole feedback/homework/message records. Evidence is filtered to a known allowlist when read back.
- Teacher and admin response projections return selected signal fields; teacher signal evidence has its own allowlist and omits unneeded source internals.
- Student-facing recommendation reasons are deterministic, bounded text. No prompts, secrets, or chain-of-thought are returned.
- Speaking activity records message identity, room/topic reference, and occurrence time; it does not evaluate speech quality. No automatic speech-quality scoring is performed.
- Recommendation and daily-session updates use owner predicates and expected prior-state predicates, reducing cross-student IDOR and stale-transition risks.
- Daily plan snapshots are persisted once per student/UTC-day and returned without silently replacing an existing plan.

## Suggestion approval boundary

Teacher suggestion drafts accept only type-specific, allowlisted keys whose values are non-empty strings up to 1000 characters. Approval is limited to the draft's creator, revalidates the teacher's student assignment, and atomically changes `DRAFT` to `APPROVED`. This approval records the teacher and timestamp only: it does **not** publish feedback, create homework/resources, alter a student's official level, or create a student-facing recommendation.

## AI and privilege boundaries

The current system is deterministic-only. Teacher and admin status responses identify the provider as unavailable. There is no connected Phase 9 model tool or AI write path documented here. No AI action can bypass endpoint permissions, assignment checks, or an explicit server-side source transition. Official level changes are not part of Phase 9 recommendation or suggestion actions.

## Remaining infrastructure limitation

The MongoDB-backed APIs are fail-closed while the existing database gate is disabled. Authorization predicates have automated service-level coverage, but no live MongoDB authorization exercise, tenant-isolation integration test, or successful persistence run is claimed. The code-level ownership and assignment controls described above are not a substitute for those blocked integration checks.