# Phase 3 Authentication Security

## Authentication boundary

The application keeps one NextAuth system for all roles. Password credentials
remain only as a compatibility provider; the target provider is `otp`, which
resolves the user on the server and never accepts a client-supplied role,
permission, or user ID.

### OTP policy

- Six digits, HMAC-SHA256 hash only
- Five-minute expiry
- Five verification attempts
- Three resends per ten-minute window
- One-minute resend cooldown
- Phone and IP request/verification rate limits
- Newer challenges invalidate older challenges
- Successful, expired, and exhausted challenges are invalidated
- Generic responses avoid account enumeration
- Audit events never contain OTP values

OTP records are stored in `AuthOtpChallenge`; counters and blocked windows are
stored in `AuthRateLimit`. No production migration or backfill was executed.

## Phone normalization

`normalizePhone` is the single canonical utility. It:

- accepts `010`, `011`, `012`, and `015` Egyptian mobile formats;
- converts them to `+20` E.164-style values;
- accepts `00` and `+` international prefixes;
- rejects non-numeric input;
- validates Egyptian mobile prefixes while preserving a future-country path.

Existing `phone` values are retained. `normalizedPhone` is additive and must be
reconciled before any production unique constraint is added.

## Delivery providers

`sendVerificationCode` is the only authentication delivery boundary.

- WhatsApp uses `WHATSAPP_OTP_PROVIDER_URL` and an optional token environment
  variable.
- Email uses the existing SMTP2GO integration and the configured
  `SMTP2GO_FROM_EMAIL`, defaulting to `befluent@qirox.online`.
- Development can use `AUTH_OTP_TEST_MODE=true` for a non-network provider.
- The authentication provider does not import or depend on Baileys CRM code.

Provider credentials are never hardcoded or written to audit records.

## Sessions and status

NextAuth JWT sessions remain for compatibility, with a 30-day maximum age and
15-minute update age. Each server-side `requireSession` call re-reads the
current `User`, role, account status, and granted staff permissions.

`ACTIVE` is required. `SUSPENDED`, `DISABLED`, and inactive `PENDING` users are
rejected even if a stale session cookie exists. Legacy users with `isActive`
true and no meaningful status are treated as active until migrated.

The API middleware now protects `/api/*` by default, with a small explicit
public allowlist. Dashboard access also requires a usable session.

## RBAC

Roles are server-resolved:

`STUDENT`, `TEACHER`, `ADMIN`, `MANAGER`, `STAFF`

Staff permissions come from `StaffPermission` and are not granted merely by
the client role claim. Managers receive management permissions without the
full admin permission set. Reusable helpers are available through
`requireRole`, `requirePermission`, `requireAnyPermission`, and
`requireAllPermissions`.

## Audit events

Authentication events include OTP request/sent/verified/failed/expired,
login success/failure, logout, session revocation, role change, suspension,
and reactivation. Audit sanitization excludes OTP, password, token, secret,
credential, and API-key fields.

## Compatibility and known limits

- Existing login/register pages remain in place.
- The primary modal UX is deferred to the frontend phase.
- Existing password recovery routes are retained only as compatibility
  boundaries; password inspection is disabled and reset now requires an
  authenticated admin-management permission.
- Provider setup and actual WhatsApp delivery require environment configuration.
- No WhatsApp CRM, Baileys, QMeet, Speaking Rooms, dashboards, or Phase 4 work
  was started.