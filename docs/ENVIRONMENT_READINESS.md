# Environment Readiness — Phase 3.5

## Current result

`MONGODB_URI` is **required but not configured** in the development workflow.
It is also not present in the checked Replit Secret inventory. No URI was
printed, fabricated, stored in source, or substituted with localhost.

Because the URI is unavailable, a read-only MongoDB connectivity test was not
performed. Prisma schema validation and client generation were performed with
a non-connected placeholder only; they did not connect to or write to MongoDB.

## Environment inventory

| Environment variable | Purpose | Required? | Configured? | Used by | Secret/public | Notes |
|---|---|---:|---:|---|---|---|
| `MONGODB_URI` | Prisma MongoDB datasource | Yes | No | Prisma, runtime DB routes | Secret | Configure in the `Be Fluent Server` workflow environment |
| `NEXTAUTH_SECRET` | NextAuth signing/encryption | Yes for deployment | No | NextAuth, middleware | Secret | Do not expose through Next.js client config |
| `AUTH_SECRET` | OTP hashing fallback | Optional if another auth secret exists | No | OTP hashing | Secret | Prefer a managed auth secret |
| `SESSION_SECRET` | Existing auth secret fallback | Optional compatibility | Yes | Auth fallback | Secret | Presence confirmed; value was not accessed or displayed |
| `NEXTAUTH_URL` | NextAuth canonical URL | Deployment-specific | Yes as shared env | NextAuth | Public configuration | Shared value is configured without being treated as a secret |
| `NEXT_PUBLIC_APP_URL` | Public application URL | Optional | No | Email/assets and public links | Public | Placeholder documented in `.env.example` |
| `NODE_ENV` | Runtime mode | Yes at runtime | Runtime-managed/implicit | Next.js/server | Public configuration | Development workflow currently runs non-production |
| `PORT` | Server listening port | Yes for Render | Runtime/deployment | `start-server.js` | Public configuration | Server now uses `PORT`, defaulting to 5000 |
| `QIROX_EMAIL_API_KEY` | Qirox email delivery | Required for development email | Yes as shared secret | Email provider | Secret | Visible to both development and production runtimes; application code uses it only outside production |
| `QIROX_EMAIL_API_KEY_PRODUCTION` | Qirox production email delivery | Required for production email | No | Email provider | Secret | Production deliberately does not reuse the development key |
| `WHATSAPP_OTP_PROVIDER_URL` | WhatsApp OTP provider endpoint | Required for real WhatsApp OTP | No | OTP provider | Secret/configuration | Separate from CRM/Baileys |
| `WHATSAPP_OTP_PROVIDER_TOKEN` | WhatsApp provider credential | Required with provider | No | OTP provider | Secret | Not configured |
| `QMEET_API_BASE_URL` | Future QMeet provider endpoint | Optional/out of scope | No | QMeet adapter | Configuration | Not needed for Phase 3.5 |
| `QMEET_API_KEY` | Future QMeet credential | Optional/out of scope | No | QMeet adapter | Secret | Not needed for Phase 3.5 |
| `OPENAI_API_KEY` | AI features | Optional | No | AI routes | Secret | Those routes fail explicitly when unavailable |
| `KIMI_API_KEY` / `MOONSHOT_API_KEY` | AI provider compatibility | Optional/legacy | No | Kimi adapter | Secret | No value was accessed |
| `AUTH_OTP_TEST_MODE` | Safe development OTP provider | Development only | No | OTP provider | Public configuration | Must not be enabled in production |

`DATABASE_URL` and `EXTERNAL_DATABASE_URL` appear only in legacy PostgreSQL
scripts and are not the application datasource. They must not replace
`MONGODB_URI`.

## Where configuration belongs

- Replit development: Secrets/environment configuration used by
  `Be Fluent Server`.
- Render: service Environment Variables/Secret Files for the production
  service. No Render configuration exists in this repository.
- `.env.example`: placeholders only; no real credentials are present.

## Database-dependent routes

Most `/api/admin/*`, student, teacher, session, subscription, package, cart,
auth OTP, and content progress routes require Prisma/MongoDB. With
`MONGODB_URI` missing, they fail at the database boundary. The application
does not return fake success. The homepage and static pages can still render.

Observed during this verification: `/api/coupons/active` returned HTTP 500 with
the existing missing-MongoDB diagnostic, while `/` returned HTTP 200.