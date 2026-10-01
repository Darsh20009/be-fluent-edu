# Deployment Architecture

## Target

- Repository: GitHub
- Host: Render persistent Node service (confirmed production target)
- Runtime: Next.js with the custom Node server
- Database: MongoDB
- Web port: `PORT` with the local compatibility default of 5000

## Commands

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: an authenticated-free endpoint should be added before the
  Render service is created; the current home page is not a sufficient health
  contract.

## Environment

Production secrets belong in Render Secret Environment Variables. `.env.example`
contains placeholders only. `MONGODB_URI` is canonical; PostgreSQL, SQLite,
AWS database credentials, and Vercel-only variables are not part of the target
application contract.

The Replit workspace and its deployment settings are for development and
preview; they do not configure the Render production service. Verify each
required value in Render's secret settings before a production rollout.

## Persistent services

The web service owns Next.js and the canonical Socket.IO server. A future
WhatsApp worker must be a separate persistent process or durable worker. Its
Baileys auth state cannot rely on Render's ephemeral local filesystem. Use a
durable, access-controlled storage strategy before enabling WhatsApp.

## Current blockers

- Any provider credentials exposed in past conversations or attachments must
  be revoked and rotated before those integrations are enabled. New values
  belong only in Render's secret settings.
- Local receipt/uploads are not durable production storage.
- No Render manifest or production health check exists yet.
- Build-time database behavior must be verified without weakening runtime
  connection failures.
