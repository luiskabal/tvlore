# 012 - Future Social Match Boundary

## Status

Proposed

## Context

TVLore may later support QR/deep-link profile comparison. This is not part of the MVP, but privacy and backend ownership must influence boundaries now.

## Decision

Future TVLore Match should be backend-owned.

QR/deep links should contain only opaque tokens. The backend should resolve tokens, authenticate the scanning user, check privacy settings, compare authorized histories, and return derived results.

Prefer ephemeral comparison initially instead of persisted match result snapshots.

## Alternatives Considered

- Client-side comparison: not acceptable because it exposes data and duplicates privacy/business logic.
- QR contains profile data: not acceptable because it leaks private data.
- Persist every result: useful for revisiting, but increases privacy and staleness risk before the product needs it.
- Traditional friend/social network first: larger product surface than necessary.

## Consequences

- MVP tracking data must be queryable enough for future comparisons.
- Privacy settings should be designed before Match implementation.
- Future share tokens need expiration and revocation.
- Derived results should be favored over raw history exposure.
- Exact scoring formula remains unresolved.

