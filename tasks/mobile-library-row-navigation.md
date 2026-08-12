# Mobile Library Row Navigation

Status: Implemented

## Goal

Let users navigate from home library rows back into the relevant movie or show
season detail screens.

## Context

Current files:

- `apps/mobile/src/home/HomeScreen.tsx`
- `apps/mobile/src/home/LibraryOverview.tsx`
- `apps/mobile/src/home/home-styles.ts`

Current home library rows:

- `Continue Watching`
- `Recently Watched`

Architecture boundary:

```text
Screen -> hook -> API/auth client
```

`HomeScreen` should own route navigation. Presentation components should receive
callbacks.

## Requirements

- Tapping a continue-watching show opens that show's next season.
- Tapping a recently watched movie opens movie detail.
- Tapping a recently watched episode opens the matching show season.
- Keep existing row content and library refresh behavior unchanged.
- Do not add new backend endpoints.

## Acceptance Criteria

- Continue-watching row navigates to `/shows/:id/seasons/:seasonNumber`.
- Recently-watched movie row navigates to `/movies/:id`.
- Recently-watched episode row navigates to `/shows/:showId/seasons/:seasonNumber`.
- TypeScript compiles.
- Existing search/detail/tracking behavior remains unchanged.

## Verification

```powershell
corepack pnpm verify
```

Manual validation:

- iPhone: mark an episode watched, return home, tap the recent episode row.
- iPhone: mark a movie watched, return home, tap the recent movie row.
- iPhone: tap a continue-watching row when available.

## Out of Scope

- Dedicated Library/Profile tabs.
- Skeleton loading states.
- Deep linking outside the current authenticated stack.

## Human Gates

- None for this feature.
