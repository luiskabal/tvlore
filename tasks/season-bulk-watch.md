# Season Bulk Watch

Status: Implemented

## Goal

Let a signed-in user mark an entire season watched or unwatched from the season detail screen.

## Context

Current mobile flow:

- `SeasonDetailScreen` renders episodes for a show season.
- `useSeasonDetail` loads season detail through `GET /shows/:id/seasons/:seasonNumber`.
- Episode watch/unwatch already uses backend-owned endpoints:
  - `POST /episodes/:episodeId/watches`
  - `DELETE /episodes/:episodeId/watches`

Architecture boundary:

- Keep mobile as presentation/orchestration only.
- Reuse existing backend idempotent episode watch endpoints.
- Do not introduce a new backend bulk endpoint in this task.

## Requirements

- Add a season-level action on `SeasonDetailScreen`.
- User can mark all currently loaded season episodes watched.
- User can mark all currently loaded season episodes unwatched.
- Disable season bulk actions while a bulk or episode watch action is running.
- Update local episode watched state after successful bulk completion.
- Display returned show progress after successful bulk completion.

## Acceptance Criteria

- A season with unwatched episodes shows `Mark all watched`.
- A season with watched episodes shows `Mark all unwatched`.
- Pressing `Mark all watched` updates all loaded episodes to watched.
- Pressing `Mark all unwatched` updates all loaded episodes to unwatched.
- The episode-level buttons still work after a bulk action.
- Empty seasons do not offer enabled bulk actions.
- Existing movie tracking and single-episode tracking behavior remains unchanged.

## Verification

```powershell
corepack pnpm verify
```

Manual validation:

- iPhone: open a show season, press `Mark all watched`, confirm episodes switch to watched.
- iPhone: press `Mark all unwatched`, confirm episodes switch to unwatched.
- iPhone: mark one episode watched/unwatched after a bulk action.

## Out of Scope

- Backend bulk watch endpoint.
- Offline queueing.
- Optimistic rollback.
- Auto-refreshing the home/library screen on navigation focus.

## Human Gates

- Backend API shape changes require Luis approval.
