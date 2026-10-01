# Render Readiness — Phase 3.5

## Result

Render with a persistent Node service is the selected production target. The
project is **not yet verified ready to deploy**: this workspace's secrets do
not establish that the matching values are configured in Render, and Render's
service environment and database connectivity have not been verified here.
No Render deployment or production database operation was performed as part of
the hosting decision.

## Verified

- Build command: `npm run build`
- Start command: `npm start`
- Existing Replit workflow: `Be Fluent Server` → `npm run dev`
- Node runtime: Node 20.20.0 in the current environment
- Prisma datasource: MongoDB via `env("MONGODB_URI")`
- Prisma validate/generate: passed with a non-connected placeholder
- Server startup: passed on port 5000
- Server now respects `PORT` for Render-style deployment
- Homepage: HTTP 200
- TypeScript: passed
- Foundation, Phase 2, and Phase 3 tests: passed
- Filesystem: uploads currently use local project storage; this is not durable
  storage on Render

## Not yet verified

- Read-only MongoDB connectivity from the Render service; verify `MONGODB_URI`
  in Render rather than assuming a Replit workspace secret is present there
- Render health check: no dedicated health endpoint exists
- Production email delivery and its required provider secret; development
  credentials are not reused
- Production WhatsApp OTP delivery and its provider configuration
- Production session signing configuration (`NEXTAUTH_SECRET` or the supported
  `SESSION_SECRET` fallback)
- Durable uploads and WhatsApp worker storage

## Required before deployment

1. Configure and verify `MONGODB_URI` in the Render service's secret settings.
2. Configure the session-signing secret and any OTP/email provider secrets
   required by the features enabled in production.
3. Run a read-only Prisma/MongoDB connectivity check in the target environment.
4. Configure a dedicated unauthenticated health endpoint or an equivalent
   Render health check path.
5. Replace local upload assumptions with durable object storage before relying
   on uploaded assets.
6. Confirm `PORT` is supplied by Render and that the service binds to
   `0.0.0.0`.

No production infrastructure or database data was changed by Phase 3.5.