# 010 - Tracking Model

## Status

Accepted

## Context

Tracking is the foundation of TVLore's current product and future taste profile. The model must support watched/unwatched state, timestamps, rewatches, progress, library summaries, and future comparison queries.

## Decision

Use explicit `EpisodeWatch` and `MovieWatch` records.

For MVP:

- Mark watched ensures at least one watch record exists.
- Mark unwatched removes the authenticated user's watch records for that episode or movie.
- Rewatch-specific UX can later create additional watch records explicitly.
- Progress is calculated by backend services from watch records and catalog episode counts.

Do not use a generic `WatchEvent` or event-sourcing model for MVP.

## Alternatives Considered

- Generic `WatchEvent`: flexible, but makes current state and progress unnecessarily complex.
- Single polymorphic `Watch` table: compact, but weaker relational constraints across episodes and movies.
- Boolean watched flags: too limited for timestamps, rewatches, history, and future comparison.

## Consequences

- Watch counts and timestamps are queryable.
- Progress can be derived consistently.
- Future comparisons can query shared/different titles.
- If audit semantics are required later, add a separate audit/correction log.

