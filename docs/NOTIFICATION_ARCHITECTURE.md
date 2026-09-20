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

## Deferred persistence

The current schema has no Notification model, delivery status, retry count, or
outbox. Phase 1 therefore does not pretend that durable notification delivery
exists. A later additive design should include event ID, recipient, channel,
status, attempts, provider ID, timestamps, and idempotency key.
