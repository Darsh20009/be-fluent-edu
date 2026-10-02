---
name: Next.js dev memory pressure
description: Replit resource behavior for the Next.js custom development server when compiling the WhatsApp provider and QR routes.
---

On this Replit workspace, a cold Next.js development compile of the Baileys QR route can approach the 8 GiB container memory limit when Turbopack plugin evaluation uses separate child processes. The server has previously been OOM-killed during route compilation. Externalizing the Baileys package and using Turbopack's worker-thread plugin runtime reduced observed memory pressure; warm route requests then returned in well under a second, while cold route compilation still took several seconds or longer.

**Why:** The workflow logs showed the QR route taking tens of seconds before the process was killed. Process and cgroup measurements identified the dev server, Turbopack plugin worker, and editor language server as the main memory consumers; after switching the plugin runtime to worker threads, cgroup usage dropped by about 1 GiB in the same session.

**How to apply:** When the dev app is slow or dies during a first route visit, check workflow logs and cgroup memory before changing ports. Measure both the first request and a warm repeat so compilation cost is not mistaken for steady-state application latency.

Do not run full-project TypeScript checks concurrently with cold development compilation in this workspace. Multiple checks plus the editor language server and Next.js can exceed the shared memory limit and interrupt the whole environment, not only the web server.

**Why:** During learning-flow work, concurrent TypeScript checks each consumed substantial memory while the development server compiled role routes; the container recorded additional OOM kills and browser testing disconnected before reaching authenticated flows. A Webpack trial also produced repeated refreshes and a transient empty manifest, so changing bundlers is not a verified remedy.

**How to apply:** Finish implementation helpers and run one combined static verification while the web server is paused; then start the original development pipeline for browser checks. Treat a successful root screenshot separately from authenticated-route verification.