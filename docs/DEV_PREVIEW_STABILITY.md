# Development preview stability

Date: 2026-10-02. Measurements below use UTC and the development preview, not production.

## Scope and changes

- Retained the custom Next.js/Socket.IO server, Turbopack, worker-thread plugin evaluation, MongoDB, and the existing authentication/role rules.
- The development command now limits V8's old-generation heap to 2 GiB. This does **not** limit total process RSS or native allocations. Native Rust compilation defaults to two threads in the development process only.
- A full-memory-eviction experiment did not establish stable improvement and was removed. Next's default adaptive eviction and disk cache remain enabled.
- Development no longer registers this app's service worker and unregisters an existing same-origin `/sw.js` registration. The production registration and worker were not changed.
- `npm run typecheck` requires a paused preview, holds an exclusive process lock, generates a fresh Next route-type snapshot, and checks it through `tsconfig.check.json` with a 2 GiB V8 old-generation limit. It excludes the live `.next/dev` tree without narrowing application source coverage. Development startup rejects an active check. Raw `tsc` still must not be launched outside this guarded process.
- A live development route declaration was observed with a duplicated, malformed tail. Fresh type generation and the separate check configuration avoid using that interrupted live artifact; no generated declarations were hand-edited.
- Inventory showed 543 TypeScript inputs before the check adjustment, with no AppleDouble files, stale-cache backups, or `.local`/`.cache`/`.agents` tooling inputs. Large disk backups alone were not treated as proof of the memory problem, and no uploads or application data were deleted.

## Verification

- Full guarded TypeScript verification passed with the server paused.
- Targeted ESLint and whitespace checks passed.
- Real resource-policy checks rejected a second full check, dev startup during checking, and a check while the dev server was running.
- A browser pass displayed the usable password login and the ADMIN dashboard with a synthetic account. The admin reload hit the browser action timeout, and the environment disconnected. That pass **did not** verify teacher/student UI, reloads, logout isolation, or service-worker state.
- After the final resource adjustment, real credential authentication and authenticated HTTP requests succeeded for ADMIN, TEACHER, and STUDENT. Their rendered route responses and all referenced initial script assets returned 200.
- Teacher/student access to `/dashboard/admin` produced a streamed Next.js redirect to `/dashboard`, not an authorized admin view. A streamed redirect may retain HTTP 200 after headers are sent; the probe therefore checked redirect content as well as status.
- The final mobile `/auth/login` screenshot displayed the actual login dialog without a fatal runtime error.
- Only newly created synthetic `preview-qa-…@example.invalid` users were used. All three browser fixtures and all subsequent HTTP-probe fixtures were removed by exact ID. No real user was intentionally modified, and no email or notification was sent. These preview-only measurements did not create provider meetings; a later separately authorized QMeet test is recorded in `LEARNING_DELIVERY_VERIFICATION.md`.

## Timings

These are individual proxied HTTP requests, **not** end-to-end browser readiness or a load test. Disk caches were retained. “First” means first request in that probe, not a zero-cache build.

| Route / phase | First request | Immediate repeat |
| --- | ---: | ---: |
| Signed-out login before changes | 15.99 s | 1.43 s |
| Signed-out login after the initial experiment | 8.74 s | 1.89 s |
| Signed-out login later in that run | — | 0.16 s |
| Authenticated ADMIN, final configuration | 9.29 s | 3.96 s |
| Authenticated TEACHER, final follow-up probe | 19.44 s | 0.69 s |
| Authenticated STUDENT, final follow-up probe | 8.14 s | 10.82 s |

The student repeat was slower, so this is not evidence that every warm request is fast or that development recompilation has been eliminated.

Workflow attribution put 18.7 s of the 19.4 s teacher request in Next's framework phase, versus about 0.69 s in application code. The student repeat similarly spent 10.4 s in Next versus about 0.36 s in application code. That does not establish the precise cache/rebuild cause, but it does not justify blaming MongoDB or rewriting authentication from these samples. Detailed repeat-compilation profiling remains separate follow-up work.

The final teacher/student probe sampled a peak **6,819 MiB** of total container memory against an **8,192 MiB** limit. Its cgroup OOM-kill counter remained zero throughout the final probes. A previous workspace restart reset the counters and removed `/tmp` logs; the new zero counter must not be compared to the earlier historical count as proof that earlier kills disappeared.

Sanitized probe results are retained in `.local/diagnostics/preview-stability-measurements.jsonl`. They contain role names, status/timing/resource measurements, and cleanup counts, not passwords, session cookies, provider secrets, or user records.

## Limits and next work

- Signed-in TEACHER/STUDENT browser rendering, long-running sessions, logout isolation, and the full learning journey remain for the separate Tips/learning verification work.
- First compilation and some repeat requests still take seconds. This is bounded verification of development access, not a guarantee against every future environment interruption.
- Production runtime performance, authentication, database configuration, and deployment settings were not changed or measured.
- Production service-worker document/RSC caching needs a separate privacy review; this task deliberately changed development behavior only.