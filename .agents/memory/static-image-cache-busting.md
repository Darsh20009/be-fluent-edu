---
name: Static image cache busting
description: Replacing public images in the Next.js preview without stale optimized output
---

When a public image is replaced but keeps the same URL, Next Image or the browser may continue serving the previously optimized output. Use a new stable filename and update the consuming constant when visual verification must reflect the new asset immediately.

**Why:** Reusing the original path produced a stale preview even though the file on disk had the new dimensions and content.

**How to apply:** For a visual asset replacement, add the new asset under a distinct public path, update references, restart the workflow, and verify the rendered preview.