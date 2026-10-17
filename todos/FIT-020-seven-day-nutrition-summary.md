# FIT-020: Review nutrition logs across the past seven days

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-006, FIT-015

## User story

As a member, I want to review my recent logged food and water totals by day so
I can see what I have recorded without treating missing days as zero intake.

## Scope

- Show daily totals for the current local day and six preceding calendar days.
- Include calories, protein, carbohydrates, fat, fiber, water, and entry count.
- Show the member's own nutrition targets only as optional reference values.
- Keep daily totals derived from existing entries; do not persist aggregates.

## Acceptance criteria

- Every request is scoped to the authenticated member.
- Date bounds use local calendar dates and behave correctly across daylight
  saving changes.
- Days with no entries are explicitly identified as unlogged, not displayed as
  zero intake.
- Values come only from member-entered records and are labeled approximate.
- Missing targets remain unset; the feature does not recommend targets,
  evaluate nutritional adequacy, or diagnose health conditions.

## Delivered

- Added an authenticated date-range query for nutrition entries, limited to
  seven calendar dates and scoped to the signed-in member.
- Added a rolling seven-local-day dashboard summary derived from existing
  nutrition entries.
- Shows exact daily totals and entry counts when records exist and labels days
  without records as unlogged.
- Displays manually selected targets only as a member-entered reference.
- Added tests for range validation, owner-scoped retrieval, nutrient sums,
  empty days, and calendar windows spanning daylight-saving transitions.
