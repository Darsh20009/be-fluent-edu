---
name: MongoDB optional OTP state fields
description: Prisma query behavior for unset optional OTP timestamps in MongoDB.
---

For active OTP challenges, query optional state timestamps as either explicitly null or unset. Apply the same predicate to verification, resend selection, and supersession updates.

**Why:** Challenge records can omit uninitialized timestamps such as `consumedAt` and `invalidatedAt`; matching only `null` can exclude an otherwise valid record from Prisma queries.

**How to apply:** When filtering MongoDB-backed OTP state, include the Prisma `isSet: false` case alongside `null`, and keep raw phone numbers, codes, and challenge IDs out of logs.