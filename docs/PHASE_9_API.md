# Phase 9 API

All routes below are database-backed and check `PHASE5_DATABASE_ENABLED` before authentication or data access. Unless the variable is exactly `true`, the response is HTTP 503:

```json
{
  "ok": false,
  "error": {
    "code": "DATABASE_UNAVAILABLE",
    "message": "Learning intelligence data is temporarily unavailable."
  }
}
```

Successful persistence is not established while MongoDB is unavailable. Authentication errors and permission errors otherwise follow the existing auth helpers. Response shapes below describe the current route/service implementation.

## Student routes

All student routes derive the student identity from `requireStudent()`; no route accepts a student owner ID from the request.

| Method and path | Behavior and response |
| --- | --- |
| `GET /api/student/learning/profile` | `{ ok: true, profile }`. Profile includes official level/stage, goal(s), stored target skills/strengths/weaknesses/vocabulary/pronunciation/speaking/engagement arrays, evidence-based mastery groups, and timestamps. |
| `GET /api/student/learning/signals` | `{ ok: true, items }`; up to 250 unexpired signals, newest first. Projection includes id/type/source/source entity/time/strength/skill/topic and filtered evidence. |
| `GET /api/student/learning/recommendations` | `{ ok: true, items }`; refreshes deterministic recommendations, then returns up to 100 unexpired `PENDING`/`ACCEPTED` items by priority. Each item includes type/title/reason/priority/status, level/stage/skill, dates, source-signal count, a published resource or `null`, and `resourceAvailability` (`AVAILABLE` or `NO_SUITABLE_RESOURCE`). A resource is returned only if its level, stage, and skill IDs exactly match the recommendation; there is no generic or wrong-context fallback. |
| `POST /api/student/learning/recommendations/{id}/accept` | No body. `{ ok: true, item: { id, status: "ACCEPTED" } }` on success. |
| `POST /api/student/learning/recommendations/{id}/dismiss` | No body. `{ ok: true, item: { id, status: "DISMISSED" } }` on success. |
| `GET /api/student/learning/today` | `{ ok: true, session, plan, snapshotImmutable }`. With no saved session, `session` is `null` and plan is recomputed; with a saved session, the stored immutable plan snapshot and session/step state are returned. |
| `POST /api/student/learning/today/start` | No body. Creates a session only for a `READY` non-empty plan, returns HTTP 201 on creation and 200 when reusing the day's existing session. If no session can be started, returns `{ ok: true, created: false, session: null, plan, code }`, where code is `NO_RECOMMENDATIONS` or `NO_SUITABLE_RESOURCE`. |
| `POST /api/student/learning/today/progress` | Strict JSON body: `{"action":"START_STEP"|"COMPLETE_STEP"|"SKIP_STEP","stepIndex":0}` or `{"action":"PAUSE"|"RESUME"}`. A step index 0–4 is required for step actions. Success is `{ ok: true, ...result }`. |
| `POST /api/student/learning/today/complete` | No body. Completes a session only after every step is completed or skipped; success is `{ ok: true, sessionId, status: "COMPLETED" }`. |

Student transition/progress errors: recommendation actions return 404 `NOT_FOUND`, 409 `CONFLICT`, or 410 `EXPIRED`; progress/complete return 404 `NOT_FOUND`, 409 `CONFLICT`, and HTTP 400 for other invalid state/step errors. Validation errors on progress are HTTP 400 `VALIDATION_ERROR`. Daily start's no-plan condition is represented in a successful 200 response with a `code`, not an HTTP error.

## Teacher routes

Teacher endpoints require a teacher session plus the named capability. Access to an individual student's intelligence also requires a current server-verified assignment; client-supplied ownership is not trusted. Historical feedback and legacy session-student rows do not establish current assignment.

| Method and path | Permission | Behavior and response |
| --- | --- | --- |
| `GET /api/teacher/intelligence/students/{id}` | `teacher.viewStudentIntelligence` | Student name/id, official level/stage, goals, target skills, strengths, weaknesses, speaking needs, last review date, up to 50 projected signals, up to 30 pending/accepted recommendations, and `ai: { status: "PROVIDER_UNAVAILABLE", mode: "DETERMINISTIC_ONLY" }`. Unassigned or nonexistent student returns 404. |
| `GET /api/teacher/intelligence/students/{id}/recommendations` | `teacher.viewStudentIntelligence` | `{ items }` with up to 100 recommendations, ordered by priority then creation time; unassigned or nonexistent student returns 404. |
| `POST /api/teacher/intelligence/suggestions` | `teacher.manageIntelligenceSuggestions` | Creates a `DRAFT`; see request below. Returns HTTP 201 with suggestion fields and parsed `draft` (not `draftJson`). Does not publish feedback or create a student-facing recommendation. |
| `POST /api/teacher/intelligence/suggestions/{id}/approve` | `teacher.manageIntelligenceSuggestions` | Body must be `{"approved":true}`. Marks the teacher-owned draft `APPROVED`, with approver/time; response `{ kind: "APPROVED", id, status: "APPROVED" }`. Approval does not create a student record. |

Suggestion creation request:

```json
{
  "studentId": "assigned-student-id",
  "type": "FEEDBACK_EXPRESSION",
  "draft": { "expression": "Could you help me?", "meaning": "A polite request" },
  "reason": "Why this draft may help",
  "expiresAt": null
}
```

Allowed `type` values: `FEEDBACK_EXPRESSION`, `MISTAKE`, `EBI`, `HOMEWORK`, `VOCABULARY`, `SPEAKING_PROMPT`, and `RESOURCE`. Draft keys are type-specific and all accepted values must be non-empty strings of at most 1000 characters. Unknown keys, empty drafts, invalid types, and invalid fields are rejected. Supported fields by type are enforced in `lib/phase9/staff-service.ts`.

Teacher errors include 403 `FORBIDDEN` for missing permission or assignment, 404 `NOT_FOUND` for a missing/unassigned student or suggestion, 409 `ALREADY_PROCESSED` when approval loses a race, and 400 validation errors for malformed requests.

## Admin/manager routes

These are read-only. They accept either `admin.viewLearningIntelligence` or `manager.viewLearningIntelligence`. The separate manage-learning-intelligence permissions do not enable a write operation in these routes.

| Method and path | Behavior and response |
| --- | --- |
| `GET /api/admin/intelligence/overview` | Counts signals, recommendations, pending/accepted recommendations, and teacher suggestions; includes truthful deterministic-only/unavailable AI status. |
| `GET /api/admin/intelligence/recommendations` | `{ items }`; optional query `status` (one of recommendation statuses), `studentId`, and `limit` (integer 1–100, default 50). Ordered by priority then creation time. |
| `GET /api/admin/intelligence/settings` | Reports `mode: "DETERMINISTIC_ONLY"`, unavailable AI provider, supported recommendation statuses, and `suggestionApprovalCreatesStudentRecord: false`. |

Malformed admin query values return the shared validation error response.

## Source-event hooks (not HTTP APIs)

Published teacher/admin feedback transitions, reviewed homework submissions, and speaking-room message creation call the normalized signal pipeline. These are source-event integrations rather than additional public Phase 9 routes. They are guarded by the same database flag and use the caller's source-event transaction. Current pipeline coverage and omissions are documented in [Learning Intelligence](PHASE_9_LEARNING_INTELLIGENCE.md).

## UI entrypoints

- Student: `/dashboard/student/learning`
- Teacher: `/dashboard/teacher/intelligence`
- Admin: `/dashboard/admin/intelligence`

These are application pages over the APIs above, not additional API routes. While the database gate is disabled, their data-dependent states show that records are unavailable.

## Error envelope and stability

Where used, errors follow `{ ok: false, error: { code, message } }`. Publicly returned reasons are trimmed and bounded. API field sets are implementation-specific; clients should not assume that every signal enum/source represents an active ingestion feature.