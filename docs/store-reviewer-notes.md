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
- Sign in with Apple is an iOS-only future release path while Apple Developer
  membership and Supabase Apple provider setup are blocked.

For Android / Google Play review, use Google sign-in only. Provide either:

- a reviewer-owned Google login path, or
- a dedicated test account created for review.

Do not include passwords or secrets in this file.

## Google Play App Access Draft

Use this as the Play Console App access note. Replace placeholders only inside
Play Console:

```text
TVLore requires Google sign-in to access the private library and tracking
features.

Use the provided reviewer Google account:

Email: REVIEWER_GOOGLE_EMAIL
Credential: configured in this Play Console form only.

After sign-in:
1. Open Search.
2. Search for "dark".
3. Open a show or movie detail.
4. Save the title to Watchlist.
5. Mark a movie, show, season, or episode watched.
6. Complete or skip the post-watch check-in.
7. Return to Library and confirm the item appears.
8. Open Profile and verify Privacy, Terms, Support, and Delete account links.

No paid subscription, OTP, or external reviewer setup is required.
```

If the reviewer account is not a dedicated Google account, make sure the account
is invited to the relevant Play testing track before review.

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

- EAS project envs should be rechecked before each preview/production build.
- Supabase Auth redirect URLs must allow `tvlore:///auth/callback`.
- Apple Developer App ID `com.luiskabal.tvlore` must enable Sign in with Apple.
- Google Play internal testing may temporarily show the app as
  `com.luiskabal.tvlore (unreviewed)` while listing review/propagation is still
  pending.
