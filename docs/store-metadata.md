# TVLore Store Metadata Pack

This document is the working source for App Store Connect, Google Play Console,
and release screenshots. Keep it aligned with the actual app before submitting a
release candidate.

## App Identity

| Field | Value |
| --- | --- |
| App name | TVLore |
| Bundle identifier | `com.luiskabal.tvlore` |
| Android package | `com.luiskabal.tvlore` |
| Primary category | Entertainment |
| Secondary category | Lifestyle |
| Support URL | `https://tvlore-api.vercel.app/support` |
| Privacy Policy URL | `https://tvlore-api.vercel.app/privacy` |
| Terms URL | `https://tvlore-api.vercel.app/terms` |
| Account deletion URL | `https://tvlore-api.vercel.app/account-deletion` |

## Short Copy

Use this for subtitles, short descriptions, and first-line store copy:

```text
Track, rate, and rediscover the shows and movies you watch.
```

Alternative shorter line:

```text
Your private tracker for shows, movies, and watch paths.
```

## Long Description Draft

```text
TVLore is a private entertainment tracker for shows, seasons, episodes, and movies.

Search for titles, save what you want to watch later, mark movies or episodes watched, rate what you have seen, and keep a personal chronology of your viewing history.

TVLore also helps you discover what to watch next with country-aware availability, popular titles in your region, curated watch paths, and simple recommendation signals based on your own ratings.

Core features:
- Track shows, seasons, episodes, and movies.
- Save titles to a personal watchlist.
- Rate shows, movies, and episodes with stars.
- Add private post-watch reflections with emotion, favorite character, and notes.
- See where a title is available to stream in your selected country.
- Browse curated viewing paths such as movie sagas and collections.
- Keep your library private and under your control.
```

## Keywords

Use a subset that fits each store field:

```text
tv tracker, movie tracker, show tracker, watchlist, episodes, series, streaming, recommendations, ratings, watch path, entertainment
```

## Screenshot Set

Capture screenshots from a preview or production build, not from a local debug
session.

| Slot | Screen | What it should show |
| --- | --- | --- |
| 1 | Library | Holo card, summary stats, and one useful section with real content. |
| 2 | Search | Empty Search state with TVLore Picks, recommendations, Popular, or Available entries. |
| 3 | Title detail | Poster, rating comparison, Where to Watch, and tracking panel. |
| 4 | Season or episode | Season context, episode list, watched state, and episode navigation. |
| 5 | Check-in | Star rating, emotion, favorite-character picker, and optional note field. |
| 6 | Watch Paths | Curated or personal ordered path with posters and saved state. |
| 7 | Profile | Country preference plus Privacy, Terms, Support, and account deletion links. |

## Screenshot Rules

- Use a disposable review account, not a personal account.
- Do not show raw Supabase user IDs, OAuth tokens, API diagnostics, or debug
  health cards.
- Do not show production secrets, Vercel dashboards, Postman tokens, or local
  `.env` files.
- Prefer real posters and provider icons where they already render in the app.
- Keep TMDB or JustWatch attribution visible anywhere provider availability is
  shown.
- Avoid screenshots that imply social features, public comments, push
  notifications, or paid subscriptions for v1.0.

## Store Privacy Starting Point

Use [Data Inventory](data-inventory.md) as the engineering source of truth.

High-level answers:

- Data is linked to the user because TVLore stores a private library.
- Data is used for app functionality, personalization, and product reliability.
- TVLore does not sell user data.
- TVLore does not use user data for third-party advertising.
- Account deletion is available in-app and through the public deletion URL.

## Reviewer Notes Source

Use [Store Reviewer Notes](store-reviewer-notes.md) for the review account
instructions and core test flow. Do not put passwords or secrets in git.

## Release Check

Before submission, confirm:

- This copy still matches the app.
- Screenshots were captured from the same commit or release candidate build.
- Store claims mention only implemented v1.0 features.
- Public URLs open without authentication.
- Account deletion is configured in Vercel before account-deletion QA.
