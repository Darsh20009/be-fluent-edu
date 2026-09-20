# Phase 4 Authorization

## Capabilities

Central permissions added for Phase 4:

- `admin.viewPeople`
- `admin.manageLevels`
- `admin.manageStaffPermissions`
- `admin.changeStudentLevel`
- `manager.viewPeople`
- `teacher.viewStudents`
- `teacher.recommendLevel`
- `student.editProfile`
- `student.editGoals`

ADMIN receives the full administrative capability set. MANAGER receives
people/level management capabilities but not staff-permission administration.
STAFF receives only explicit `StaffPermission` records. STUDENT permissions
remain self-scoped by the server-side session.

## Business rules

- Only active, non-suspended accounts pass the current-session check.
- Student profile edits use the authenticated student ID.
- Admin/manager people views do not accept a client role as authority.
- Staff permission changes require `admin.manageStaffPermissions`; staff cannot
  grant permissions to themselves.
- Official level changes validate both level and stage ownership.
- Teacher recommendations are separate records and cannot change official
  level/stage.
- Audit events are written for level changes, profile changes, permission
  changes, and teacher recommendations.

## Deferred authorization

Subscription, group, class, feedback, homework, QMeet, CRM, and AI domain
permissions remain outside Phase 4. Their legacy routes are not new
dependencies of the core people APIs.