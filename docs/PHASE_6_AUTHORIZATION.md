# Phase 6 Authorization

Every database operation rechecks centralized authorization after the infrastructure gate.

| Role | Access |
| --- | --- |
| Admin | Full session, participant, attendance, schedule, and QMeet management |
| Manager | Operational session management through explicit centralized permissions |
| Teacher | Assigned sessions only; may transition sessions, manage QMeet, and record attendance |
| Student | Own assigned sessions only; may request join authorization but cannot mark attendance |
| Staff | No implicit Phase 6 capability; access requires an explicit staff permission |

Permissions added:

- `admin.manageSessions`
- `manager.manageSessions`
- `teacher.manageAssignedSessions`
- `teacher.manageAttendance`
- `student.viewSessions`

Important changes are recorded through the existing audit service as `SESSION_CHANGE`, `SESSION_PARTICIPANT_CHANGE`, `ATTENDANCE_CHANGE`, `TEACHER_ASSIGNMENT`, and `QMEET_OPERATION`.