# Phase 8 Authorization

## Enforcement order

Database-dependent Phase 8 routes use:

```text
database guard → authentication → permission → ownership/membership → Zod input → business rule → Prisma → response
```

The database guard is intentionally before authentication so an unavailable
MongoDB deployment produces `503 DATABASE_UNAVAILABLE`, not a misleading
`401`. Middleware passes Phase 8 API prefixes through to this route-level guard;
it does not bypass route authorization.

## Permission matrix

| Capability | Student | Teacher | Staff | Manager | Admin |
|---|---:|---:|---:|---:|---:|
| Access eligible Speaking Rooms | `student.accessSpeakingRooms` | only if explicitly assigned | No implicit access | explicit permission if granted | Yes |
| Join/leave own Speaking Room membership | Yes | only with explicit access | No implicit access | explicit permission if granted | Yes |
| Send own room message | Yes, active member only | active member only | No implicit access | explicit permission if granted | Yes |
| Report member/message | Yes, own active room | explicit access | No implicit access | explicit permission if granted | Yes |
| Moderate Speaking Rooms | No | `teacher.moderateSpeakingRooms` | No implicit access | `manager.manageSpeakingRooms` if granted | `admin.moderateSpeakingRooms` |
| Create/update room | No | No by default | No | `manager.manageSpeakingRooms` | `admin.manageSpeakingRooms` |
| Manage room topics/content | No | No by default | No | explicit manager permission | `admin.manageSpeakingRooms` |
| WhatsApp CRM | No | No | no new implicit CRM access | `manager.manageWhatsAppCRM` | `admin.manageWhatsApp` |
| Student authentication via WhatsApp CRM | Never | Never | Never | Never | Never |

Legacy `STAFF` permissions do not automatically grant Speaking Room or CRM
management. Admin access is represented by the existing all-permissions admin
role; manager access is explicit.

## Speaking authorization rules

- Identity comes from the authenticated session/token, never from a body or
  query parameter.
- Official level and stage come from the server-side student profile.
- A room must be `OPEN` or `ACTIVE`.
- A level must match exactly; a room stage, when present, must match exactly.
- Active account and capacity are checked server-side.
- Existing active membership is recognized without creating a duplicate.
- Blocked members cannot rejoin or post.
- Messages require active membership and are rejected for muted members.
- A student can report but cannot mute, remove, block, delete, or resolve another
  member's content.
- Teacher moderation is permission-gated and applies only through the moderation
  endpoint; admin/manager permissions are separate.
- Socket joins and messages repeat membership checks on the server. A client
  cannot impersonate a sender, join by arbitrary room ID, or target an arbitrary
  socket for Speaking events.

## WhatsApp CRM authorization rules

- CRM routes are admin/manager-facing and never student-facing.
- `admin.manageWhatsApp` grants admin CRM operations.
- `manager.manageWhatsAppCRM` grants manager CRM operations.
- Teacher and student roles are denied without an explicit future permission.
- Contact-to-student linking is not automatic and does not change authentication.
- Contact phone numbers are normalized server-side.
- Group chats are skipped and cannot become CRM conversations.
- Conversation assignment and lifecycle changes are permission-checked.
- Outbound messages are queued server-side; clients cannot invoke the provider
  directly or bypass pacing/deduplication.
- QR data, auth credentials, provider session state, and secrets are never
  returned by API responses or audit details.

## Audit and privacy

Speaking room creation/update, membership changes, moderation, reports, and
message moderation are audited. WhatsApp account lifecycle, QR requests,
logout, reconnect threshold, sensitive contact changes, and send attempts may be
audited with safe metadata.

The implementation does not log or expose API keys, OTPs, QR secrets, Baileys
credentials, auth state, or session secrets. CRM data is not exposed to
students. Moderation details are returned only to authorized staff.

## Realtime authorization

The canonical Socket.IO server authenticates the handshake when the database
gate is enabled. Before `speaking:join`, it verifies persisted active
membership and room status. Before `speaking:message`, it verifies active
membership and mute state again. Realtime identity is derived from the socket
authentication context. Broadcasts are scoped to the authorized
`speaking:<roomId>` room.