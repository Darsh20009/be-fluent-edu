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

During the September 21, 2026 connectivity verification, `MONGODB_URI` existed
in the Replit secret store but was not visible to the `Be Fluent Server`
workflow after restart. Treat secret-store presence and workflow-runtime
availability as separate checks.

**Why:** The application can serve `/` while the health endpoint reports
`database: not_configured`; claiming MongoDB connectivity from secret-store
presence alone would be incorrect.

**How to apply:** Confirm the running workflow's own startup/health behavior
before any database-dependent phase, without printing or requesting the URI.