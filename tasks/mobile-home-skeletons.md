# Mobile Home Skeletons

Status: Implemented

## Goal

Make profile/home refreshes feel stable by keeping previous library data on
screen while new data loads and showing skeleton UI only when no prior snapshot
exists.

## Context

Current files:

- `apps/mobile/src/home/use-home-data.ts`
- `apps/mobile/src/home/HomeScreen.tsx`
- `apps/mobile/src/home/LibraryOverview.tsx`
- `apps/mobile/src/home/home-styles.ts`

The home screen previously cleared its ready state during every refresh, causing
a visible jump from profile content to loading text and back to content.

## Requirements

- Preserve previous home/library data during background refreshes.
- Show a profile/library skeleton during initial home loading.
- Keep manual refresh and tracking-triggered refresh behavior unchanged.
- Do not add dependencies.

## Acceptance Criteria

- Initial load renders stable skeleton blocks.
- Refreshing an existing profile does not clear the profile card or library rows.
- TypeScript compiles.

## Verification

```powershell
corepack pnpm verify
```

## Out of Scope

- Animated shimmer.
- Skeletons for search/detail/season screens.
- Dedicated loading infrastructure library.

## Human Gates

- None.
