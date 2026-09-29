---
name: Socket.IO WebSocket override
description: Validation tradeoff for keeping a patched ws release with older Socket.IO adapter ranges.
---

When a `ws` security fix is outside a Socket.IO adapter's tilde range, a deliberate same-major override may be needed to prevent vulnerable nested copies from returning. The existing phase 8 tests skip the Socket.IO integration case, so they do not prove adapter compatibility; run a local loopback Socket.IO/WebSocket handshake and message round-trip when changing this override.

**Why:** The patched WebSocket release was newer than the adapter's declared minor range, while leaving the nested package untouched retained the production High finding.

**How to apply:** Keep the override until parent packages declare a patched range. Before removing or changing it, verify a real loopback connection and run the relevant unit tests.