# FIT-005: Log workouts and review training progress

**Status:** Complete  
**Priority:** P1  
**Depends on:** FIT-004

## User story

As a member, I want to record completed workouts so I can understand consistency
and how my training changes over time.

## Scope

- Record completed sessions and exercise sets (weight, repetitions, and optional
  notes) for the current user.
- Add history and simple progress summaries based only on recorded sessions.
- Support correcting or deleting a member's own entries.

## Acceptance criteria

- Session and set inputs are validated and saved to the authenticated account.
- History can be filtered by date/exercise and empty history is explained.
- Summaries accurately reflect stored data and do not imply medical conclusions.
