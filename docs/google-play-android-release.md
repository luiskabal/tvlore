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
- Android App Bundle:
  https://developer.android.com/guide/app-bundle
- Upload Android App Bundles to Play Console:
  https://developer.android.com/studio/publish/upload-bundle
- Deobfuscate or symbolicate crash stack traces:
  https://support.google.com/googleplay/android-developer/answer/9848633

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

## Android App Bundle

Google Play receives Android store builds as an Android App Bundle, or `.aab`.
The bundle is not the same thing as the final APK installed on the device:

```text
EAS production build -> .aab upload -> Google Play generates device-specific APKs
```

The AAB contains the app's compiled code and resources. Google Play then
generates optimized APKs for each device configuration and signs/distributes
those APKs through Play.

For TVLore this means:

- Upload `.aab` files to Play Console tracks.
- Use preview APKs only for direct install QA outside Play.
- Increase Android `versionCode` for every new Play upload.
- Keep the package name stable as `com.luiskabal.tvlore`.
- Treat Play-generated APK install behavior as the real release signal, not the
  local APK alone.

## Current Internal Testing State

Current Android internal testing baseline:

| Field | Value |
| --- | --- |
| Track | Internal testing |
| Status | Active |
| Release | `8 (1.0.0)` |
| Version code | `8` |
| Android package | `com.luiskabal.tvlore` |
| Track visibility | Available to invited internal testers |
| Play install | Confirmed from the tester opt-in flow |
| Play listing state | Temporary app name may show as `com.luiskabal.tvlore (unreviewed)` until Google finishes review/processing |

If a tester can open the opt-in page but Play Store says the item was not
found, treat it first as a Play propagation/review issue rather than an app
code issue.

Typical signals:

| Signal | Meaning |
| --- | --- |
| Opt-in page says the account is a tester | The tester list/opt-in link is probably working. |
| Play Store says the item was not found | The install surface may not have propagated, the account/device may not match, or Play review/setup may still be pending. |
| Console track is `Active` and shows a release | The artifact is rolled out to that track, but Store availability can still lag. |
| App name shows `com.luiskabal.tvlore (unreviewed)` | Expected while Google has not fully reviewed/listed the app. |

Troubleshooting order:

1. Confirm the tester opted in with the same Google account used in Play Store.
2. Wait for Play processing/propagation. Internal testing releases can be
   available in Console before the Store install surface resolves everywhere.
3. Reopen the opt-in link from the Android device.
4. In Play Console, verify the track still shows `Active` and the release is
   available to internal testers.
5. Check Publishing overview for pending review/tasks that block listing
   availability.
6. If the app still cannot be downloaded after the propagation window, create a
   new release only after confirming tester account, track status, and app
   content tasks are correct.

If the opt-in page works but the Store page fails, do not change the package
name, app record, signing setup, or release track unless Play Console points to
one of those as the problem. Those identifiers are hard release anchors.

Do not rebuild solely because the first Store tap says the item was not found.
Rebuild only when Play Console flags the artifact or the installed app fails
manual QA.

Historical TVLore case on August 21, 2026:

```text
Console: Internal testing track is Active.
Release: 3 (1.0.0), version code 3.
Tester page: account accepted as tester for com.luiskabal.tvlore (unreviewed).
Android Play Store: "No se encontro el elemento" after tapping Download test app.
```

Treat that exact combination as a distribution-state issue first. The app
bundle was accepted and rolled out to the internal track, so the next checks are
account/device propagation and Play review/listing status, not code changes.
The safest response is to wait, retry from the same tester account, and inspect
Publishing overview before uploading another bundle.

Current TVLore state on August 23, 2026:

```text
Release: 8 (1.0.0), version code 8.
Tester install from Google Play internal testing is confirmed.
Next gate: Android manual QA from the Play-installed build.
```

Latest internal release:

```text
Release: 8 (1.0.0), version code 8.
Git commit: 51436f0.
EAS build ID: 30f5d81b-e475-420d-b5e4-ecffb2804e60.
EAS submission ID: f7be05ea-35ab-4e07-9db3-b0a6b46e2ab1.
AAB artifact: https://expo.dev/artifacts/eas/7U3ikjz0Vygm3YxcM_YpaIPVkedei3Q_IIXCcBqbmhs.aab
Purpose: add app-level edge-pan back gestures and enable Android predictive
back for secondary/detail routes.
```

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
Credential: configure the reviewer credential in Play Console only.

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
7. Upload the EAS-generated Android artifact.

If the Google Play service account JSON has already been configured for EAS
Submit, use:

```powershell
corepack pnpm release:android:submit:production
```

Or build and submit in one command:

```powershell
corepack pnpm release:android:build-and-submit:production
```

If the service account JSON is not configured yet, create the release manually
in Play Console and upload the `.aab` generated by EAS Build. Never commit the
service account JSON.

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

## Deobfuscation Mapping

Google Play may warn that the uploaded Android App Bundle has no deobfuscation
file. This is non-blocking for internal testing.

Obfuscation is a release build optimization/debugging tradeoff. Android's R8
tool can rewrite class, method, and field names to shorter symbols. That can
reduce app size and make reverse engineering harder, but crash stack traces can
become unreadable:

```text
Readable source trace:
CatalogDetailScreen.markMovieWatched(...)

Obfuscated trace:
a.b.c(...)
```

The deobfuscation mapping file is the dictionary between those two worlds. It
lets Play Console translate crash and ANR reports back to source-level names.
Without it, a production crash can still be detected, but the stack trace is
harder to diagnose.

For TVLore:

- Internal testing can continue without the mapping file.
- Before public production, upload the mapping file if minification or
  obfuscation is enabled.
- Upload the mapping for the matching version code only.
- Do not commit mapping files unless we intentionally decide they belong in a
  private release artifact flow.

Keep this as release hardening, not a blocker for the first internal testing
build.

Observed in TVLore internal release `6 (1.0.0)`: Play Console showed the missing
deobfuscation file as a warning only. The release can stay in internal testing;
add mapping upload before public production hardening if minification remains
enabled.

## Open Items

- Prepare the closed-testing tester email list and feedback channel.
- Add reviewer Google credentials in Play Console only.
- Capture screenshots from a preview or production Android build.
- Complete Data safety and Content rating forms.
- Run Android manual QA from the release checklist.
- Upload Android deobfuscation mapping before production hardening if
  minification is enabled.
- Run a Closed testing track with 12 opted-in testers for 14 days before public
  production access if Play Console requires it for the personal account.
