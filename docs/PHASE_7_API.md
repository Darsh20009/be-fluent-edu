# Phase 7 API

All database routes apply the database gate first, then authentication, RBAC, Zod validation, ownership rules, service logic, Prisma, and response formatting.

## Feedback

- Teacher: `GET|POST /api/teacher/feedback`, `POST /api/teacher/feedback/:id/transition`
- Admin: `GET|POST /api/admin/feedback`, `GET|PATCH /api/admin/feedback/:id`, `POST /api/admin/feedback/:id/transition`
- Student: `GET /api/student/feedback`, `GET /api/student/feedback/:id`

## Libraries

- Admin EBI: `GET|POST /api/admin/ebi-library`, `PATCH|DELETE /api/admin/ebi-library/:id`
- Teacher EBI: `GET /api/teacher/ebi-library`
- Admin mistakes: `GET|POST /api/admin/mistake-library`, `PATCH|DELETE /api/admin/mistake-library/:id`
- Teacher mistakes: `GET /api/teacher/mistake-library`

Delete operations deactivate library records rather than removing history.

## Homework

- Teacher: `GET|POST /api/teacher/homework`, `PATCH /api/teacher/homework/:id`, `POST /api/teacher/homework/submissions/:id/review`
- Admin: `GET /api/admin/homework`, `PATCH /api/admin/homework/:id`
- Student: `GET /api/student/homework`, `GET|POST /api/student/homework/:id`
- Storage status: `GET /api/storage/status`

Provider-backed file, voice, and video submissions return `PROVIDER_UNAVAILABLE` when storage is not configured.