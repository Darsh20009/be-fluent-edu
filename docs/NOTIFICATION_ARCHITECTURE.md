# Notification Architecture

## Decision

Notifications are event-driven and channel-aware. Supported channels are
`IN_APP`, `WHATSAPP`, and `EMAIL`.

`lib/notifications` defines the event vocabulary, message contract, and a
transport-based `NotificationService`. It does not send every database event
to WhatsApp.

## Events

Initial meaningful events include class scheduling/start/end, feedback
publication, homework assignment/review, subscription approval, group
assignment, important account events, and critical WhatsApp events.

## Existing durable outbox

Phase 7 added one `Notification` record per event recipient and channel. Its
deterministic `dedupeKey` makes event creation idempotent. Email notifications
start as `PENDING` and are claimed as `PROCESSING` by the protected email
outbox worker; successful sends become `SENT`, and terminal failures become
`FAILED`. The worker retries retryable provider failures up to three times in
one invocation and uses a stable Qirox idempotency key. A stale `PROCESSING`
record can be reclaimed after the worker lock timeout.

The worker honors the existing `PHASE5_DATABASE_ENABLED` guard. It does not
enable Phase 7 or change database configuration. The current Prisma model does
not persist an attempt counter or provider response ID.

## Email provider boundary

All application email goes through the server-side `sendEmail` service. It
converts existing HTML templates to text for the Qirox email API, never sends
from browser components, and returns only safe result codes. Development uses
`QIROX_EMAIL_API_KEY`; production requires the separate
`QIROX_EMAIL_API_KEY_PRODUCTION` secret. Provider credentials are not returned
to callers or persisted in notification records.
