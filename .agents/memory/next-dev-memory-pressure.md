---
name: Next.js dev memory pressure
description: Resource constraints, failed tuning approaches, and reliable static/runtime measurement practices for the custom Next.js development server.
---

On this Replit workspace, a cold Next.js development compile of the Baileys QR route can approach the 8 GiB container memory limit when Turbopack plugin evaluation uses separate child processes. The server has previously been OOM-killed during route compilation. Externalizing the Baileys package and using Turbopack's worker-thread plugin runtime reduced observed memory pressure; warm route requests then returned in well under a second, while cold route compilation still took several seconds or longer.

**Why:** The workflow logs showed the QR route taking tens of seconds before the process was killed. Process and cgroup measurements identified the dev server, Turbopack plugin worker, and editor language server as the main memory consumers; after switching the plugin runtime to worker threads, cgroup usage dropped by about 1 GiB in the same session.

**How to apply:** When the dev app is slow or dies during a first route visit, check workflow logs and cgroup memory before changing ports. Measure both the first request and a warm repeat so compilation cost is not mistaken for steady-state application latency.

Do not run full-project TypeScript checks concurrently with cold development compilation in this workspace. Multiple checks plus the editor language server and Next.js can exceed the shared memory limit and interrupt the whole environment, not only the web server.

**Why:** During learning-flow work, concurrent TypeScript checks each consumed substantial memory while the development server compiled role routes; the container recorded additional OOM kills and browser testing disconnected before reaching authenticated flows. A Webpack trial also produced repeated refreshes and a transient empty manifest, so changing bundlers is not a verified remedy.

**How to apply:** Finish implementation helpers and run one combined static verification while the web server is paused; then start the original development pipeline for browser checks. Treat a successful root screenshot separately from authenticated-route verification.

Do not assume aggressive full snapshot eviction fixes preview stability. An experiment left a long admin cold load, a browser reload timeout, and an environment disconnection; it did not establish improvement and was removed. Preserve adaptive eviction unless a new controlled comparison justifies changing it.

**Why:** Releasing a graph after each snapshot trades memory retention for rehydration work. A smaller retained graph is not by itself evidence that a user can finish loading a dashboard.

**How to apply:** Measure page availability and a repeat request alongside memory. Avoid switching bundlers or eviction modes repeatedly without evidence; keep production settings separate.

Pausing development is not enough to establish that its generated artifacts are valid after an interruption.

**Why:** Interrupted generators have left malformed type output after their processes exited. Such syntax failures are different from application type errors.

**How to apply:** Validate generated artifacts freshly before interpreting their failures as source-code defects. Do not weaken application checks or edit generated output to conceal the problem.

Persist sanitized resource checkpoints in the workspace before a high-risk browser run.

**Why:** A workspace restart removed temporary measurement logs and reset cgroup OOM counters. A fresh zero counter cannot establish what happened before the restart.

**How to apply:** Record phase boundaries and resource/timing totals without credentials or user records. Distinguish authenticated HTTP access, rendered browser UI, and whole-journey completion.