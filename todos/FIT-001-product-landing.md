# FIT-001: Replace starter messaging with the fitness product landing page

**Status:** Complete  
**Priority:** P0  
**Depends on:** None

## User story

As someone looking to improve my fitness, I want the home page to explain how
the product can help so I can decide whether to create an account.

## Scope

- Replace generic starter copy, feature cards, and stats with the product's
  training, nutrition, and progress direction.
- Use a neutral working product name because the brief does not specify a brand.
- Keep the existing sign-up/sign-in paths and responsive, accessible UI patterns.
- Avoid presenting planned features as live capabilities or inventing user,
  health, or performance statistics.

## Acceptance criteria

- The page describes the product's intended fitness journey in clear language.
- Primary and secondary calls to action still navigate to sign-up and sign-in.
- The feature summaries reflect the brief without claiming unavailable services.
- Shared app metadata and header branding no longer identify the project as a
  starter template.

## Verification

- Run lint and TypeScript checks.
- Confirm the marketing page and navigation render without build errors.
