# Phase 3 Authentication Migration Notes

## Existing authentication

The project currently has:

- NextAuth Credentials with email/phone plus password
- JWT sessions
- public login and registration pages
- legacy forgot/reset password routes
- direct `getServerSession` checks in many handlers
- centralized permission constants and helper functions

## Compatibility strategy

1. Keep the current credentials provider for existing users.
2. Add the `otp` credentials provider to the same NextAuth instance.
3. New OTP users use the same `User` record and `role = STUDENT`; no second
   identity table or auth cookie is created.
4. Store canonical phone data in `normalizedPhone` while preserving `phone`.
5. Re-read `User` on server authorization so role/status changes apply to
   protected requests.
6. Treat legacy `ASSISTANT` role claims as `STAFF` for compatibility, but do
   not grant staff implicit permissions.
7. Keep public login/register pages until the later frontend phase.

## Identity conflict handling

- Normalized phone is checked against both `normalizedPhone` and legacy
  `phone`.
- Email is compared case-insensitively at the application boundary.
- OTP registration refuses to create a second user when an identity already
  exists.
- Duplicate production records are reported for review; no automatic merge is
  executed.

## Database safety

Phase 3 adds `AuthOtpChallenge` and `AuthRateLimit` plus user relations. The
schema remains MongoDB-only and additive. No `db push`, reset, collection
drop, user rewrite, or production backfill was executed.

Before production rollout:

- snapshot MongoDB;
- inspect duplicate normalized phones and emails;
- review compound indexes and missing-field behavior;
- configure delivery providers;
- run the manual acceptance flow with a safe test provider;
- approve the eventual backfill and rollback switch.

## Legacy classification

| Area | Decision |
|---|---|
| NextAuth credentials | KEEP |
| Login/register pages | KEEP until frontend phase |
| Password recovery | ADAPT as compatibility-only |
| Password inspection endpoint | REMOVE_LATER; currently disabled |
| Direct session checks | ADAPT toward reusable server helpers |
| `ASSISTANT` role | ADAPT to STAFF compatibility mapping |
| Existing User records | KEEP; no mass activation or rewrite |