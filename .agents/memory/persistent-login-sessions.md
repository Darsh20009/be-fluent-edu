---
name: Persistent login sessions
description: Be Fluent's user requirement for staying signed in on the same device and returning from the public homepage to the role dashboard.
---

Keep signed-in users on the same browser session across normal visits; returning to the public homepage must not force another login, and the account link should open the role-appropriate dashboard. Explicit sign-out remains available.

**Why:** The user explicitly requested persistent login and repeated the requirement.

**How to apply:** Preserve rolling session renewal and route authenticated users from login/home entry points to `/dashboard`. Browser cookie deletion, private browsing, or browser security limits can still end a session; explain those limits without implying the site can override them.