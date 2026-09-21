# MongoDB Runtime Diagnostic

## Scope

This was an inspection-only diagnostic. No application code, Prisma schema,
health behavior, workflow name, workflow command, secret, environment file, or
database data was changed.

No MongoDB URI value was printed, read into output, copied, or stored.

## 1. Secret Store status and scope

- `MONGODB_URI` key: **present** in the Replit Secret Store.
- Reported by the secure environment inspection for:
  - shared
  - development
  - production
- No workflow-specific secret scope was exposed by the environment inspection
  interface.
- Actual secret value: **not accessed or displayed**.

Secret Store key presence does not match the environment inherited by the
running workflow.

## 2. Workflow runtime

The existing workflow is:

- Name: `Be Fluent Server`
- State: running
- Command: `npm run dev`
- Port: 5000
- Working directory: `/home/runner/workspace`
- Runtime module: Node.js 20
- Process wrapper: none identified

The workflow is configured in `.replit` under the existing
`Be Fluent Server` workflow. No second workflow was created.

## 3. Process chain

The observed chain is:

```text
Replit workflow runtime
  → npm run dev
  → node start-server.js
  → next({ dev }) / Next.js request handler
  → app/api/health/route.ts
  → lib/prisma.ts
```

Findings:

- `package.json` maps `dev` directly to `node start-server.js`.
- `start-server.js` reads `process.env.MONGODB_URI` at startup using a
  presence-only check.
- `start-server.js` does not load dotenv, replace `process.env`, or spawn a
  child process.
- `lib/prisma.ts` reads `process.env.MONGODB_URI` and only logs a missing
  status; it does not replace or synthesize the value.
- The Next.js server runs in the same Node process started by
  `start-server.js`.

## 4. Environment propagation result

The variable is absent at the first application process check:

```text
Be Fluent Server
  → npm process: command is direct and has no environment override
  → Node start-server.js: MONGODB_URI absent
  → Next.js server: same Node process, absent
  → health route / Prisma initialization: absent
```

The propagation stop is therefore **before or at workflow environment
creation**, not inside Prisma, Next.js, `start-server.js`, or the health route.

Observed workflow output:

```text
MONGODB_URI is not set
```

Observed application checks:

- `GET /`: HTTP 200
- `GET /api/health`: HTTP 503
- Health database status: `not_configured`
- Health application status: `healthy`

## 5. Environment override inspection

- `.env`, `.env.local`, `.env.development`, and `.env.production`: not present.
- No application import of `dotenv` or `dotenv.config()` was found.
- No shell wrapper replaces the workflow command.
- No source assignment replaces `process.env`.
- The only `MONGODB_URI` application assignment is Prisma's datasource
  reference `env("MONGODB_URI")`.
- The test suite temporarily removes the variable inside one isolated test and
  restores only that test process; it does not affect the workflow.

The project contains no application-level override that explains the missing
workflow variable.

## 6. Replit inheritance expectation

Replit documentation states that Secrets are made available as environment
variables to the app and its workflows. The standard supported mechanism is
the Replit Secret Store, with workflow/run environment configuration available
through `.replit` when needed.

This project was tested with the existing Secret Store entry and the existing
workflow. A validated `[run]` / `[run.env]` reference was temporarily tested
without a secret value, but the restarted workflow still reported the
variable as missing. That configuration was removed.

The current evidence shows a mismatch between the Secret Store entry and the
environment actually provisioned to this workflow. It does not show an
application-side cause.

## 7. Exact blocker

The blocker is the Replit-managed runtime environment for `Be Fluent Server`:
the workflow process is not receiving the existing Secret Store variable.

Because `process.env.MONGODB_URI` is absent, Prisma cannot initialize against
the configured MongoDB datasource and the health endpoint correctly returns
`database: not_configured`.

## 8. Safe next action

A workspace owner or Replit runtime administrator must inspect or repair the
Secret Store attachment/inheritance for the existing `Be Fluent Server`
workflow. The safe acceptance check is:

1. Restart the existing workflow.
2. Confirm the startup presence check without printing the value.
3. Confirm `GET /` returns 200.
4. Confirm `GET /api/health` reports `application: healthy` and
   `database: healthy`.

No application workaround, hardcoded URI, localhost fallback, new workflow,
or database change should be used.

## Stop condition

Phase 5 was not started. No further workaround was attempted.

## Diagnostic integrity

`git diff --check` was run. This diagnostic produced no application changes.