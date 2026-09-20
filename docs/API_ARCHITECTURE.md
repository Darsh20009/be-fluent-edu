# API Architecture

## Contract

New APIs follow this order:

`Route → Zod validation → authentication → authorization → business rule → service → database → response`

The foundational helpers are:

- `lib/validation`: normalized phone and shared request schemas.
- `lib/authorization`: roles, permission definitions, and centralized checks.
- `lib/errors`: `AppError`, safe error envelopes, and Zod error formatting.
- `lib/api`: shared success/error exports and a session gate.

## Response envelope

Successful responses use:

```json
{ "ok": true, "data": {} }
```

Known failures use:

```json
{ "ok": false, "error": { "code": "FORBIDDEN", "message": "..." } }
```

Technical details are logged server-side and are not returned to users.
Existing routes are not mass-refactored in Phase 1; new routes must use this
contract and existing routes should be migrated domain by domain.
