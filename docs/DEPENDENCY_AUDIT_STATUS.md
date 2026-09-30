# Production dependency audit status

Checked on 2026-09-30 with `npm audit --omit=dev` and `npm ls --omit=dev --all`.

## Current result

The audit reports 11 vulnerable production package records: 3 critical, 4 high, 3 moderate, and 1 low. The installed production tree contains the affected package versions; these are not only stale lockfile entries. No dependencies were changed, and no audit fix or migration was run.

| Package | Installed version | Audit severity |
| --- | --- | --- |
| `next` | 16.3.5 | Critical |
| `next-auth` | 4.24.15 | Critical |
| `@auth/core` | 0.41.3 | Critical |
| `prisma` | 6.19.3 | High |
| `@prisma/config` | 6.19.3 | High |
| `deepmerge-ts` | 7.1.5 | High |
| `xlsx` | 0.18.5 | High |
| `dompurify` | 3.3.1 | Moderate |
| `baseline-browser-mapping` | 2.10.32 | Moderate |
| `fflate` | 0.8.2 | Moderate |
| `cookie` | 0.7.2 | Low |

Notable advisories include the Next.js `next/og` `ImageResponse` RCE, Auth.js and nested-cookie findings, Prisma/deepmerge findings, SheetJS prototype-pollution and ReDoS findings, and DOMPurify XSS findings. A source search found no application import of `next/og`/`ImageResponse`; the application use of `xlsx` is workbook export code. These observations do not clear or fix the dependency findings.

The existing Auth security review classifies the currently reported Auth.js vulnerable paths as unreachable through this application's runtime wiring. Keep that reachability assessment distinct from the unresolved audit results; do not report the packages as fixed. The delivery instruction forbids dependency upgrades and `npm audit fix --force`, so the findings remain for a separately approved security decision.