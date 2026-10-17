# FIT-014: Review personal workout records

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-005

## User story

As a member, I want to see the strongest sets and highest repetitions I have
actually logged so I can review my training progress over time.

## Scope

- Derive records from the authenticated member's existing workout logs.
- Show the heaviest explicitly logged weighted set and highest-repetition set
  separately for each exercise.
- Include the date and exact logged set details; do not estimate one-rep max,
  merge bodyweight and weighted sets, or infer unrecorded weights.
- Keep records private and automatically recalculate after workout edits/deletes.

## Acceptance criteria

- The endpoint reads only the authenticated member's logs.
- Bodyweight/unweighted reps are clearly distinguished from weighted records.
- Records reflect exact logged data and make no strength/medical claims.
- Empty history has a useful empty state; edits and deletes change derived
  results without maintaining a second source of truth.

## Delivered behavior

- Added a private personal-record page and authenticated API route.
- The service derives each exercise's heaviest explicitly logged set and
  highest-repetition set independently from the member's current workout-log
  history. A workout is counted once per exercise even if the exercise appears
  more than once in that workout.
- Unweighted sets are displayed as unweighted; only a weight that was actually
  entered is used for the heaviest-set record.
- Records are not stored separately, so edits and deletions take effect on the
  next load. No estimated one-rep maximum, prediction, or comparison with other
  members is shown.
