---
name: Next.js dev memory pressure
description: Replit resource behavior for the Next.js custom development server when compiling the WhatsApp provider and QR routes.
---

On this Replit workspace, a cold Next.js development compile of the Baileys QR route can approach the 8 GiB container memory limit when Turbopack plugin evaluation uses separate child processes. The server has previously been OOM-killed during route compilation. Externalizing the Baileys package and using Turbopack's worker-thread plugin runtime reduced observed memory pressure; warm route requests then returned in well under a second, while cold route compilation still took several seconds or longer.

**Why:** The workflow logs showed the QR route taking tens of seconds before the process was killed. Process and cgroup measurements identified the dev server, Turbopack plugin worker, and editor language server as the main memory consumers; after switching the plugin runtime to worker threads, cgroup usage dropped by about 1 GiB in the same session.

**How to apply:** When the dev app is slow or dies during a first route visit, check workflow logs and cgroup memory before changing ports. Measure both the first request and a warm repeat so compilation cost is not mistaken for steady-state application latency.