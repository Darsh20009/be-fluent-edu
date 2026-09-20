# Phase 4 boundary update

The new Phase 4 foundation uses the existing authentication system and Phase 2
models for people, levels, stages, profiles, and learning profiles. New
primary foundation pages are separate from legacy learning systems.

Legacy systems remain reachable by direct URL but are not part of the Phase 4
primary navigation:

- placement tests and exam flows
- writing tests
- leaderboard, achievements, and XP
- subscriptions, packages, and groups
- homework, feedback, QMeet, WhatsApp CRM, Baileys, and Speaking Rooms

Do not add new dependencies from the Phase 4 people/profile/level APIs into
those legacy domains.
# Legacy System Boundary

Phase 1 does not delete legacy routes, components, models, or user data.

| Legacy system | Classification | Replacement direction | Planned removal |
|---|---|---|---|
| Placement Test | REMOVE LATER | Staff-controlled level assignment and level history | After data mapping and new level workflow |
| Generic Tests | DEPRECATE | Learning progress and teacher feedback | After route dependency migration |
| Writing Tests | DEPRECATE | Homework and feedback | After submission history migration |
| Vocabulary Tests / Test Words | DEPRECATE | Guided learning resources and progress | After student navigation migration |
| Trial booking | KEEP temporarily | Lead/contact workflow | Review with operations |
| Exam dashboard patterns | REPLACE | Student Home, Learning, Homework, Feedback | During internal UI rebuild |
| Leaderboard | REMOVE LATER | Private goals and progress | After navigation migration |
| Achievement-heavy UI | DEPRECATE | Calm progress and goals | During student UI rebuild |
| Gamification / XP / streaks | REMOVE LATER | Goals and learning progress | Only after history decision |
| Old credentials UX | REPLACE | Home modal with phone/WhatsApp OTP | After OTP persistence/delivery is ready |
| Old dashboard architecture | REPLACE | Role-specific target information architecture | Later frontend phases |

Each item remains available until all route, API, model, and data consumers are
mapped and a rollback/export plan is approved.

## Phase 2 dependency notes

The Phase 2 model map confirmed these dependencies that must remain protected:

- `SessionStudent` currently combines session membership and attendance. It
  cannot be removed until rows are reconciled into `SessionParticipant` and
  `Attendance`.
- `Assignment` and `Submission` overlap with the target homework workflow.
  Existing grades and feedback must remain until a source-aware projection is
  approved.
- `StudentProfile` placement fields and placement-attempt collections remain
  historical evidence. They are not silently replaced by level recommendations.
- `LiveSession`, `LiveParticipant`, and `Chat` use scalar or legacy semantics;
  they must not be reclassified as QMeet or Speaking Room records without
  provider, ownership, and retention mapping.
- `WritingTest`, `WritingTestSubmission`, `FreeWriting`, and gamification
  records remain readable while the target homework, feedback, and progress
  domains are introduced additively.
