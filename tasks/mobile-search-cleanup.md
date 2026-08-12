# Mobile Search Cleanup

Status: Implemented

## Goal

Split search route/container logic from search controls, result presentation,
loading states, and styles without changing behavior.

## Context

Current files:

- `apps/mobile/src/search/SearchScreen.tsx`
- `apps/mobile/src/search/SearchControls.tsx`
- `apps/mobile/src/search/SearchResults.tsx`
- `apps/mobile/src/search/search-styles.ts`

The old `SearchScreen` mixed debounced search orchestration, filter state,
navigation, loading/error/empty states, result rows, resolve state rendering,
and styles.

## Requirements

- Keep `SearchScreen` as the route/container.
- Keep debounced search prefetch, immediate filter loading feedback, and manual
  Search button behavior unchanged.
- Move search input/filter controls into presentation code.
- Move results, skeletons, error/empty states, and row rendering into
  presentation code.
- Move styles into a dedicated style module.

## Acceptance Criteria

- TypeScript compiles.
- Search still runs after the debounce when the query has at least three characters.
- Filter changes still trigger immediate loading feedback.
- Result rows still resolve into TVLore IDs and navigate to show/movie detail.
- Loading, empty, and error behavior remains unchanged.

## Verification

```powershell
corepack pnpm verify
```

## Out of Scope

- UI redesign.
- Backend endpoint changes.
- Replacing the local hook with a query library.

## Human Gates

- None.
