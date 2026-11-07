# FIT-011: Add free and premium membership entitlements

**Status:** Implemented (free-plan quotas deferred)
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

The product owner has now explicitly authorized Dodo Payments billing with
Premium at USD 20/month and individual consultation credits at USD 20. Premium
includes unlimited photo-upload count, existing fitness features without usage
quotas, and included coach consultation requests. The existing image-size limit
remains. Other free-plan caps remain undecided and are not invented.

Implemented: dynamic product provisioning, hosted checkout, customer portal,
verified payment/subscription/refund webhooks, server-side paid-period checks,
Premium image uploads, and consultation credits protected from concurrent double
spending. Credits become available again if a coach request is declined or
cancelled. Public HTTPS webhook configuration and Cloudinary credentials remain
deployment setup requirements. No appointment availability is fabricated.
