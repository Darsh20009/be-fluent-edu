# Phase 5 API

All request bodies use Zod validation. Protected operations follow:

`route → validation → authentication → authorization → business rules → service/Prisma → response`

The database readiness gate runs before this chain while MongoDB is blocked.

## Admin

- `GET|POST /api/admin/commerce/packages`
- `GET|PATCH /api/admin/commerce/packages/:id`
- `GET|POST /api/admin/commerce/subscriptions`
- `GET|PATCH /api/admin/commerce/subscriptions/:id`
- `GET|POST /api/admin/enrollments`
- `GET|PATCH /api/admin/enrollments/:id`
- `GET|POST /api/admin/groups`
- `GET|PATCH /api/admin/groups/:id`
- `PATCH /api/admin/groups/:id/teacher`
- `POST /api/admin/groups/:id/members`
- `POST|DELETE /api/admin/groups/:id/schedules`
- `POST /api/admin/groups/matching`
- `POST /api/admin/groups/matching/override`

## Role views

- `GET /api/student/commercial` returns only the signed-in student's subscriptions and enrollments.
- `GET /api/teacher/groups` returns only groups assigned to the signed-in teacher profile.

## Errors

Responses use an error object with a stable code. Expected conflict codes include `SUBSCRIPTION_NOT_USABLE`, `DUPLICATE_ENROLLMENT`, `TYPE_MISMATCH`, `LEVEL_MISMATCH`, `STAGE_MISMATCH`, `GROUP_FULL`, `TEACHER_SCHEDULE_CONFLICT`, and `INVALID_LIFECYCLE`.

While blocked, all Phase 5 routes return:

```json
{"ok":false,"error":{"code":"DATABASE_UNAVAILABLE","message":"Commercial and group data is temporarily unavailable."}}
```