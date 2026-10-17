# FIT-009: Find and compare nearby gyms

**Status:** Complete  
**Priority:** P2  
**Depends on:** FIT-003

## Provider decision

Use OpenStreetMap/Nominatim for locality geocoding and an OpenStreetMap Overpass
instance for nearby mapped gyms. Users enter a locality manually; do not request
browser GPS. Disclose that the query is sent to these providers and attribute
OpenStreetMap. Display only facts present in provider tags; clearly identify
missing membership price, ratings, hours, equipment, and facilities instead of
inventing them.

## Implementation notes

- Authenticated members submit a locality to the server-side search endpoint.
- Search is limited to mapped fitness facilities within approximately 5 km of
  the geocoded place center; distances are explicitly approximate.
- Provider data is cached for up to 24 hours (geocoding) and 1 hour (gym data).
  The application does not save search history to member profiles.
- Nominatim requests include an identifying application `User-Agent`, are
  serialized at one request per second per running server process, and have a
  timeout. Provider endpoints can be changed with `OSM_NOMINATIM_URL` and
  `OSM_OVERPASS_URL`.
- The process-local request queue does not coordinate multiple deployed server
  instances. Before scaling this endpoint across instances, use a shared
  rate-limit mechanism or an appropriately provisioned OSM-based provider.
- Only tagged details are shown. An absent facility name is called unnamed;
  absent hours, fees, address, contact, and accessibility data are labeled as
  unlisted. No ratings or prices are inferred.

## User story

As a member, I want to compare nearby gyms so I can find a place that fits my
location, budget, and equipment needs.

## Scope

- Use OpenStreetMap/Nominatim and Overpass with provider errors surfaced.
- Allow a user-entered locality; do not request browser location.
- Present approximate distance, mapped address/contact/fee/hours/accessibility
  details, and visible OpenStreetMap attribution.
- Disclose third-party sharing and temporary cache durations; do not persist
  search history to member accounts.

## Acceptance criteria

- Search works without granting browser location permission.
- Search disclosure, temporary data-cache durations, and OpenStreetMap
  attribution are visible in the UI.
- Invalid inputs and provider failures return explicit errors.
- Unknown or unavailable gym facts are labeled as unlisted rather than
  fabricated.
