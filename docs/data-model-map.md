# Data Model Map

This document maps the current PostgreSQL schema to TVLore product behavior.
Use it when you need to answer:

- What data do we store?
- Who owns it?
- Which feature writes it?
- Which feature reads it?
- What is deleted when an account is deleted?

For conceptual modeling decisions, see [Domain Model](domain-model.md) and
[Tracking Model](tracking-model.md). For store/privacy disclosure wording, see
[Data Inventory](data-inventory.md).

## 1. Ownership Layers

```text
Supabase Auth identity
-> TVLore user identity
-> Shared catalog records
-> User-owned product records
-> Derived API responses
-> Mobile presentation/cache
```

Ownership rule:

```text
Shared catalog rows can remain after account deletion.
User-owned rows must be deleted with the user.
```

## 2. Data Groups

| Group | Tables | Owner | Notes |
| --- | --- | --- | --- |
| Account | `users`, `user_identities` | TVLore user | Links Supabase Auth identity to TVLore product identity. |
| Legacy/custom session model | `refresh_sessions` | TVLore user | Present in schema from the early custom-token plan; current MVP sessions are Supabase-managed. |
| Shared catalog | `shows`, `movies`, `seasons`, `episodes`, `external_identifiers` | TVLore shared data, sourced from TMDB | Not user-owned; created when a user resolves or opens provider content. |
| Watched state | `episode_watches`, `movie_watches` | TVLore user | One active watched marker per user and episode/movie in MVP. |
| Watchlist | `show_watchlist_items`, `movie_watchlist_items` | TVLore user | Saved intent to watch later. |
| Ratings | `show_preferences`, `movie_preferences`, `episode_preferences` | TVLore user | User 1-5 star rating preferences. |
| Reflections | `show_reflections`, `movie_reflections`, `episode_reflections` | TVLore user | Private post-watch emotion, favorite character, and optional comment. |
| Watch paths | `user_watch_paths`, `user_watch_path_items` | TVLore user | User-created/imported ordered lists. Curated paths are backend-owned constants today. |

## 3. Table Map

| Table | Product meaning | Written by | Read by |
| --- | --- | --- | --- |
| `users` | TVLore account profile and availability country. | `GET /users/me` upsert, `PATCH /users/me`. | Profile, Library, discovery, Where to Watch, recommendations. |
| `user_identities` | Supabase provider subject to TVLore user link. | Authenticated user resolution. | Protected API request authorization context. |
| `refresh_sessions` | Early TVLore-owned refresh-token table. | Not part of the current Supabase-session MVP flow. | Should not drive current auth behavior. |
| `shows` | Internal show identity and cached TMDB metadata. | `POST /catalog/resolve`, season/detail hydration. | Show detail, Library, recommendations, watch paths. |
| `movies` | Internal movie identity and cached TMDB metadata. | `POST /catalog/resolve`. | Movie detail, Library, recommendations, watch paths. |
| `seasons` | Internal season identity and metadata for a show. | `GET /shows/:showId/seasons/:seasonNumber`, catalog hydration. | Show/season detail, Library grouped episodes, progress. |
| `episodes` | Internal episode identity and metadata. | Season detail hydration. | Season detail, episode detail, Library, progress. |
| `external_identifiers` | Provider mapping, currently TMDB. | Catalog resolve/hydration. | Search known-item markers, resolve, path item opening. |
| `episode_watches` | User watched marker for an episode. | Episode, season, and show watched actions. | Library, progress, chronology, recommendations exclusions. |
| `movie_watches` | User watched marker for a movie. | Movie watched action. | Library, chronology, recommendations exclusions. |
| `show_watchlist_items` | User saved show intent. | Show watchlist action, save path to watchlist. | Library, detail state, recommendation exclusions. |
| `movie_watchlist_items` | User saved movie intent. | Movie watchlist action, save path to watchlist. | Library, detail state, recommendation exclusions. |
| `show_preferences` | User show star rating. | Detail/check-in rating. | Detail state, Library rated filter, recommendations. |
| `movie_preferences` | User movie star rating. | Detail/check-in rating. | Detail state, Library rated filter, recommendations. |
| `episode_preferences` | User episode star rating. | Episode detail/check-in rating. | Episode detail/check-in state. |
| `show_reflections` | Private show-level post-watch check-in. | Show check-in. | Show detail/check-in state. |
| `movie_reflections` | Private movie post-watch check-in. | Movie check-in. | Movie detail/check-in state. |
| `episode_reflections` | Private episode post-watch check-in. | Episode check-in. | Episode detail/check-in state. |
| `user_watch_paths` | User-created/imported watch path header. | Paths create/import flow. | Paths list/detail. |
| `user_watch_path_items` | Ordered provider refs inside a user path. | Paths create/import flow. | Path detail, path item resolve/open, save path to watchlist. |

## 4. Feature To Data Map

| Feature | Main writes | Main reads |
| --- | --- | --- |
| Google login | `users`, `user_identities` | Supabase Auth, `users`, `user_identities` |
| Profile country | `users.availability_country` | `users` |
| Search | None for raw search | TMDB through backend, `external_identifiers` for known TVLore markers |
| Open show/movie | `shows` or `movies`, `external_identifiers` | TMDB, catalog tables |
| Open season | `seasons`, `episodes` | TMDB, `episode_watches`, `episode_preferences` |
| Open episode | None unless missing data was hydrated earlier | `episodes`, parent `shows`/`seasons`, user watch/rating/reflection rows |
| Movie watched | `movie_watches` | `movies`, `movie_watches` |
| Episode watched | `episode_watches` | `episodes`, `episode_watches` |
| Season watched | `episode_watches` for each persisted episode in the season | `seasons`, `episodes` |
| Full show watched | `episode_watches` for eligible persisted episodes in the show | `shows`, `seasons`, `episodes` |
| Watchlist | `show_watchlist_items`, `movie_watchlist_items` | Watchlist tables plus catalog tables |
| Rating | `show_preferences`, `movie_preferences`, `episode_preferences` | Preference tables plus catalog tables |
| Check-in | Reflection table plus matching preference table when rating is provided | Reflection, preference, and cast data |
| Library | Usually no writes | Watches, watchlist, preferences, reflections, catalog, user |
| Chronologia | No writes | `episode_watches`, `movie_watches`, catalog tables |
| Recommendations | No direct writes | Preferences, watches, watchlist, catalog, user country |
| Where to Watch | No persisted provider writes | User country plus TMDB watch-provider API |
| TVLore Picks | No user writes until title is opened/saved | Backend curated refs, TMDB/catalog |
| Personal watch path | `user_watch_paths`, `user_watch_path_items` | User path tables and catalog resolve |
| Save path to watchlist | `show_watchlist_items`, `movie_watchlist_items` | Path items, catalog resolve |
| Account deletion | Deletes user-owned rows through `users` cascade, then Supabase Auth user when configured | User identity and auth admin configuration |

## 5. Catalog Persistence Lifecycle

Raw search is intentionally lightweight:

```text
GET /search
-> call TMDB
-> return normalized provider refs
-> do not persist every result
```

Opening or saving a title resolves it:

```text
POST /catalog/resolve
-> fetch TMDB detail
-> upsert show/movie
-> upsert external identifier
-> return TVLore UUID
```

Opening a season hydrates episodes:

```text
GET /shows/:showId/seasons/:seasonNumber
-> fetch season/episode metadata from TMDB if needed
-> upsert season
-> upsert episodes
-> return user-specific watched/rating state
```

This keeps the database from becoming a full TMDB mirror while still giving
TVLore stable internal IDs for user actions.

## 6. User-Owned Data Deletion

Deleting the authenticated `User` cascades through user-owned tables:

```text
user_identities
refresh_sessions
episode_watches
movie_watches
show_watchlist_items
movie_watchlist_items
show_preferences
movie_preferences
episode_preferences
show_reflections
movie_reflections
episode_reflections
user_watch_paths
user_watch_path_items
```

Shared catalog tables remain:

```text
shows
movies
seasons
episodes
external_identifiers
```

Why: catalog rows are provider metadata and can be shared by many users. The
private user relationship to those rows is what gets deleted.

## 7. Derived State

The backend derives these from stored rows:

| Derived state | Source rows |
| --- | --- |
| Show progress | Episodes plus `episode_watches`. |
| Season progress | Season episodes plus `episode_watches`. |
| Continue watching | Partial show progress and recent episode watches. |
| Library counts | Watches, watchlist, and preferences. |
| Cronologia | `episode_watches`, `movie_watches`, and catalog context. |
| Rated list | Show/movie preference rows. |
| Recommendation score | Ratings, genres, media affinity, exclusions, user country availability. |
| Known title in search | `external_identifiers` mapping provider refs to TVLore IDs. |

Mobile may render optimistic state, but the canonical version comes back from
the backend.

## 8. Future-Safe Notes

Do not change these without an explicit architecture decision:

- Rewatch history: current `episode_watches` and `movie_watches` have one row
  per user/title. A future rewatch feature can relax uniqueness or add a
  separate watch-event table.
- Favorite-character percentages: current reflections store private selections.
  Public percentages need aggregate rules, privacy rules, and abuse handling.
- Social match: current schema can support future derived comparisons, but raw
  watch history should not be exposed to other users by default.
- Direct mobile database access: mobile should not write Supabase tables
  directly. Product data goes through the TVLore API.
- `refresh_sessions`: keep it documented as legacy/currently inactive unless
  custom TVLore sessions are deliberately reintroduced.
