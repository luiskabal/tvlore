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

## Current Android Store State

Use this as the current Play Console baseline:

| Field | Current value |
| --- | --- |
| Developer account | Personal account |
| Identity verification | Verified |
| Android app record | Created |
| Android package | `com.luiskabal.tvlore` |
| Default language | English (United States) - `en-US` |
| App or game | App |
| Pricing | Free |
| Track | Internal testing |
| Release | `9 (1.0.0)` |
| Version code | `7` |
| Bundle format | Android App Bundle (`.aab`) |
| Current install blocker | None for internal testing install; tester install from Play is confirmed. |

Android 1.0 currently means an internal/closed-testable Play build, not public
production. Public production is a later gate after closed testing, Play review,
store forms, screenshots, and required tester windows are complete.

## Play Console Fields Still To Finish

Keep these in Play Console, not in git when they include private contact data or
credentials:

| Area | Status | Source of truth |
| --- | --- | --- |
| Internal tester list | In Play Console only | Private tester roster outside git |
| Reviewer login credentials | Pending | Play Console App access field only |
| Store listing graphics | Pending | Screenshots from release-like Android build |
| Data safety | Pending | [Data Inventory](data-inventory.md) |
| Content rating | Pending | Play Console questionnaire |
| App access/sign-in details | Pending | [Store Reviewer Notes](store-reviewer-notes.md) |
| Target audience | Pending | Adult/non-children positioning |
| Support/developer contact email | Pending | Prefer a dedicated support alias, not a personal inbox if possible |
| Deobfuscation mapping | Deferred | [Google Play Android Release Prep](google-play-android-release.md) |

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

Capture screenshots from a preview or production Android build, not from a local
debug session or Expo Go. The screenshots should show the release UX, not
developer diagnostics.

| Slot | Screen | What it should show |
| --- | --- | --- |
| 1 | Library | Holo card, summary stats, and one useful section with real content. |
| 2 | Search | Empty Search state with TVLore Picks, recommendations, Popular, or Available entries. |
| 3 | Title detail | Poster, rating comparison, Where to Watch, and tracking panel. |
| 4 | Season or episode | Season context, episode list, watched state, and episode navigation. |
| 5 | Check-in | Star rating, emotion, favorite-character picker, and optional note field. |
| 6 | Watch Paths | Curated or personal ordered path with posters and saved state. |
| 7 | Profile | Country preference plus Privacy, Terms, Support, and account deletion links. |

## Feature Claim Boundaries

Store text and screenshots may claim these v1.0 behaviors:

- Private Google-authenticated library.
- Search for shows and movies.
- Show, season, episode, and movie tracking.
- Watchlist.
- Star ratings for shows, movies, and episodes.
- Private post-watch check-ins with emotion, favorite character, and optional
  notes.
- Country-aware Where to Watch provider icons and attribution.
- Curated and imported Watch Paths.
- Personalized recommendations, Popular in your country, Available in your
  country, and TVLore Picks.
- Public Privacy, Terms, Support, and Account deletion pages.

Do not claim these until they are implemented and reviewed:

- Public social feeds or comments.
- Friend matching, QR sharing, or TVLore Match.
- Push notifications.
- Paid subscriptions, purchases, or monetization.
- Offline mode.
- Family/children-specific design.
- Production iOS availability.

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
Use [Google Play Android Release Prep](google-play-android-release.md) for the
Android-first Play Console checklist.

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
