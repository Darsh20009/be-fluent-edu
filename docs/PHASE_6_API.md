# Phase 6 API

All external input is validated with Zod. Database-dependent routes are blocked before Prisma while MongoDB is unavailable.

## Admin

- `GET|POST /api/admin/classes/sessions`
- `GET|PATCH /api/admin/classes/sessions/:id`
- `POST /api/admin/classes/sessions/:id/transition`
- `GET|POST /api/admin/classes/sessions/:id/participants`
- `GET|POST /api/admin/classes/sessions/:id/attendance`
- `GET|POST|DELETE /api/admin/classes/sessions/:id/qmeet`
- `GET /api/admin/classes/qmeet/status`

## Teacher

- `GET /api/teacher/classes/sessions`
- `POST /api/teacher/classes/sessions/:id/transition`
- `POST /api/teacher/classes/sessions/:id/attendance`
- `GET|POST /api/teacher/classes/sessions/:id/qmeet`

Teacher operations verify ownership through the assigned `TeacherProfile`.

## Student

- `GET /api/student/classes`
- `GET /api/student/classes/sessions/:id`
- `POST /api/student/classes/sessions/:id/join`

Student identity is always taken from the authenticated session. A client-provided student ID is never trusted.

## Stable errors

Important codes include `DATABASE_UNAVAILABLE`, `PROVIDER_UNAVAILABLE`, `INVALID_TRANSITION`, `PARTICIPANT_NOT_ELIGIBLE`, `NOT_ENROLLED`, `SESSION_NOT_JOINABLE`, `TOO_EARLY`, `SESSION_ENDED`, `QMEET_UNAVAILABLE`, and `QMEET_FAILED`.