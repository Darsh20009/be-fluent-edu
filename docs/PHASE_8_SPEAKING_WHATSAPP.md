# Phase 8 — Speaking Rooms & WhatsApp CRM

## Scope and status

Phase 8 adds two separate domains:

1. **Speaking Rooms** for level-appropriate student practice.
2. **WhatsApp CRM** for authorized administrative staff.

Phase 7 remains frozen. QMeet, formal classes, authentication source-of-truth, and
the Phase 7 notification outbox are not replaced by this phase. Phase 9 has not
started.

MongoDB is still unavailable. All database-dependent Phase 8 routes are guarded
before authentication and Prisma access and return:

```json
{
  "ok": false,
  "error": {
    "code": "DATABASE_UNAVAILABLE",
    "message": "..."
  }
}
```

with HTTP `503`. No migration, `db push`, seed, database read/write, or fake
record was performed.

## Speaking Rooms

Speaking Rooms use the existing `SpeakingRoom`, `SpeakingRoomMember`, and
`SpeakingRoomMessage` foundation. Additive models provide reports and reusable
room content.

Room data includes:

- name and description
- official level and optional stage
- topic, prompt, and vocabulary
- `OPEN`, `ACTIVE`, `INACTIVE`, or `CLOSED` status
- optional member capacity
- creator and timestamps

Students do not submit their own level. The server reads
`StudentProfile.officialLevelId` and `officialStageId`. A student can join only
when the account is active, the room is open/active, the official level matches,
the optional stage matches, and capacity is available. Existing active
membership is idempotently recognized; `(roomId, userId)` is unique.

Messages are `TEXT` or `VOICE`. Text is bounded to 4,000 characters. Voice
requires a storage reference and uses the existing StorageProvider boundary.
With the current deployment, voice upload is truthfully unavailable rather than
written to an ephemeral filesystem.

Reports can target a member or message. Authorized moderators can mute,
unmute, remove, block, unblock, delete/moderate messages, and resolve or dismiss
reports. Important room, membership, and moderation actions are audited without
private credentials.

## Realtime

Speaking realtime extends the canonical Socket.IO server in `start-server.js`.
No second Socket.IO server was created. Events are namespaced:

- `speaking:join`
- `speaking:leave`
- `speaking:member-joined`
- `speaking:member-left`
- `speaking:message`
- `speaking:message-created`

The server derives the user from the authenticated NextAuth token when the
database gate is enabled. It verifies an active persisted room membership before
joining a socket room or accepting a message. Client-supplied user IDs,
membership, display names, and room authorization are not trusted. Message
creation is persisted before broadcast. Disconnect/leave updates active
membership state where persistence is available.

The existing legacy realtime events remain for frozen functionality; they are
not used as the authorization model for Speaking Rooms.

## WhatsApp CRM

WhatsApp CRM is separate from student authentication. It is available only to
authorized admin/manager staff. Students and teachers have no CRM access unless
an explicit future permission is added.

The CRM models accounts, contacts, conversations, messages, and outbound queue
work. Contacts normalize phone numbers and group-chat identifiers are skipped.
Contacts do not automatically become students.

Baileys is installed behind `lib/whatsapp/provider.ts`; route handlers never
contain Baileys logic. The provider refuses initialization while a
production-safe persistent auth store is absent. The current state is therefore
`PROVIDER_UNAVAILABLE` with `PERSISTENCE_UNAVAILABLE`. No QR, credential,
session secret, or connected state is exposed.

Account states are:

`DISCONNECTED`, `QR_REQUIRED`, `CONNECTING`, `CONNECTED`, `RECONNECTING`,
`LOGGED_OUT`, and `ERROR`.

`CONNECTED` is never claimed unless the provider confirms it. A logout/401
condition must invalidate the session and require a new linking flow. Reconnect
attempts are bounded at ten. At ten failures the account enters `ERROR` and an
email alert is only prepared as pending provider work; no email is sent unless a
configured email provider exists.

Outbound messages use a server-side sequential queue. The queue:

- deduplicates by key
- serializes sends per account
- enforces at least 3,000 ms between sends
- bounds attempts to three
- persists delivery state only when MongoDB is available

Conversation retention keeps the latest 150 messages. Group chats are skipped.
Retention is server-side and is never performed as client-side deletion.

Phase 7 WhatsApp notification outbox rows remain the notification source. CRM
provides the transport/provider boundary and does not create a second
notification system.

## Provider and storage truthfulness

- Speaking voice storage: `PROVIDER_UNAVAILABLE` with the current StorageProvider.
- WhatsApp provider: `PROVIDER_UNAVAILABLE`.
- WhatsApp auth persistence: `PERSISTENCE_UNAVAILABLE`.
- WhatsApp email alerts: prepared only when the threshold is reached; not sent.
- MongoDB: blocked by the existing `PHASE5_DATABASE_ENABLED` gate.

Real MongoDB, Baileys, QR, WhatsApp, email, and persistent-storage integration
tests remain explicitly skipped.