---
name: Dependency audit tree mismatches
description: How to interpret production dependency audits when the lockfile and installed node_modules differ.
---

Treat `npm audit --omit=dev` as a risk report for the locked production installation, not as a direct inventory of the current `node_modules`. Cross-check with `npm ls --omit=dev` to distinguish installed packages from lockfile entries, but keep missing lockfile peers unresolved until a clean installation confirms the deployment tree.

**Why:** Workspace scans can report package versions recorded in the lockfile but absent from the current installed tree. Calling those findings false positives based only on `npm ls` can miss packages that a clean deployment install will restore.

**How to apply:** During delivery triage, compare both views and do not claim a lockfile vulnerability is cleared solely because its package is missing from the current `node_modules`.