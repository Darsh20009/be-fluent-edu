# Phase 7 Authorization

| Role | Feedback | Homework |
| --- | --- | --- |
| Admin | Manage all feedback and both reusable libraries | Manage all assignments and lifecycle states |
| Manager | Only explicit manager permissions | Only explicit manager permissions |
| Teacher | Assigned sessions and students only | Assigned students, groups, and sessions only |
| Student | Own published feedback only | Own assigned work, submissions, and reviews only |
| Staff | No implicit access; requires explicit stored permissions | No implicit access; requires explicit stored permissions |

Client-provided role, teacher identity, or student identity is never accepted as authority. Teacher ownership comes from `TeacherProfile`; student identity comes from the authenticated session.

Audit actions use `FEEDBACK_CHANGE` and `HOMEWORK_CHANGE` and do not contain credentials or provider secrets.