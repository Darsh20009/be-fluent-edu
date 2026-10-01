---
name: Manager access boundaries
description: Preserve the MANAGER role's broad but explicitly limited scope without granting the full ADMIN interface or permissions.
---

Keep MANAGER on a separate workspace. Where an existing admin-namespaced API represents a capability explicitly granted to MANAGER under its own permission name, authorize that matching manager capability without merging the role records or granting unrelated admin access.

**Why:** The master spec approves MANAGER's operational scope while explicitly keeping it distinct from ADMIN; silently treating MANAGER as ADMIN would exceed the approved scope.

**How to apply:** When adding manager navigation or API access, map only direct capability equivalents and test both allowed manager actions and denied system/staff-administration actions.