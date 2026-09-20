# B Fluent EDU — Phase 2 Migration Plan

**Status:** Planned only  
**Database operations performed:** None  
**Production data changed:** No

## 1. Safe work completed in Phase 2

1. Inspected the active MongoDB Prisma schema and current delegate usage.
2. Created `docs/PHASE_2_MODEL_MAP.md`.
3. Added additive target-domain contracts to `prisma/schema.prisma`.
4. Preserved all current models, fields, legacy relations, and legacy route
   contracts.
5. Added target indexes and stable relationship uniqueness constraints.
6. Validated the schema with Prisma using a non-connected local placeholder
   MongoDB URI.

No data was copied, updated, deleted, reset, or pushed.

## 2. What can be migrated safely later

These are candidates for an idempotent migration after production snapshots
and field ownership are approved:

- Create `Level` and `LevelStage` reference records from an approved official
  level catalog.
- Project `StudentProfile.levelCurrent` into `officialLevelId` only after an
  admin-owned reconciliation report confirms the value and preserves the
  original string.
- Project `Lesson`, `ListeningContent`, conversation resources, and approved
  vocabulary content into `Resource` using `(legacyModel, legacyId)`.
- Project existing user-owned progress into `LearningProgress` with a source
  marker and deterministic upsert key.
- Create `Enrollment` records from approved subscription/group assignments,
  never from payment status alone.
- Create `SessionParticipant` and `Attendance` projections from
  `SessionStudent` only after deciding how duplicate attendance semantics are
  handled.
- Create QMeet records only from a provider export or verified API response;
  existing generic links are not sufficient.
- Copy teacher feedback into target feedback records only with a source
  reference and a reviewable mapping.
- Store notification and WhatsApp history only from an approved retention and
  privacy policy.

Every migration must be resumable, idempotent, auditable, and able to report
unmapped rows without failing silently.

## 3. What cannot be migrated yet

- `User.phone` cannot become authoritative normalized phone identity until
  duplicate and missing numbers are reconciled.
- `StudentProfile.levelCurrent` cannot be deleted or blindly treated as the
  official target level.
- `SessionStudent` cannot be deleted or fully split until membership versus
  attendance semantics are mapped row by row.
- Generic `Chat` cannot be reclassified as speaking-room or CRM history without
  retention, moderation, and participant rules.
- `LiveSession` and `LiveParticipant` cannot be treated as QMeet records without
  provider mapping.
- Base64 `VoiceRecording.audioData` cannot be moved to durable storage without
  an object-storage contract and integrity verification.
- Legacy placement, tests, writing tests, gamification, badges, and streaks
  cannot be removed while their route and history dependencies remain active.
- Optional phone/provider fields cannot receive production unique indexes until
  MongoDB missing-field behavior and duplicates are checked.

## 4. Required migration sequence

### Gate 0 — Snapshot and approval

1. Confirm the production MongoDB connection through the approved environment.
2. Take a backup/snapshot and record collection counts and indexes.
3. Export representative documents for every affected legacy model.
4. Confirm the target level catalog, role semantics, retention policy, and
   ownership rules with product/admin stakeholders.
5. Review the Prisma schema diff and stop if Prisma reports a destructive
   operation.

### Gate 1 — Reference data

1. Insert official `Level` records with stable codes.
2. Insert `LevelStage` records with unique `(levelId, code)` pairs.
3. Insert approved `Skill` records.
4. Verify counts, codes, and indexes.

### Gate 2 — Identity and learning projections

1. Normalize phone values into a report first; do not write automatically.
2. Create target `StudentLearningProfile` records only for reconciled users.
3. Project resources with deterministic `(legacyModel, legacyId)` keys.
4. Project progress while keeping legacy records untouched.
5. Record every skipped or conflicting row.

### Gate 3 — Commercial and group placement

1. Reconcile subscription/package ownership.
2. Create `Enrollment` records for explicitly approved service placements.
3. Create groups and schedules from approved staff data.
4. Add group members only after enrollment and user IDs are verified.
5. Do not run automatic matching in this phase.

### Gate 4 — Classes, feedback, and homework

1. Reconcile sessions and teacher profile IDs.
2. Project participants and attendance with a source-row audit trail.
3. Import verified QMeet mappings only.
4. Project feedback/homework records after teacher review of field mappings.

### Gate 5 — Communications and intelligence

1. Define notification retention and delivery policies.
2. Import WhatsApp history only where consent, ownership, and idempotency are
   established.
3. Enable queue workers only in a later implementation phase.
4. Store AI interactions/recommendations only with privacy and retention
   controls.

## 5. Rollback considerations

- Additive records can be marked inactive or isolated by migration batch; do
  not delete them during the first rollout.
- Every migrated record needs a batch identifier in the migration audit
  mechanism or an equivalent external manifest.
- Legacy records remain readable until target reads have been compared against
  legacy reads.
- Rollback means disabling target reads/projections and restoring the previous
  application path, not deleting target collections.
- If an index build or schema application reports a destructive change, stop and
  restore the pre-change checkpoint. Do not use `--accept-data-loss`.
- Any duplicate/uniqueness conflict must be quarantined for review rather than
  resolved by overwriting a production document.

## 6. Verification checklist for a future data operation

- [ ] Backup/snapshot verified and restorable.
- [ ] Production collection counts recorded.
- [ ] Current indexes recorded.
- [ ] Schema diff reviewed and non-destructive.
- [ ] Migration batch is resumable and idempotent.
- [ ] Unmapped/conflicting records are reported.
- [ ] Legacy and target counts reconciled.
- [ ] Ownership and authorization checks reviewed.
- [ ] Read-path comparison completed.
- [ ] Rollback switch tested.
- [ ] No passwords, OTPs, API keys, or secrets copied into target records.