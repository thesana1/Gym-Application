# FIT-002: Collect and persist a fitness profile

**Status:** Complete  
**Priority:** P0  
**Depends on:** FIT-001

## User story

As a new member, I want to enter the minimum information needed for useful
fitness guidance so my recommendations reflect my goals and experience.

## Scope

- Define typed, validated profile fields for goals, experience, and the
  measurements needed by the first training and nutrition features.
- Build an accessible onboarding/edit form using the existing form patterns.
- Persist profiles for the authenticated user through validation, service, and
  repository layers; users must not read or change another user's profile.
- Make optional and sensitive fields explicit and explain how they are used.

## Acceptance criteria

- Invalid values are rejected at the API boundary and valid updates are scoped
  to the signed-in user.
- Users can create and edit their own profile and see validation errors.
- Onboarding can be skipped where fields are not required for the core account.
- No fitness or health input is logged in application errors.
