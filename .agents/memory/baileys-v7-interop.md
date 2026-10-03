---
name: Baileys v7 ESM interop
description: Runtime import behavior for Baileys v7 under the project's CommonJS TypeScript test loader.
---

Baileys v7's root module depends on `whatsapp-rust-bridge`, whose package exports
support ESM imports but not CommonJS `require`. A static runtime import from
TypeScript failed under the project's CJS test loader with
`ERR_PACKAGE_PATH_NOT_EXPORTED` before any socket was created.

**Why:** A persistence unit test imported the provider module and exposed this
loader/package-boundary mismatch even though TypeScript type checking passed.

**How to apply:** Keep Baileys runtime APIs behind native `await import()` during
provider startup, use type-only imports at module scope, and keep
BufferJSON-compatible serialization local so persistence tests do not load the
Baileys runtime graph.

Baileys v7's transitive `libsignal@6.0.0` writes complete Signal session objects
to `console.info` and `console.warn` when opening or closing sessions. These
objects include private and root keys, and the messages bypass Baileys' configured
logger.

**Why:** A WhatsApp OTP send exposed session key material in the development
workflow log despite the provider using a silent Baileys logger.

**How to apply:** Keep the targeted session-log filter installed before creating
the socket. Re-audit the dependency source before removing the filter after a
library upgrade.