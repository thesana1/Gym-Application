# FIT-015: Add a today overview

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-005, FIT-006

## User story

As a member, I want a quick view of what I have logged today so I can continue
my workout and nutrition tracking without searching through separate pages.

## Scope

- Summarize today's completed workout logs and user-entered nutrition entries.
- Use the member's local calendar day and existing authenticated endpoints.
- Show nutrition targets only when the member has chosen them; do not prescribe,
  estimate, or calculate new target values.
- Provide links to log a workout or review nutrition.
- Do not claim a scheduled workout; the current workout plan has no calendar
  assignment.

## Acceptance criteria

- All values come from the signed-in member's existing records.
- Today means the browser's local calendar day, including daylight-saving
  boundaries.
- Missing targets and empty logs are clearly identified rather than displayed
  as zero-goal or completed activity.
- Failed requests have a visible retry path.

## Delivered behavior

- Added a dashboard Today section summarizing logged workouts, entered food and
  water totals, and member-entered nutrition targets.
- Workout date bounds are computed from the browser's local calendar day and
  handle daylight-saving changes; nutrition entries use that same local date.
- Workout plans are not assigned to days, so the section reports completed
  logs only and does not label a generated session as today's workout.
- Added loading, empty, and retry states. All data is loaded from the existing
  authenticated, account-scoped endpoints; no new tracking data is stored.
