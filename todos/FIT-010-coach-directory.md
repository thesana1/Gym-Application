# FIT-010: Browse coaches and request consultations

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-003

## User story

As a member, I want to review qualified coaches and request a consultation so I
can get help from a professional when self-guided advice is not enough.

## Scope

- Define coach profile, qualification verification, specialization, language,
  availability, and consultation request models.
- Build searchable coach profiles and a request flow before adding payments or
  real-time calls.
- Provide coach verification/moderation and clear cancellation/contact rules.

## Acceptance criteria

- Qualification status is distinguishable from self-reported profile details.
- Members can submit and review their own consultation requests.
- No fake ratings, prices, availability, or verified credentials are shown.

## Implementation decision

Do not seed demo coaches. Coaches submit profiles with self-reported
qualifications and availability notes; directory listings appear only after an
admin verifies the profile. The first release supports consultation requests
and in-app request status only. It does not process payments or claim live
appointment slots, ratings, or external contact arrangements.

## Delivered behavior

- Coach profiles are owned by the submitting account. Editing any profile
  returns it to pending review and removes it from the public directory.
- Admins review submitted qualifications, explicitly confirm that they checked
  them with the issuing organization, and can verify or delist a profile.
  Moderation records the administrator and time; stale reviews are rejected if
  the coach edited the profile while it was under review.
- The directory contains verified profiles only and supports name/focus,
  specialization, and language filters. Profile claims and availability notes
  are labeled as coach-supplied; no ratings, prices, or appointment slots are
  invented.
- Members may send a topic, a short request message, and broad preferred
  availability to a verified coach. Requesters may cancel pending or accepted
  requests; coaches may accept or decline pending requests. Each actor sees
  only requests sent to or received by their account.
- Acceptance is not a booking. There is no payment, external contact sharing,
  messaging, or appointment scheduling. The UI asks users not to include
  private contact or medical information in public profiles or request text.
- No sample coach profiles are seeded; the directory can be empty until actual
  coaches apply and an administrator verifies their qualifications.
