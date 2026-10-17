# FIT-018: Customize exercises in a workout plan

**Status:** Complete  
**Priority:** P1  
**Depends on:** FIT-004, FIT-017

## User story

As a member, I want to swap exercises in my generated sessions for other
movements I can perform with my available equipment.

## Scope

- Keep the generated plan as the default and allow exercise substitutions in
  each generated session.
- Offer only exercises from the existing library that fit the member's saved
  equipment.
- Preserve the generated number of exercise slots and session prescriptions;
  customization changes exercise choices only.
- Save customizations privately, let members restore the generated defaults,
  and reflect the current plan on the workout page and schedule.

## Acceptance criteria

- Only the authenticated member can read or update their plan customizations.
- A customization can only reference existing sessions and equipment-compatible
  library exercises, with no duplicate exercise in a session.
- Changing fitness profile inputs cannot make an incompatible saved exercise
  appear in the effective plan; stale customizations fall back to generated
  defaults.
- Saving or resetting exercise choices does not change workout history.
- Existing plan details, schedule assignments, and completed logs remain
  clearly distinct.
- No recommendation of extra training days or increase in sets, reps, or load is
  added.

## Delivered

- Added private, profile-owned session exercise overrides and a member-scoped
  API for loading, saving, and resetting them.
- Added the exercise selector to the workout plan page using only library
  movements compatible with the member's saved equipment.
- Preserved generated session slots and sets/repetitions/rest guidance.
- Stale choices that no longer fit the profile fall back to generated
  exercises; valid choices appear in the effective plan and weekly schedule.
- Kept workout logging and schedule access available if customization loading
  fails.
- Added schema, service, API, and UI tests covering access control, duplicate
  and incompatible inputs, stale overrides, reset, and unchanged prescriptions.
