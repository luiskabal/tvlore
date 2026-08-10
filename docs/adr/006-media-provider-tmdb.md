# 006 - Media Provider TMDB

## Status

Accepted

## Context

TVLore needs catalog search and metadata for TV shows, seasons, episodes, and movies. Building a catalog from scratch is not part of the product.

## Decision

Use TMDB as the initial media catalog provider.

All TMDB access goes through the backend. TMDB responses are mapped through an adapter boundary into TVLore contracts and internal models.

TMDB credentials must not be included in the mobile bundle.

## Alternatives Considered

- Trakt: useful for watch-history ecosystems, but out of scope for MVP.
- TVmaze: strong TV data, weaker movie coverage for TVLore's initial combined scope.
- TheTVDB: useful future provider, but not needed initially.
- Local catalog mirror: too much operational burden for MVP.

## Consequences

- The backend needs provider error mapping.
- Search/detail data freshness needs simple stale-refresh rules.
- TVLore internal IDs remain separate from TMDB IDs.
- Future providers can be added behind the same catalog boundary.

## References

- https://developer.themoviedb.org/docs/getting-started
- https://developer.themoviedb.org/docs/authentication-application

