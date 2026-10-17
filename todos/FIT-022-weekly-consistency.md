# FIT-022: Review the last seven days of workouts and nutrition logs

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-015, FIT-020

## User story

As a member, I want a quick weekly snapshot of my recent workouts and nutrition entries so I can spot momentum and missing days without digging through each log.

## Scope

- Summarize the last seven local calendar days of recorded training and food/water entries.
- Show work and nutrition consistency separately, plus days where both were logged.
- Keep the summary derived from member-entered values only; never infer or fabricate metrics.
- Place the summary on the dashboard beside the current-day cards for a fast check-in.

## Acceptance criteria

- The summary uses the local calendar week, not a server-side UTC assumption.
- Workout and nutrition activity are counted only when the member has actual saved entries.
- Empty days are shown as inactive, not treated as activity.
- The summary remains concise and readable on the dashboard without introducing pricing or unsupported analysis.
- Values are based on member-entered logs and remain honest about what was actually recorded.

## Delivered

- Added a weekly consistency card to the dashboard under the active day summary.
- Counts only logged workouts and logged food/water entries from the last seven local days.
- Highlights days where both categories were logged in the same local day.
- Added tests covering local-date windowing and rendering of the summary card.
