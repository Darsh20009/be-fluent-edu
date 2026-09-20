# Authentication Architecture

## Phase 1 status

The existing NextAuth Credentials flow remains active for compatibility. The
existing public login and registration pages were not replaced.

The target architecture is one server-resolved authentication system for
students, teachers, admins, managers, and staff:

`Home → modal → normalized phone → WhatsApp OTP → server role resolution → dashboard`

Email is a fallback channel. The client never chooses its own role.

## OTP contract

`lib/auth/otp.ts` provides the non-persistent security primitives:

- six-digit random codes;
- HMAC hashing with `AUTH_SECRET` or `NEXTAUTH_SECRET`;
- constant-time hash comparison;
- five-minute expiry policy;
- attempt and resend policy constants.

Persistence, delivery, rate limiting, and one-time invalidation require an
additive MongoDB model and will be implemented with the OTP API in a later
authentication phase. No OTP is persisted by Phase 1.

## Required production controls

- Normalize phone numbers before lookup.
- Store only hashed OTP values.
- Invalidate a code after successful verification.
- Enforce expiry, attempt, resend, and IP/phone rate limits server-side.
- Record request and verification outcomes in `AuditLog` without secrets.
- Re-check account status and role for sensitive operations; JWT claims are not
  a substitute for server authorization.
