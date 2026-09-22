# Phase 8 API Reference

All database-dependent routes execute the Phase 8 database guard before auth or
Prisma. With MongoDB disabled they return HTTP `503` and
`error.code = "DATABASE_UNAVAILABLE"`. Successful examples below describe the
implemented contract when the infrastructure is available; no such persistence
was claimed during Phase 8 validation.

## Speaking Rooms — student

### `GET /api/student/speaking/rooms`

Lists rooms eligible for the authenticated student. Eligibility uses the
server-owned official level/stage, active account, room state, and capacity.

### `GET /api/student/speaking/rooms/:id`

Returns an authorized room and the caller's membership state. Non-members must
pass the official level/stage rules.

### `POST /api/student/speaking/rooms/:id`

Joins the room. The server derives the user and official level; duplicate active
membership is not created. A blocked member cannot rejoin.

### `DELETE /api/student/speaking/rooms/:id`

Leaves the room and records the membership as left.

### `GET /api/student/speaking/rooms/:id/members`

Returns room members visible to an authorized room participant.

### `GET /api/student/speaking/rooms/:id/messages`

Returns persisted room messages for an authorized member.

### `POST /api/student/speaking/rooms/:id/messages`

Body:

```json
{ "messageType": "TEXT", "text": "Hello" }
```

or:

```json
{ "messageType": "VOICE", "voiceRef": "provider-object-reference" }
```

Text requires non-empty text of at most 4,000 characters. Voice requires a
provider reference. If storage is unavailable, voice returns an explicit
provider-unavailable error.

### `POST /api/student/speaking/rooms/:id/reports`

Body:

```json
{
  "targetUserId": "optional-user-id",
  "messageId": "optional-message-id",
  "reason": "Required explanation"
}
```

The reporter is derived from authentication. Reports are stored as `OPEN`.

## Speaking Rooms — admin

### `GET|POST /api/admin/speaking/rooms`

Lists rooms or creates a room. Creation accepts `name`, `description`, `levelId`,
optional `stageId`, `topic`, optional `prompt`, `vocabulary`, optional
`maxMembers`, and status.

### `GET|PATCH /api/admin/speaking/rooms/:id`

Returns or updates room metadata. Status transitions use
`OPEN`, `ACTIVE`, `INACTIVE`, or `CLOSED`.

### `GET /api/admin/speaking/rooms/:id/members`

Lists members for administration.

### `PATCH /api/admin/speaking/rooms/:id/members/:userId`

Applies a validated moderation action such as `MUTE`, `UNMUTE`, `REMOVE`,
`BLOCK`, or `UNBLOCK`.

### `GET /api/admin/speaking/rooms/:id/messages/:messageId`

Returns the moderation target/message record.

### `PATCH /api/admin/speaking/rooms/:id/messages/:messageId`

Moderates/deletes the message according to the validated action.

### `GET /api/admin/speaking/rooms/:id/reports`

Lists room reports with their status.

### `PATCH /api/admin/speaking/rooms/:id/reports/:reportId`

Resolves or dismisses a report and may include a moderation note.

### `GET|POST /api/admin/speaking/topics`

Lists or creates reusable `TOPIC`, `PROMPT`, or `VOCABULARY` content.

### `PATCH|DELETE /api/admin/speaking/topics/:id`

Updates or deactivates content. The content type is validated and records are
not silently exposed as active after deactivation.

## Speaking Rooms — teacher

### `PATCH /api/teacher/speaking/rooms/:id/moderation`

Applies explicitly authorized moderation actions:

```json
{
  "action": "MUTE",
  "memberUserId": "user-id",
  "note": "optional note"
}
```

Supported actions include `MUTE`, `UNMUTE`, `REMOVE`, `BLOCK`, `UNBLOCK`,
`DELETE_MESSAGE`, `RESOLVE_REPORT`, and `DISMISS_REPORT`, with the required
target identifier.

## Speaking realtime

Socket.IO uses path `/api/socket/io` on the existing server.

Client emits:

- `speaking:join` with `{ roomId }`
- `speaking:leave` with `{ roomId }`
- `speaking:message` with `{ roomId, messageType, text|voiceRef }`

Server callbacks return `{ ok: true, ... }` or `{ ok: false, code }`.
Broadcast events include `speaking:member-joined`,
`speaking:member-left`, and `speaking:message-created`.

Membership and identity are checked server-side. A disabled database returns
`DATABASE_UNAVAILABLE`; an unauthenticated or non-member socket cannot enter or
send.

## WhatsApp CRM — provider

### `GET /api/whatsapp/provider-status`

This provider-only route is database-independent and returns a secret-free state
such as:

```json
{
  "ok": true,
  "status": "PROVIDER_UNAVAILABLE",
  "persistence": "PERSISTENCE_UNAVAILABLE",
  "authenticated": false,
  "reason": "A production-safe persistent auth store is not configured."
}
```

It never returns QR data, credentials, or session secrets.

## WhatsApp CRM — admin/manager

### `GET|POST /api/admin/whatsapp/accounts`

Lists or creates a `BAILEYS` account. Creation accepts a phone number. Account
state is not reported as connected until Baileys confirms it.

### `GET|PATCH /api/admin/whatsapp/accounts/:id`

Returns or changes the account lifecycle. Connect, reconnect, disconnect, and
logout operations remain provider-gated and unavailable without persistent auth.

### `GET|POST /api/admin/whatsapp/contacts`

Lists or creates CRM contacts. Input includes `accountId`, `phoneNumber`,
optional `displayName`, and optional linked `userId`. Phones are normalized
server-side. Group-chat identifiers are rejected/skipped.

### `GET /api/admin/whatsapp/conversations`

Lists CRM conversations with contact, status, unread count, last message, and
timestamps. Students never receive this route.

### `GET|PATCH /api/admin/whatsapp/conversations/:id`

Returns or updates conversation status (`OPEN`, `CLOSED`, `ARCHIVED`) and
optional staff assignment.

### `GET|POST /api/admin/whatsapp/conversations/:id/messages`

Lists messages or queues an outbound text body. An optional idempotency key
prevents duplicate sends. Messages pass through the server queue; direct
provider sends are not exposed by the route.

### `GET /api/admin/whatsapp/queue`

Returns queue status and safe delivery metadata without credentials or payload
secrets.

## Common error responses

- `503 DATABASE_UNAVAILABLE`: database gate is disabled.
- `401 UNAUTHORIZED`: middleware/authentication rejected the request when the
  database gate is enabled.
- `403 FORBIDDEN`: authenticated caller lacks the required permission.
- `404 NOT_FOUND`: resource is absent or not visible to the caller.
- `409`: duplicate membership, invalid lifecycle, capacity, or duplicate
  idempotency operation.
- `PROVIDER_UNAVAILABLE`: the required storage/provider boundary is not
  configured.