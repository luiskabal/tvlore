# Mobile Routed Surfaces

Status: Implemented

## Goal

Promote the temporary mobile home experience into clearer route-level Library,
Search, and Profile surfaces without changing backend contracts.

## Context

Current architecture boundary:

```text
Screen -> hook -> API/auth client
```

The mobile app already had authenticated library data, search, detail screens,
and tracking mutations. The missing piece was navigation shape: the app still
felt like one technical home screen with product panels attached.

## Requirements

- Make `/library`, `/search`, and `/profile` primary mobile surfaces.
- Redirect `/` to `/library`.
- Keep Library focused on counts, continue-watching, recently watched, and navigation to details.
- Keep Profile focused on the holo card, account state, and sign out.
- Keep Search as a primary app route instead of a child reached only through home.
- Do not change API contracts, auth behavior, or persistence.

## Acceptance Criteria

- Opening the app lands on Library.
- Bottom navigation switches between Library, Search, and Profile.
- Library rows still navigate to movie or show season detail screens.
- Tracking mutations still invalidate the library and refresh when returning.
- Signed-out users still get a Google sign-in call to action.
- TypeScript compiles and the existing test suite passes.

## Verification

```powershell
corepack pnpm verify
```

Manual validation:

- iPhone flow: open app, switch Library/Search/Profile, search a title, open detail, mark watched, return to Library/Profile.

## Out of Scope

- New backend endpoints.
- Watchlist / want-to-watch state.
- Detail-screen skeleton redesign.
- New state-management library.

## Human Gates

- None.
