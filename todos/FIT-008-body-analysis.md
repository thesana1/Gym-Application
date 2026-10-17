# FIT-008: Record measurements and body-analysis history

**Status:** Complete  
**Priority:** P1  
**Depends on:** FIT-002, FIT-005

## User story

As a member, I want to review changes in measurements over time without being
misled into treating estimates as medical measurements.

## Scope

- Record user-entered measurements with clear units and privacy controls.
- Show time-based trends and preserve the source/date of each measurement.
- Defer progress image storage and image-derived estimates until a suitable
  provider, explicit consent flow, and safe retention/deletion policy are selected.

## Acceptance criteria

- Measurement history belongs only to the current user and can be deleted.
- Body-fat or image-based results, if implemented, are labeled estimates and
  include clear limitations; no medical diagnosis is produced.
- No image-derived estimate or medical diagnosis is presented.
