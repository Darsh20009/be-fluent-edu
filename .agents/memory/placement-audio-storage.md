---
name: Placement audio storage boundary
description: Storage constraint for short student speaking samples used in placement review.
---

Keep short placement speaking recordings in MongoDB only through the existing bounded upload path until an approved persistent file-storage route is available. Do not bypass the workspace package firewall or add an unapproved storage dependency.

**Why:** Installing the App Storage SDK was blocked by workspace package security policy, and no approved persistent storage route was available.

**How to apply:** Preserve the upload size cap and admin-only audio retrieval. Revisit the storage choice if an approved file-storage route becomes available or recording requirements exceed the current cap.