# Render Readiness — Phase 3.5

## Result

The project is **not ready for a real Render deployment yet** because the
required MongoDB connection and deployment authentication secrets are not
configured. No deployment was started or changed.

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

- Read-only MongoDB connectivity: blocked by missing `MONGODB_URI`
- Render health check: no dedicated health endpoint exists
- Production email delivery: SMTP2GO credentials are absent
- Production WhatsApp OTP delivery: provider URL/token are absent
- Production session signing: deployment secret is absent
- Durable uploads and WhatsApp worker storage

## Required before deployment

1. Configure `MONGODB_URI` as a secret on the Render service.
2. Configure `NEXTAUTH_SECRET` and the required OTP/email provider secrets.
3. Run a read-only Prisma/MongoDB connectivity check in the target environment.
4. Configure a dedicated unauthenticated health endpoint or an equivalent
   Render health check path.
5. Replace local upload assumptions with durable object storage before relying
   on uploaded assets.
6. Confirm `PORT` is supplied by Render and that the service binds to
   `0.0.0.0`.

No production infrastructure or database data was changed by Phase 3.5.