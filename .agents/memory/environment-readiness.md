---
name: Environment readiness
description: Deployment environment requirements and secret-boundary rules discovered during readiness verification.
---

The application datasource is MongoDB-only and requires `MONGODB_URI` in the
runtime environment; do not substitute a local URI or another database when it
is missing. Server authentication secrets must remain in process environment
and must not be copied into Next.js client-exposed configuration.

**Why:** A development workflow can serve the homepage while database-backed
routes fail, and Next.js `env` configuration can expose values to browser code.

**How to apply:** Before database or deployment verification, check secure
environment presence without printing values, use read-only checks only, and
keep deployment secrets out of `next.config` public env settings.