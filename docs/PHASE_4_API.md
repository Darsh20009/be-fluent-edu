# Phase 4 API

## People

- `GET /api/admin/people/students?search=&status=&levelId=&stageId=&page=&pageSize=`
- `GET /api/admin/people/students/:id`
- `PATCH /api/admin/people/students/:id`
- `GET /api/admin/people/teachers?search=&status=`
- `GET /api/admin/people/teachers/:id`
- `PATCH /api/admin/people/teachers/:id`
- `GET /api/admin/people/staff?search=`
- `GET /api/admin/people/staff/:id`
- `PATCH /api/admin/people/staff/:id`

People APIs return live database records only. Student lists include official
level/stage when available. Staff mutation replaces explicit permissions and
requires the centralized admin permission.

## Levels

- `GET /api/admin/levels`
- `GET /api/admin/levels/:id`
- `PATCH /api/admin/students/:id/level`

Official level changes validate that the level is active and the stage belongs
to that level, update the learning-profile foundation, and create a
`LEVEL_CHANGE` audit event.

## Teacher recommendations

- `POST /api/teacher/students/:id/level-recommendation`

The teacher can recommend a level/stage with an optional reason. It never
changes the official level. The recommendation and audit event retain the
teacher identity.

## Student

- `GET /api/student/profile`
- `PATCH /api/student/profile`
- `GET /api/student/learning-profile`
- `PATCH /api/student/goals`

Student identity is always derived from the authenticated session. Profile and
goal writes cannot target another user.

## Health

- `GET /api/health`

See `docs/PHASE_4_CORE_ARCHITECTURE.md` for status semantics.