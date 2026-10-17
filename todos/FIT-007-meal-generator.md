# FIT-007: Generate meals from available ingredients

**Status:** Complete  
**Priority:** P1  
**Depends on:** FIT-006

## User story

As a member, I want meal ideas from ingredients I have so it is easier to eat
toward my preferences and goals.

## Scope

- Collect available ingredients and relevant meal preferences/allergies.
- Generate recipes with steps and nutrition estimates from a documented data
  source or clearly identified estimation method.
- Provide substitutions and explicit warnings about cross-contamination and
  uncertain nutrition values.

## Acceptance criteria

- Ingredient input is validated and the result uses only plausible ingredients.
- Allergies/preferences are respected or the system explains that it cannot
  safely produce a result.
- Nutrition is labeled as an estimate and recipes do not make health claims.
