# Phase 1 Architecture Cleanup Plan

## Frozen decisions

- MongoDB is the only application database.
- Render is the production hosting target.
- The existing Next.js application remains the compatibility shell during the rebuild.
- Phase 1 adds boundaries and safety checks; it does not replace the login UI, delete legacy routes, or migrate data.
- Server code owns identity, role resolution, permissions, business rules, and secrets.

## Safe foundation delivered

The new server-side foundation is organized around authorization, validation,
errors, audit events, notifications, realtime policy, QMeet, and WhatsApp
provider boundaries. These modules do not create new database collections.

## Deferred until a reviewed migration contract

- OTP persistence and delivery models.
- Notification, WhatsApp, QMeet, and target-domain collections.
- Level and staff-permission schema additions.
- Replacement authentication UX.
- Removal of legacy models, routes, and components.
- Production deployment changes.
