# FIT-021: Log a completed planned workout session

**Status:** Complete  
**Priority:** P1  
**Depends on:** FIT-017, FIT-018

## User story

As a member, I want to start a workout log from the session scheduled for today
so I can record what I actually completed without rebuilding the exercise list.

## Scope

- Link today's scheduled session to the workout log form.
- Prefill the current customized plan session's exercise choices and title.
- Let the member enter actual repetitions and weights for each completed set.
- Persist a workout only after the member explicitly submits the log.

## Acceptance criteria

- Opening a planned session does not create a completed workout record.
- Log exercise IDs come from the member's current effective plan.
- Do not invent actual repetitions, weights, or a completion time.
- The user can edit the exercise list and set details before saving.
- Existing manual logging and editing behavior remain unchanged.
- Submitting records the actual entered workout through the existing owner-scoped
  workout log API.

## Delivered

- Added a Today-card action linking the assigned session index into the workout
  plan page.
- Opened the existing workout log form with the effective customized plan's
  exercises and planned set count.
- Left actual repetitions, weights, and completion time blank for the member to
  enter; no record is created until submission.
- Extracted the log editor and history filters into focused components while
  preserving manual logging and filtering.
- Added tests that check the dashboard link and verify no save occurs until
  submitting member-entered workout values.
