# FIT-016: Review training activity over time

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-005

## User story

As a member, I want to review how many workouts and sets I logged over recent
weeks so I can understand my own training history.

## Scope

- Summarize existing workout logs into consecutive rolling seven-day periods
  for the last 4 or 8 weeks.
- Include exact counts of workout logs, logged sets, and distinct exercises.
- Keep results private to the authenticated member and derive them on demand.
- Do not estimate calories, one-rep max, training quality, or prescribe
  frequency or progression.

## Acceptance criteria

- Only the authenticated member's workout logs contribute to the report.
- Periods are contiguous, non-overlapping, and anchored to the current time.
- Editing or deleting a workout is reflected on the next request.
- The UI explains that periods are rolling seven-day windows and that the
  counts describe logs, not training quality or health outcomes.
- Members can choose a four- or eight-period report range.
- Empty periods are shown as zero activity; no workouts or sets are inferred.

## Delivered

- Added an authenticated, owner-scoped activity endpoint that derives the
  report from saved workout logs on every request.
- Added a dashboard activity history page with exact workout, set, and distinct
  exercise counts, rolling period boundaries, and clear limitations.
- Added service, route, and UI tests for ownership, range validation, period
  boundaries, empty periods, selection, and retry behavior.
