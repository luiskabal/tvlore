# Mobile Holo Profile Card

Status: Implemented

## Goal

Add a first version of a TVLore profile summary card inspired by collectible
holographic cards: user photo, name, library stats, and a touch-driven holo
shine effect.

## Context

Current files:

- `apps/mobile/src/home/HomeScreen.tsx`
- `apps/mobile/src/home/LibraryOverview.tsx`
- `apps/mobile/src/home/home-styles.ts`
- `apps/mobile/src/auth/use-auth-session.ts`

Architecture boundary:

```text
Screen -> hook -> API/auth client
```

The mobile home already renders authenticated library summary data. Supabase
Auth already contains Google user metadata, including profile image fields.

## Requirements

- Show a profile summary card in the home library section.
- Include user display name.
- Include Google profile photo when available.
- Include watched show/movie/episode counts.
- Add a touch-driven holo/tilt effect without adding dependencies.
- Keep existing library lists below the card.

## Acceptance Criteria

- Signed-in home shows the profile card above continue-watching/recently-watched.
- The card displays the user's Google photo if Supabase session metadata has it.
- The card still works without an avatar URL by rendering initials.
- Moving/touching the card changes the visual shine/tilt.
- Existing search, auth, refresh, and library behavior remains unchanged.

## Verification

```powershell
corepack pnpm verify
```

Manual validation:

- iPhone: reload app, confirm the profile card renders on home.
- iPhone: touch/drag across the card, confirm holo shine/tilt changes.
- iPhone: mark watched/unwatched and return home, confirm stats still refresh.

## Out of Scope

- Custom photo upload.
- Persistent profile customization.
- Device gyroscope/sensor-driven tilt.
- Skeleton loading states.
- Branded Pokémon assets or card art.

## Human Gates

- Adding image upload/storage requires Luis approval.
