# Google Play Android Release Prep

This document turns the v1.0 release docs into the concrete Google Play Console
steps for the Android-first lane.

It is an engineering checklist, not legal advice. Keep the final Play Console
answers aligned with [Data Inventory](data-inventory.md), [Store Metadata
Pack](store-metadata.md), and the public privacy page.

## Sources

- Google Play app review setup:
  https://support.google.com/googleplay/android-developer/answer/9859455
- Google Play sign-in detail requirements:
  https://support.google.com/googleplay/android-developer/answer/15748846
- Google Play account deletion requirements:
  https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play personal-account testing requirements:
  https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play internal testing:
  https://play.google.com/console/about/internal-testing/
- Google Play Data safety:
  https://support.google.com/googleplay/android-developer/answer/10787469

## Current Android Lane

Run these from the repo root before creating a new Android preview build:

```powershell
corepack pnpm release:android:smoke
```

Then create the installable preview APK:

```powershell
corepack pnpm release:android:build:preview
```

Use production only after preview QA passes:

```powershell
corepack pnpm release:android:build:production
```

## Play Console App Record

Use these values when creating the app:

| Field | Value |
| --- | --- |
| App name | `TVLore` |
| Default language | English |
| App or game | App |
| Free or paid | Free |
| Android package | `com.luiskabal.tvlore` |
| Category | Entertainment |
| Contains ads | No |
| Privacy policy | `https://tvlore-api.vercel.app/privacy` |
| Account deletion URL | `https://tvlore-api.vercel.app/account-deletion` |

Recommended first-release audience: not designed for children. TVLore displays
external entertainment catalog metadata that can include mature shows or movies,
so avoid the Families surface unless the product is deliberately redesigned for
that audience.

## App Content Checklist

Complete these in Play Console under Policy and programs -> App content:

- Privacy Policy: use `https://tvlore-api.vercel.app/privacy`.
- Ads: No.
- App access / Sign-in details: restricted functionality exists because the app
  requires Google login.
- Target audience and content: choose the adult/non-children audience that
  matches the store positioning.
- Data safety: answer from [Data Inventory](data-inventory.md).
- Account deletion: use the public deletion URL and confirm in-app deletion is
  available from Profile.
- Content rating: complete the questionnaire using the app's actual content and
  catalog-browsing behavior.

## Sign-In Details For Review

Google requires reviewer access when functionality is behind login. Provide an
English instruction set that is always valid.

Draft:

```text
TVLore requires Google sign-in to access the private library and tracking
features.

Use the provided reviewer Google account to sign in:

Email: REVIEWER_GOOGLE_EMAIL
Password: REVIEWER_GOOGLE_PASSWORD

After sign-in, verify:
1. Open Search.
2. Search for "dark".
3. Open a title.
4. Add it to Watchlist.
5. Mark a movie or episode watched.
6. Complete or skip the check-in.
7. Open Library and verify the item appears.
8. Open Profile to verify Privacy, Terms, Support, and Delete account links.

No paid subscription, OTP, or location-specific password is required.
```

Do not commit real reviewer credentials. Store them only in Play Console.

## Data Safety Starting Point

Use the exact Play Console wording, but the engineering baseline is:

- The app collects user-provided and account-linked data.
- Data is linked to the user.
- Data is used for app functionality, personalization, account management, and
  reliability.
- TVLore does not sell user data.
- TVLore does not use data for third-party advertising.
- Data is encrypted in transit through HTTPS.
- Users can request/delete account data in-app and through the public deletion
  URL.

Likely collected categories based on current implementation:

| Play Console area | TVLore data |
| --- | --- |
| Personal info | Email, display name, avatar URL from Google OAuth. |
| App activity | Watch history, watchlist, ratings, reflections, personal watch paths, availability country. |
| User-generated content | Private comments/reflections and favorite-character selections. |
| Diagnostics / identifiers | Operational request metadata in Vercel/Supabase logs, Supabase Auth user ID. |

Third-party services involved:

- Supabase for auth and database.
- Vercel for API hosting.
- TMDB for catalog, images, cast, ratings, discovery, and watch-provider data.
- Google as OAuth identity provider.

## Testing Track Plan

Use Internal testing first for fast install checks with trusted testers. Google
describes internal testing as a quick distribution track for up to 100 invited
testers.

If the Google Play developer account is a personal account created after
2023-11-13, production access requires a closed test with at least 12 opted-in
testers for 14 continuous days before applying for production access. Plan for
that calendar delay early.

## Internal Testing Execution

Use this sequence after Google finishes developer-account verification:

1. Create the Play Console app record with the values above.
2. Complete required App content sections enough to allow an internal release.
3. Run the Android release smoke:

```powershell
corepack pnpm release:android:smoke
```

4. Build the Android production artifact for Play Console upload:

```powershell
corepack pnpm release:android:build:production
```

5. In Play Console, open Test and release -> Testing -> Internal testing.
6. Create an email tester list for trusted testers only.
7. Create a release and upload the EAS-generated Android artifact.
8. Add reviewer sign-in instructions from [Store Reviewer Notes](store-reviewer-notes.md).
9. Roll out the internal release and share the opt-in link with testers.
10. Run the Android manual QA gate below from the installed Play build.

Internal testing is the v1.0-internal gate. It validates installability,
authentication, deep links, backend connectivity, and the core product loop
through Google Play distribution, but it does not by itself grant production
access for new personal developer accounts.

## Closed Testing Promotion Gate

Use Closed testing after internal QA passes and before public production access.

Minimum production-access gate for a new personal account:

- At least 12 testers opted into the closed test.
- Testers stay opted in continuously for 14 days before applying for production
  access.
- The build should be stable enough that testers can use the core loop without
  repeated reinstall/reset instructions.

Invite more than 12 people. Plan for 15-20 trusted testers so the test still
meets the 12-opted-in requirement if some people never install the app.

Closed testing should use the same release checklist as internal testing, plus:

- One feedback channel for testers.
- A small known-issues list.
- A decision log for fixes that block public production.
- A final production-access application only after the 14-day window is complete.

## Tester And Feedback Plan

Keep real tester names, emails, and phone numbers outside git. Use Play Console
tester lists, a private spreadsheet, or a private form.

Recommended tester roster fields:

| Field | Why |
| --- | --- |
| Name | Identify feedback without exposing it in git. |
| Google account email | Required for Play Console tester list invites. |
| Device model | Helps reproduce Android/device-specific issues. |
| Android version | Helps spot OS-specific regressions. |
| Opted-in date | Needed for the 14-day closed testing window. |
| Installed build/version | Confirms which build produced feedback. |
| Core loop completed | Shows whether search -> watched -> rating -> library worked. |
| Blocker reported | Separates release blockers from polish requests. |

Recommended feedback fields:

| Field | Example |
| --- | --- |
| Build | `1.0.0 (versionCode 1)` |
| Device | `Pixel 8 / Android 15` |
| Flow | `Google login`, `Search`, `Episode watched`, `Account deletion` |
| Expected | What the tester thought should happen. |
| Actual | What happened instead. |
| Screenshot/video | Optional, useful for UI bugs. |
| Severity | `blocker`, `major`, `minor`, `polish` |

Release rule: fix blockers and major broken flows before applying for public
production access. Put polish feedback back into the normal backlog unless it
blocks a reviewer or a new user's first successful session.

## Android Manual QA Gate

Before promoting beyond internal testing, run the Android column in [Release
Smoke Checklist](release-smoke-checklist.md), especially:

- Fresh install and cold launch.
- Google login and logout.
- Cold restart after login.
- Search, filters, detail navigation.
- Movie/show/season/episode tracking.
- Rating and post-watch check-in.
- Watchlist save/remove.
- Where to Watch.
- Watch Paths.
- Profile legal links.
- Account deletion only on a disposable account.

## Open Items

- Create the Play Console app record.
- Prepare an internal tester email list and feedback channel.
- Add reviewer Google credentials in Play Console only.
- Capture screenshots from a preview or production Android build.
- Complete Data safety and Content rating forms.
- Run Android manual QA from the release checklist.
- Run a Closed testing track with 12 opted-in testers for 14 days before public
  production access if Play Console requires it for the personal account.
