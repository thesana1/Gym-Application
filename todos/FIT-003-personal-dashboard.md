# FIT-003: Build the personal fitness dashboard

**Status:** Complete
**Priority:** P0  
**Depends on:** FIT-002

## User story

As a member, I want one dashboard for my next fitness actions so I can move
between training, nutrition, and progress without searching.

## Scope

- Replace starter metrics and activity with user-owned profile and feature
  summaries.
- Add navigation for implemented features and clear empty states for features
  that are not available yet.
- Preserve the responsive dashboard shell and mobile navigation behavior.
- Do not show fabricated activity, measurements, or progress.

## Acceptance criteria

- The dashboard greets the member and surfaces their recorded goal/profile state.
- Unavailable feature links are not presented as working functionality.
- Empty, loading, and error states are understandable and accessible.
- Every displayed private summary is scoped to the current user.
