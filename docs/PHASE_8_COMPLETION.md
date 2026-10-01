# Phase 8 Completion

## Implemented

### Speaking Rooms

- Level/stage-aware room access using server-owned official profile data.
- Room list, detail, create, update, status, membership, and message APIs.
- TEXT and VOICE contracts with bounded input.
- Existing Socket.IO server extended with protected Speaking events.
- Server-side membership checks before join, message, and broadcast.
- Duplicate membership prevention.
- Leave/disconnect membership handling.
- Reports, mute, unmute, remove, block, unblock, message moderation, and report
  resolution.
- Topic, prompt, and vocabulary content management.
- Audit hooks for important room and moderation actions.
- No XP, leaderboard, achievements, or other gamification.

### WhatsApp CRM

- Admin/manager account, contact, conversation, message, and queue APIs.
- Explicit CRM RBAC; students and teachers have no CRM access.
- Live Baileys socket lifecycle with an admin-only QR linking panel.
- Encrypted MongoDB auth state, account-scoped HKDF/AES-256-GCM keys, and a
  renewable per-account ownership lease to prevent competing server sockets.
- Direct OTP delivery through one explicitly selected connected account. OTP
  bodies bypass CRM history and queue storage.
- Account lifecycle states, logout/reconnect, and explicit OTP-sender selection.
- Ten failed reconnect attempts transitions to `ERROR`.
- Email alert is prepared only as pending provider work; no email is sent.
- Sequential per-account queue with 3-second minimum pacing.
- Dedupe and bounded retry policy.
- Group-chat filtering.
- Latest-150-message retention policy.
- Reuse of Phase 7 WhatsApp notification outbox transport boundary.

## Tests

`npm run test:phase8` contains pure tests for:

- Speaking level/stage access
- room/message/moderation validation
- Speaking database guard
- WhatsApp RBAC
- phone normalization
- group-chat filtering
- provider and auth-persistence unavailable states
- reconnect threshold and logout state
- email-alert preparation
- 150-message retention
- queue dedupe and three-second pacing
- WhatsApp database guard

Auth-state cryptography is tested locally. MongoDB/Socket.IO integration and
MongoDB/Baileys integration tests remain `skip` with explicit reasons. No QR
was scanned and no real WhatsApp message was sent.

## Truthful blocked states

- Development MongoDB is enabled for this workspace. Other environments remain
  subject to their own `PHASE5_DATABASE_ENABLED` gate.
- Speaking voice upload remains unavailable when StorageProvider is unavailable.
- WhatsApp requires `WHATSAPP_PROVIDER=baileys`, the database gate, and the
  existing server-only `SESSION_SECRET`; it fails closed if any are unavailable.
- No QR or connected state is fabricated.
- No email is sent without a configured provider.

## Operational limitations

The development path is implemented, but an authorized admin must scan the QR
and test delivery to an approved development number. Session restore after
restart and production operation have not been live-verified. There is no active
production deployment in this project. Speaking realtime integration also
remains unverified against live authenticated clients.

Rotating `SESSION_SECRET` makes existing Baileys auth state unreadable and
requires the affected WhatsApp accounts to be reset and linked again.

## Scope boundary

Phase 1–7 behavior remains frozen except for additive Phase 8 permissions,
middleware pass-through, schema relations, and the canonical realtime extension.
Phase 9 has not started.