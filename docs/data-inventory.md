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

## Data Not Stored By TVLore

| Data | Reason |
| --- | --- |
| Database passwords | Backend-only envs live outside git/mobile. |
| TMDB access token | Backend-only env in Vercel/local API env. |
| Supabase service-role key | Backend-only env used for privileged account deletion. |
| Google provider tokens | Supabase/mobile session concern; not persisted in TVLore product tables. |
| Raw OAuth callback URLs | Used transiently during login/testing only. |
| Payment data | Payments/subscriptions are out of scope for v1.0. |
| Public social content | Public comments, followers, and social matching are out of scope for v1.0. |
| Exact device location | Country preference is user-selected; no GPS/location permission is required for current features. |

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

Practical mapping:

| Store area | TVLore answer direction |
| --- | --- |
| Account info / personal info | Email, display name, avatar, and auth identifier are linked to the user and used for app functionality/account management. |
| App activity | Watch history, watchlist, ratings, reflections, and watch paths are linked to the user and used for app functionality and personalization. |
| User-generated content | Private comments/reflections and favorite-character selections are user-provided, private, and linked to the user. |
| Diagnostics | Vercel/Supabase operational logs may contain request metadata for reliability and abuse prevention. |
| Location | No precise or approximate device location; availability country is a manual profile setting. |
| Financial info | None in v1.0. Revisit this document before adding payments/subscriptions. |
| Advertising | No third-party advertising and no data sale in v1.0. |

Before public release, re-check that the public Privacy Policy, Play Data
Safety, and App Store privacy answers all describe the same data behavior.
