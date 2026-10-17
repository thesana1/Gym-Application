# FIT-023: Review recent measurement trends from the dashboard

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-008, FIT-019

## User story

As a member, I want a quick snapshot of how my recent measurements moved over the last month so I can track changes without opening the full measurements page.

## Scope

- Show basic recent measurement change from the dashboard.
- Compare the first and most recent readings for weight, waist, and hips in the last four weeks.
- Use only values the member has entered; never infer or estimate missing data.
- Keep the card concise and descriptive, without promising interpretation or medical guidance.

## Acceptance criteria

- The summary is scoped to the authenticated member.
- Only measurements from the last four local weeks are included.
- The card clearly shows the measurement labels, recorded values, and movement over time.
- Empty or insufficient data results in a helpful prompt instead of a fabricated trend.
- The feature remains honest about self-entered data and does not present interpretation as health advice.

## Delivered

- Added a recent measurement trend card beside the weekly consistency summary on the dashboard.
- Pulls the member’s measurement history and compares first vs latest values across a four-week window.
- Provides a friendly empty state when there are not enough readings to summarize.
- Added tests covering the window summary logic and the empty-state rendering.
