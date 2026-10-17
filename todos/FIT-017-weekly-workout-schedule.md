# FIT-017: Schedule workout plan sessions by weekday

**Status:** Complete  
**Priority:** P1  
**Depends on:** FIT-004, FIT-015

## User story

As a member, I want to assign my plan sessions to weekdays so I can see the
session I planned for today without confusing it with a completed workout.

## Scope

- Let members assign each generated plan session to a distinct weekday.
- Save the schedule privately and let the member edit or clear it.
- Show today's assigned session in the dashboard using the browser's local
  weekday.
- Keep planned sessions visually distinct from completed workout logs.

## Acceptance criteria

- Only authenticated members can read or change their own schedule.
- A saved schedule may contain fewer than the generated plan's maximum number
  of sessions; unscheduled weekdays remain rest/unplanned days.
- The schedule cannot assign multiple sessions to the same weekday or reference
  a session not present in the member's current plan.
- A generated plan or assignment is never presented as a completed workout.
- The dashboard clearly indicates when no session is scheduled for today.
- No push notifications, calendar integrations, or workout-completion claims
  are introduced.

## Delivered

- Persisted weekday assignments on the member's fitness profile and added an
  authenticated API that validates distinct weekdays and current plan sessions.
- Added a weekday editor to the workout plan page, including save, clear, and
  retry behavior.
- Updated the Today dashboard to show the locally scheduled plan session
  separately from completed workout logs, including a clear unscheduled state.
- Added validation, service, route, editor, and dashboard tests for ownership,
  invalid assignments, schedule persistence, and planned-versus-completed
  display.
