# TVLore Data Inventory

This document maps the current implementation to the data disclosures needed for
store privacy forms. It is an engineering inventory, not legal advice.

## Current Data Categories

| Data | Source | Stored In | Linked To User | Purpose |
| --- | --- | --- | --- | --- |
| Email | Supabase Google/Apple OAuth | Supabase Auth, `user_identities` | Yes | Authentication and account recovery. |
| Display name | Supabase Google/Apple OAuth | `users` | Yes | Profile display. |
| Avatar URL | Supabase Google OAuth | Supabase session metadata, mobile session | Yes | Profile card display. |
| Supabase Auth user ID | Supabase Auth | `user_identities` | Yes | Backend identity mapping. |
| Availability country | User selection | `users.availability_country` | Yes | Country-aware Where to Watch and discovery. |
| Watch history | User action | `episode_watches`, `movie_watches` | Yes | Library, progress, chronology, recommendations. |
| Watchlist | User action | `show_watchlist_items`, `movie_watchlist_items` | Yes | Saved-title library. |
| Ratings | User action | `show_preferences`, `movie_preferences`, `episode_preferences` | Yes | Profile stats and recommendations. |
| Reflections | User action | `show_reflections`, `movie_reflections`, `episode_reflections` | Yes | Private post-watch check-ins. |
| Favorite-character selections | User action | Reflection tables | Yes | Private post-watch check-ins. |
| Comments | User action | Reflection tables | Yes | Private post-watch notes. |
| Personal watch paths | User action/import | `user_watch_paths`, `user_watch_path_items` | Yes | Custom viewing-order lists. |
| Request metadata | API runtime | Vercel/Supabase operational logs | Potentially | Debugging, abuse prevention, reliability. |
| Catalog metadata | TMDB | Shared catalog tables | No | Search, detail, recommendations, watch paths. |
| Watch-provider metadata | TMDB/JustWatch via TMDB | Not persisted long-term by TVLore | No | Country-aware availability display. |

## Current Third Parties

| Service | Role | Notes |
| --- | --- | --- |
| Supabase | Auth and PostgreSQL hosting | Stores auth account data and TVLore product data. |
| Vercel | API hosting | Processes API requests and logs operational data. |
| TMDB | Catalog and watch-provider API | Provides metadata, ratings, images, cast, discovery, and provider availability. |
| Google | OAuth identity provider | Provides the signed-in user's Google identity through Supabase Auth. |
| Apple | OAuth identity provider | Provides the signed-in user's Apple identity through Supabase Auth when selected on iOS. |

## Current User Rights Surface

- In-app deletion: Profile -> Delete account -> Delete forever.
- Public deletion instructions: `https://tvlore-api.vercel.app/account-deletion`.
- Public privacy URL: `https://tvlore-api.vercel.app/privacy`.
- Public terms URL: `https://tvlore-api.vercel.app/terms`.
- Public support URL: `https://tvlore-api.vercel.app/support`.

## Deletion Behavior

When configured with `SUPABASE_SERVICE_ROLE_KEY`, `DELETE /users/me` removes the
authenticated user's TVLore `User` row, cascades user-owned product data, and
deletes the linked Supabase Auth account. Shared catalog rows remain because
they are not user-owned.

## Store Form Starting Point

Use this as the engineering baseline when answering store forms:

- App collects account/contact identity data through Google OAuth.
- App collects user content/activity: watch history, watchlist, ratings,
  private reflections, favorite-character selections, comments, and watch paths.
- Data is linked to the user because it powers a personal library.
- Data is not used for third-party advertising or sold by TVLore.
- Data is shared with service providers needed to run the product.

Review the final answers against the exact store questions before submission.
