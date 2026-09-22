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
- Baileys provider boundary with lazy construction only.
- Persistent auth storage abstraction.
- Account lifecycle states and logout/reconnect helpers.
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

MongoDB/Socket.IO integration and MongoDB/Baileys integration tests are marked
`skip` with explicit infrastructure/provider reasons. No real WhatsApp message
was sent and no real Baileys session was initialized.

## Truthful blocked states

- MongoDB remains disabled behind `PHASE5_DATABASE_ENABLED`.
- Database-dependent Phase 8 APIs return HTTP `503 DATABASE_UNAVAILABLE` before
  auth/Prisma.
- Speaking voice upload remains unavailable when StorageProvider is unavailable.
- WhatsApp returns `PROVIDER_UNAVAILABLE`.
- WhatsApp auth returns `PERSISTENCE_UNAVAILABLE`.
- No QR or connected state is fabricated.
- No email is sent without a configured provider.

## Operational limitations

The current deployment does not include a production-safe encrypted persistent
Baileys auth store, so WhatsApp cannot connect or restore authentication.
Durable queue/account/contact/conversation persistence also remains blocked by
MongoDB. Realtime integration with authenticated sockets remains explicitly
blocked from live integration testing for the same reason.

## Scope boundary

Phase 1–7 behavior remains frozen except for additive Phase 8 permissions,
middleware pass-through, schema relations, and the canonical realtime extension.
Phase 9 has not started.