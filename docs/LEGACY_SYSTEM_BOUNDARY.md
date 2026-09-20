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
