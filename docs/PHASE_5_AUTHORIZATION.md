# Phase 5 Authorization

Every server-side operation rechecks centralized RBAC.

| Role | Capabilities |
| --- | --- |
| Admin | Full packages, subscriptions, enrollments, groups, schedules, and override management |
| Manager | Operational package, subscription, enrollment, and group management through explicit permissions |
| Staff | Subscription and group operations only when explicitly granted |
| Teacher | Read assigned groups and students; no commercial ownership or lifecycle mutation |
| Student | Read own subscription, enrollment, and group information; no assignment mutation |

Phase 5 permissions:

- `admin.managePackages`
- `admin.manageSubscriptions`
- `admin.manageEnrollments`
- `admin.manageGroups`
- `staff.manageSubscriptions`
- `staff.manageGroups`
- `teacher.viewAssignedGroups`
- `student.viewCommercial`

Sensitive actions write through the existing audit service. Logged metadata uses identifiers, transitions, affected fields, and override reasons; secrets and credentials are filtered.