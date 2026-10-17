# Fitness Product Implementation Tickets

This roadmap translates [PRODUCT.md](../PRODUCT.md) into incremental, testable
delivery tickets. The first release prioritizes a useful personal fitness loop:
set goals, get a plan, train, eat toward a target, and track progress. Marketplace
and monetization work follows once the core loop is usable.

## Delivery order

| Ticket | Outcome | Status | Depends on |
| --- | --- | --- | --- |
| [FIT-001](./FIT-001-product-landing.md) | Replace starter messaging with the fitness product landing page | Complete | — |
| [FIT-002](./FIT-002-fitness-profile.md) | Collect and persist the user's fitness profile and goals | Complete | FIT-001 |
| [FIT-003](./FIT-003-personal-dashboard.md) | Build the authenticated fitness dashboard and feature navigation | Complete | FIT-002 |
| [FIT-004](./FIT-004-workout-plans.md) | Provide a goal-based workout plan and exercise library | Complete | FIT-002, FIT-003 |
| [FIT-005](./FIT-005-workout-progress.md) | Log workouts and review strength/training progress | Complete | FIT-004 |
| [FIT-006](./FIT-006-nutrition-tracking.md) | Set nutrition targets and track daily intake | Complete | FIT-002, FIT-003 |
| [FIT-007](./FIT-007-meal-generator.md) | Generate meals from available ingredients | Complete | FIT-006 |
| [FIT-008](./FIT-008-body-analysis.md) | Record measurements and provide cautious body-analysis history | Complete | FIT-002, FIT-005 |
| [FIT-009](./FIT-009-gym-discovery.md) | Find and compare nearby gyms | Complete | FIT-003 |
| [FIT-010](./FIT-010-coach-directory.md) | Browse coaches and request consultations | Complete | FIT-003 |
| [FIT-011](./FIT-011-membership-plans.md) | Define and enforce free and premium entitlements | Later | FIT-004, FIT-006, FIT-007, FIT-008 |
| [FIT-012](./FIT-012-future-platform.md) | Add opt-in private workout challenges | Complete | FIT-005 |
| [FIT-013](./FIT-013-equipment-guide.md) | Browse safe, text-based equipment tutorials | Complete | FIT-004 |
| [FIT-014](./FIT-014-personal-records.md) | Review exact logged personal workout records | Complete | FIT-005 |
| [FIT-015](./FIT-015-today-overview.md) | Summarize today’s workout and nutrition logs | Complete | FIT-005, FIT-006 |
| [FIT-016](./FIT-016-training-activity.md) | Review private rolling training activity | Complete | FIT-005 |
| [FIT-017](./FIT-017-weekly-workout-schedule.md) | Assign workout plan sessions to weekdays | Complete | FIT-004, FIT-015 |
| [FIT-018](./FIT-018-customize-workout-exercises.md) | Customize exercises in workout sessions | Complete | FIT-004, FIT-017 |
| [FIT-019](./FIT-019-measurement-window-comparisons.md) | Compare measurements over recent windows | Complete | FIT-008 |
| [FIT-020](./FIT-020-seven-day-nutrition-summary.md) | Review nutrition logs for the past seven days | Complete | FIT-006, FIT-015 |
| [FIT-021](./FIT-021-log-a-completed-planned-session.md) | Log a completed planned workout session | Complete | FIT-017, FIT-018 |
| [FIT-022](./FIT-022-weekly-consistency.md) | Review the last seven days of workouts and nutrition logs | Complete | FIT-015, FIT-020 |
| [FIT-023](./FIT-023-recent-measurement-trends.md) | Review recent measurement trends from the dashboard | Complete | FIT-008, FIT-019 |

## Implementation guardrails

- Deliver one ticket at a time and keep the app buildable between tickets.
- Treat health, body, and location information as sensitive: collect only what
  the feature needs, protect user-owned records, and make optional data optional.
- Clearly label estimates and general wellness guidance; do not present them as
  medical diagnoses or guaranteed outcomes.
- Do not claim integrations, AI analysis, coach availability, or real gym data
  until those capabilities are implemented and backed by reliable providers.
- Product name and premium pricing are not specified in the brief. Use a neutral
  working name until a brand decision is made, and defer pricing until validated.
