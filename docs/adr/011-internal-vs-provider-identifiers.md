# 011 - Internal vs Provider Identifiers

## Status

Accepted

## Context

TMDB is the initial catalog provider, but TVLore should own product identity. Future providers may include IMDb, TVDB, Trakt, or others.

## Decision

Use internal UUIDs for TVLore entities.

Use `ExternalIdentifier` mappings for provider IDs:

- `entityType`
- `entityId`
- `provider`
- `providerId`

Do not expose TMDB IDs as permanent TVLore domain identity.

## Alternatives Considered

- Use TMDB IDs as primary IDs: fastest initially, but tightly couples product data to TMDB.
- Direct provider columns: simple, but less flexible as providers grow.
- ExternalIdentifier table: slight join overhead, but clear provider boundary.

## Consequences

- API routes use TVLore IDs after catalog resolution.
- User watch records reference internal TVLore entities.
- Provider changes do not require rewriting user history.
- Search-to-detail flow requires a resolve step.

