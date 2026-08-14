# Mobile Detail Skeletons

Status: Implemented

## Goal

Make show, movie, and season detail routes feel responsive while backend and
provider data loads.

## Context

Current architecture boundary:

```text
Screen -> hook -> API/auth client
```

Catalog and season detail screens already had loading states, but those states
were spinner panels. On slow API responses, that made the app feel stuck even
though the request was active.

## Requirements

- Replace catalog detail initial spinner with a content-shaped skeleton.
- Replace season detail initial spinner with a content-shaped skeleton.
- Keep error and ready states unchanged.
- Do not change hooks, API contracts, auth, persistence, or tracking behavior.
- Do not add a dependency or global skeleton abstraction.

## Acceptance Criteria

- Show detail loading displays a poster/title/overview/seasons-shaped skeleton.
- Movie detail loading displays a poster/title/overview/watch-panel-shaped skeleton.
- Season detail loading displays a header/actions/episode-list-shaped skeleton.
- Retry behavior still appears on errors.
- TypeScript compiles and the existing test suite passes.

## Verification

```powershell
corepack pnpm verify
```

Manual validation:

- iPhone flow: open a search result and confirm detail loading shows structure before content.
- iPhone flow: open a season and confirm episode list skeleton appears before episodes.

## Out of Scope

- Animated shimmer.
- Query cache/library changes.
- Backend performance work.
- Watchlist / want-to-watch state.

## Human Gates

- None.
