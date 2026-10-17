# FIT-011: Add free and premium membership entitlements

**Status:** Later  
**Priority:** P2  
**Depends on:** FIT-004, FIT-006, FIT-007, FIT-008

## User story

As a member, I want to understand what is included in each plan before deciding
whether premium access is useful to me.

## Scope

- Validate which limits and features users value before setting prices.
- Define server-enforced entitlements and clear free-plan limits.
- Add billing only after a payment provider, refund policy, and subscription
  lifecycle are agreed.

## Acceptance criteria

- Entitlements are enforced by the server, not only hidden in the UI.
- Pricing, renewals, cancellation, and limits are transparent before purchase.
- No price or premium promise is published before it is decided and implemented.

## Product decision

The product owner chose to defer free-plan caps and premium pricing and keep
all currently shipped features ungated. No paid tier, price, billing, renewal,
or cancellation promise is implemented or advertised. This ticket remains
deferred rather than inventing unvalidated limits or claiming server-enforced
premium access that does not exist.

Revisit after member research identifies valued features and acceptable limits.
At that point, define entitlements and enforce them in the relevant server
routes before introducing any purchase flow.
