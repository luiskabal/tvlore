# Watchlist / Want To Watch

Status: Implemented - pending authenticated smoke check with a fresh Supabase token

## Goal

Let an authenticated user save resolved shows and movies as titles they want to
watch later, separate from watched history.

## Context

Current architecture boundary:

```text
Controller -> Service -> Repository
Screen -> hook -> API/auth client
```

TVDLore already supports watched movies, watched episodes, continue-watching,
recently-watched, and Library/Profile routes. It does not yet support intent:
a user can mark something watched, but cannot save something they plan to watch.

Current persistence only has:

- `movie_watches`
- `episode_watches`

So this feature requires new database tables before backend or mobile behavior
can safely ship.

## Implemented Shape

Use two explicit tables:

- `show_watchlist_items`
- `movie_watchlist_items`

Why not one polymorphic table:

- Prisma handles explicit relations more cleanly.
- Unique constraints are straightforward: `[userId, showId]` and `[userId, movieId]`.
- The API can still expose one product concept: watchlist.
- This avoids raw partial indexes/check constraints in the MVP.

## API

```text
POST /shows/:showId/watchlist
DELETE /shows/:showId/watchlist
POST /movies/:movieId/watchlist
DELETE /movies/:movieId/watchlist
```

Response:

```json
{
  "id": "tvlore-id",
  "mediaType": "show",
  "inWatchlist": true
}
```

Library response should include:

```json
{
  "summary": {
    "watchedEpisodeCount": 0,
    "watchedMovieCount": 0,
    "watchedShowCount": 0,
    "watchlistItemCount": 0
  },
  "watchlist": []
}
```

Show/movie detail responses should include:

```json
{
  "inWatchlist": false
}
```

## Requirements

- Add watchlist persistence through Prisma migration.
- Keep watchlist personal/private.
- Make add/remove idempotent.
- Return watchlist state in detail endpoints.
- Return watchlist items in `GET /library`.
- Add mobile buttons on show and movie detail screens.
- Invalidate/refresh Library/Profile after watchlist mutations.
- Update API smoke checks and docs.

## Acceptance Criteria

- [x] User can add a resolved show to watchlist.
- [x] User can remove a resolved show from watchlist.
- [x] User can add a resolved movie to watchlist.
- [x] User can remove a resolved movie from watchlist.
- [x] Detail screens show current watchlist state.
- [x] Library shows saved watchlist titles separately from watched history.
- [x] Existing watched/unwatched behavior remains unchanged.
- [x] `corepack pnpm verify` passes.
- [x] Prisma migration is applied to Supabase.
- [ ] `corepack pnpm api:check` authenticated product path passes with a fresh Supabase token after Vercel deploy.

## Verification

```powershell
corepack pnpm verify
```

After applying migration to the target database:

```powershell
corepack pnpm api:check
```

Manual validation:

- iPhone flow: search, open a show, add to watchlist, return to Library.
- iPhone flow: open the same show again, confirm saved state, remove from watchlist.
- iPhone flow: repeat for a movie.

## Out of Scope

- Public watchlists.
- Multiple list types.
- Ratings.
- Comments.
- Recommendations.
- Social matching.
- Offline mutation queue.

## Human Gates

- Migration was approved in chat and applied to Supabase.
- Deployment should happen through the normal GitHub -> Vercel flow.
