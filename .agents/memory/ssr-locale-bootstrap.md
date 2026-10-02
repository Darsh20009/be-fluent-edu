---
name: SSR locale bootstrap
description: Avoid hydration conflicts when the initial document language and direction depend on a saved locale.
---

Read the language cookie in the server root layout, set the initial HTML `lang` and `dir`, and pass that same locale into the client provider. Persist language changes to the cookie and refresh server-rendered content.

**Why:** A `beforeInteractive` locale script collided with Replit-injected devtools code and caused a hydration mismatch. Server-side cookie reading kept the first server and client renders aligned.

**How to apply:** For locale or other preferences that affect document attributes or server-rendered content, initialize from request cookies instead of injecting an early client script. Account for the root layout becoming request-rendered.