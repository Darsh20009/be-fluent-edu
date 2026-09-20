# Realtime Architecture

## Decision

Socket.IO is retained as the canonical realtime technology for the current
compatibility shell because the active workflow already hosts it inside
`start-server.js` at `/api/socket/io`.

SSE remains appropriate for future one-way notification streams, but it is not
introduced as a second general-purpose realtime server in Phase 1.

## Ownership and client policy

- `start-server.js` is the only active workflow entrypoint.
- The canonical path is `/api/socket/io`.
- Future connections must authenticate the server-side identity before joining
  user or class rooms.
- Room membership must be checked against the session/group relationship.
- Clients should use bounded reconnect attempts and re-subscribe after a drop.
- Event payloads require explicit schemas before new domains use them.

`server.js`, `server/socket.js`, and `lib/socket.ts` remain in place for
compatibility and auditability. They are not additional production entrypoints
and must be consolidated only after callers and deployment scripts are mapped.
