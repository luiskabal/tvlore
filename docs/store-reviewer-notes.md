# Store Reviewer Notes

Use this as the draft reviewer note source for TestFlight, App Store Connect,
Google Play internal testing, and manual release QA.

## App Purpose

TVLore is a private entertainment tracker. Users can search shows and movies,
save titles to watch later, mark movies/shows/seasons/episodes watched, rate
titles, add private post-watch reflections, discover titles, and review their
personal library.

## Reviewer Login

Supported release login paths:

- Google sign-in through Supabase Auth.
- Sign in with Apple on iOS after Apple Developer and Supabase Apple provider
  configuration are complete.

For release review, provide either:

- a reviewer-owned Google or Apple login path, or
- a dedicated test account created for review.

Do not include passwords or secrets in this file.

## Core Flow To Test

1. Launch TVLore.
2. Sign in.
3. Open Search.
4. Search for a title, for example `dark`.
5. Open a show or movie detail.
6. Save the title to the watchlist.
7. Mark a movie, show, season, or episode watched.
8. Complete the post-watch check-in with star rating, emotion, favorite
   character when cast is available, and optional comment.
9. Return to Library and confirm stats/history update.
10. Change availability country in Profile.
11. Open Where to Watch on a detail screen and confirm country-aware providers.
12. Open Paths and save a curated or imported path to the watchlist.
13. Sign out.

## Account Deletion

Profile includes a delete-account action. Before release QA, configure
`SUPABASE_SERVICE_ROLE_KEY` in Vercel so `DELETE /users/me` can remove the
Supabase Auth user in addition to TVLore-owned private data.

## Public Support URLs

- Privacy: `https://tvlore-api.vercel.app/privacy`
- Terms: `https://tvlore-api.vercel.app/terms`
- Support: `https://tvlore-api.vercel.app/support`
- Account deletion: `https://tvlore-api.vercel.app/account-deletion`

## Known External Gates

- EAS project envs must exist for `development`, `preview`, and `production`.
- Supabase Auth redirect URLs must allow `tvlore://auth/callback`.
- Apple Developer App ID `com.luiskabal.tvlore` must enable Sign in with Apple.
