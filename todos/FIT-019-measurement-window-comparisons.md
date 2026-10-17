# FIT-019: Compare measurements within recent time windows

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-008

## User story

As a member, I want to compare my own measurements over a recent period without
having to infer a trend from the full record list.

## Scope

- Add selectable 4- and 8-week summaries to measurement history.
- For each measurement type, compare the earliest and latest values actually
  recorded in the selected period.
- Keep all existing measurement records and editing controls available.
- Describe numeric changes neutrally without treating increases or decreases
  as inherently good or bad.

## Acceptance criteria

- Use the browser's local calendar day for period boundaries, including daylight
  saving transitions.
- Include only measurements dated within the selected period through today.
- Do not interpolate missing records or compare different measurement types
  against each other.
- Show a change only when at least two values for that measurement type exist.
- Clearly distinguish no records from records with only one observation.
- State that comparisons are self-entered measurements and are not medical
  assessments or health recommendations.

## Delivered

- Added a local-calendar 4/8-week comparison panel to the measurements page.
- Each measurement type compares only its earliest and latest available values
  within the selected window; missing values are not inferred.
- Added record-count, empty, and insufficient-observation states, with neutral
  copy and units.
- Added helper and component tests for selected windows, future/out-of-range
  exclusion, independent measurement types, and daylight-saving boundaries.
