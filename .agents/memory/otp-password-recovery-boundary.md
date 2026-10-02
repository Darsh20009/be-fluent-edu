---
name: OTP password recovery boundary
description: Authorization rule for Be Fluent self-service password recovery.
---

Self-service password recovery must first establish a valid session through OTP verification, then update the password using only the authenticated session's user ID. Never accept a client-supplied target user ID for recovery.

**Why:** The previous recovery page treated the OTP request as identity verification without asking for the code, then sent a user ID to an admin-only password endpoint.

**How to apply:** Keep recovery as OTP login followed by a same-user password update for all existing account roles. Keep administrator-initiated resets in a separately permission-gated route.