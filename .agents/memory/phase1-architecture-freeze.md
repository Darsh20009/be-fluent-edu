---
name: Phase 1 architecture freeze
description: Durable constraints for the B Fluent EDU rebuild foundation.
---

The rebuild uses MongoDB as the only application database and keeps the current
compatibility shell while new domain boundaries are introduced additively.

**Why:** The repository contains overlapping MongoDB, PostgreSQL, SQLite,
legacy-auth, and duplicate realtime assumptions. Destructive cleanup before
mapping production data would risk users, subscriptions, sessions, and learning
history.

**How to apply:** Before adding target-domain models or removing legacy routes,
map existing data and references, preserve rollback paths, and obtain explicit
approval for any schema or authentication migration.