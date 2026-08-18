# TVLore v1.0 Release Roadmap

This document catalogs what TVLore already has, what is missing for a real
store-ready v1.0, and the recommended roadmap to get there.

The v1.0 target is not "add every fun idea." The target is:

> A stable private entertainment tracker that lets a user search, save, track,
> rate, reflect on, and discover shows, movies, seasons, and episodes.

## Sources

Store policies change, so verify these again before submission:

- Apple App Review Guidelines:
  https://developer.apple.com/app-store/review/guidelines/
- Apple account deletion guidance:
  https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Apple App Privacy Details:
  https://developer.apple.com/app-store/app-privacy-details/
- Google Play User Data / Data Safety:
  https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play account deletion requirements:
  https://support.google.com/googleplay/android-developer/answer/13327111
- Expo EAS app-store submission:
  https://docs.expo.dev/deploy/submit-to-app-stores/
- Expo EAS build setup:
  https://docs.expo.dev/build/setup/
- Expo Apple Authentication:
  https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- Supabase Apple Login:
  https://supabase.com/docs/guides/auth/social-login/auth-apple

## 1. v1.0 Product Positioning

v1.0 should ship as a private personal tracker and discovery app.

In scope:

- Google sign-in, and Apple sign-in where required for iOS review.
- Personal library.
- Search and resolve.
- Show, season, episode, and movie detail.
- Watchlist.
- Watched/unwatched tracking.
- Show-level and season-level bulk watched actions.
- Ratings for shows, movies, and episodes.
- Post-watch reflection: star rating, reaction/emotion, favorite character, optional comment.
- Library filters and chronology.
- Where to Watch by country.
- Recommended picks.
- Available to stream in your country.
- Popular in your country.
- Watch Paths, curated and personal.
- Profile country preference.
- Account/logout/privacy/release readiness.

Out of scope for v1.0:

- Social feed.
- Public comments.
- Followers/friends.
- TVLore Match.
- Public favorite-character voting percentages.
- Push notifications.
- Payments/subscriptions.
- Admin/web frontend.
- Offline mutation queue.
- Advanced ML/collaborative recommendations.
- Direct streaming deep links unless the provider contract supports them clearly.

Rationale: public social surfaces add moderation, reporting, blocking, privacy,
and user-generated-content review requirements. The private app already has
enough value to justify a first release.

## 2. Current Capability Catalog

| Area | Status | Notes |
| --- | --- | --- |
| Backend deployment | Ready | Vercel API is deployed at `https://tvlore-api.vercel.app`. |
| Database | Ready | Supabase Postgres + Prisma migrations are in place. |
| Authentication | Partial | Google OAuth works. Native iOS Apple Sign-In is wired in mobile; Apple Developer and Supabase provider configuration are still required for release-like testing. |
| User profile | Ready | `GET /users/me`, `PATCH /users/me`, availability country. |
| Search | Ready | TMDB-backed show/movie search through backend. |
| Resolve | Ready | TMDB refs become internal TVLore IDs on demand. |
| Show/movie detail | Ready | Internal detail screens and backend endpoints exist. |
| Season/episode detail | Ready | Seasons hydrate episodes; episode detail exists. |
| Tracking | Ready | Movie, episode, season, and show watched/unwatched flows exist. |
| Watchlist | Ready | Show/movie save/remove, including swipe removal from Library. |
| Ratings | Ready | Show/movie/episode 1-5 ratings exist with star controls in mobile. |
| Post-watch reflection | Ready | Dedicated check-in screen with star rating, emotion, cast picker, and comment. |
| Library | Ready | Summary filters, chronology, continue watching, watchlist, rated titles. |
| Discovery | Ready | Recommendations, Available to stream, and Popular in your country exist. |
| TVLore Picks | Ready | Backend-owned editorial TMDB refs shown from Search. |
| Where to Watch | Ready | TMDB Watch Providers by saved country, shown on detail screens. |
| Watch Paths | Ready | Curated paths, personal imports, TMDB title URL parsing, TMDB Collection import, save-to-watchlist. |
| Mobile architecture | Ready | Screen -> hook -> API/auth client boundary is established. |
| Tests | Partial | Unit/type checks are good; device QA and release smoke checklist are still needed. |
| Postman/API smoke | Ready | Collection and `api:check` exist. |
| Documentation | Partial | Architecture/current state exist; release-specific plan begins here. |

## 3. Store / Release Gap Catalog

### Blocking Before Store Submission

| Gap | Why It Blocks | Target |
| --- | --- | --- |
| In-app account deletion | Apple and Google require account deletion if account creation exists. | Implemented in Profile and `DELETE /users/me`; configure `SUPABASE_SERVICE_ROLE_KEY` in deployment before release. |
| Web account deletion URL | Google requires a web resource for users who uninstalled the app. | Done: `https://tvlore-api.vercel.app/account-deletion`. |
| Sign in with Apple | Apple requires an equivalent login option when third-party login creates the app account. | Mobile UI/token exchange is implemented; configure Apple Developer and Supabase Apple provider before release. |
| Privacy Policy | Required for collected personal data and store metadata. | Done as developer-preview URL: `https://tvlore-api.vercel.app/privacy`; review final wording before submission. |
| Data Safety / App Privacy answers | Required in Play Console and App Store Connect. | Data inventory exists; final forms still need completion. |
| Reviewer access | Reviewers need to access protected app functionality. | Provide test credentials/instructions or a reviewable auth path. |
| Production EAS profiles | Partial | EAS development, preview, production, remote build-number increment, and minimal submit profiles are configured. EAS project envs and first real store builds still need validation. |
| Store assets | App icon, splash, screenshots, support URL, marketing copy. | Prepare iOS and Android metadata. |

### High Priority Before 1.0

| Gap | Risk | Target |
| --- | --- | --- |
| Remove dev defaults | Search previously started with a seeded dev query. | Done: Search starts empty with discovery cards. |
| Disable/protect test error endpoint | `/health/error` is useful for development but risky in production. | Done: hidden when `NODE_ENV=production`. |
| Rate limiting / provider cost guard | Search, resolve, providers, recommendations, and discovery can hit TMDB. | Done: in-memory API/provider route limits with optional env tuning. |
| Device QA matrix | Unit tests do not catch mobile store/device issues. | Test iPhone, Android, cold launch, auth, deep link, bad network. |
| Crash/error monitoring | Store releases need faster issue diagnosis. | Add minimal Sentry or equivalent only when release candidates start. |
| Legal/support surfaces | Users need help and policies from Profile and store listing. | Done as developer-preview Profile links plus API pages. |

### Nice After 1.0

| Gap | Why Later |
| --- | --- |
| Better recommendation engine | Current explainable baseline is enough for v1.0. |
| Favorite-character percentages | Needs aggregate vote model and privacy decisions. |
| Social/match | Bigger moderation/privacy/compliance surface. |

## 4. v1.0 Roadmap

### Milestone 0 - Scope Freeze

Goal: stop feature creep and define what v1.0 means.

Tasks:

- Treat this document as the release source of truth.
- Keep social/match out of v1.0.
- Keep richer recommendations as post-1.0 unless all blockers are cleared.
- [x] Add a release checklist template for TestFlight/closed testing.

Exit criteria:

- v1.0 scope is documented.
- Backlog labels separate store blockers, hardening, and product polish.

### Milestone 1 - Account and Compliance

Goal: satisfy the rules that can block app review.

Tasks:

- [x] Add mobile native Sign in with Apple UI and Supabase token exchange.
- [ ] Configure Apple Developer identifiers and Supabase Apple provider.
- [x] Add backend account deletion flow.
- [x] Add mobile delete-account UI under Profile.
- [x] Decide deletion behavior:
  - delete Supabase Auth user where possible,
  - delete or anonymize TVLore user records,
  - delete private watch history, watchlist, ratings, reflections, and personal paths,
  - keep catalog rows that are not user-owned.
- [x] Add public Privacy Policy URL.
- [x] Add public Support URL.
- [x] Add public account deletion/support URL for Google Play.
- [x] Add Profile links to Privacy, Terms, Support, and Delete Account.
- [x] Inventory data for App Store privacy and Google Play Data Safety forms.

Exit criteria:

- A real user can delete their account from the app.
- A reviewer can find account deletion within Profile.
- Store privacy/data forms can be answered from the data inventory.

### Milestone 2 - Production App Build

Goal: create installable store binaries, not just a development build.

Tasks:

- [x] Configure final app name, bundle identifiers, package name, scheme, icon, splash, and adaptive icon.
- [x] Configure EAS development, preview, and production build profiles.
- [x] Configure a minimal EAS submit profile and document prompts for store-specific IDs.
- [x] Add remote EAS build-number auto-increment for production builds.
- [ ] Configure required EAS project environment variables for development, preview, and production.
- [ ] Confirm Supabase redirect URLs for production scheme/build.
- [ ] Confirm Vercel envs are production-safe.
- [ ] Create reviewer notes for auth and core flows.

Exit criteria:

- `eas build --profile production` can produce iOS and Android binaries.
- Production builds can log in and call the Vercel API.
- OAuth callback works outside the development build.

### Milestone 3 - Stability and Safety Hardening

Goal: reduce review and first-user failure risk.

Tasks:

- [x] Remove seeded Search query before release.
- [x] Disable or protect `/health/error` outside development.
- [x] Add simple backend rate limiting or abuse guard for expensive authenticated routes.
- [x] Add a small release smoke script/checklist for mobile manual QA.
- Run `corepack pnpm verify:full`.
- Run authenticated `corepack pnpm api:check` against Vercel.
- Add minimal crash/error monitoring if release candidates expose hard-to-debug mobile failures.
- Review TMDB/JustWatch attribution and provider terms in visible surfaces.

Exit criteria:

- No known production-only dev affordances remain.
- Authenticated API smoke passes against Vercel.
- Manual iOS and Android QA passes the release checklist.

### Milestone 4 - Beta

Goal: validate the v1.0 app with real devices and non-developer usage.

Tasks:

- Ship TestFlight build.
- Ship Google Play internal or closed testing build.
- Test fresh install, login, logout, account deletion, country update, search, watchlist, watched state, ratings, check-in, Where to Watch, Watch Paths, recommendations, Available to stream, Popular in your country.
- Record issues as backlog items.
- Fix only blockers or severe UX failures.

Exit criteria:

- No crash in the core first-session flow.
- Account deletion and privacy links are verified in production build.
- At least one full watched/rating/check-in/library-refresh loop succeeds on iOS and Android.

### Milestone 5 - v1.0 Submission

Goal: submit a focused, private tracker to the stores.

Tasks:

- Complete App Store Connect privacy labels and review notes.
- Complete Google Play Data Safety and account deletion questions.
- Upload screenshots and metadata.
- Submit iOS.
- Submit Android.
- Track review feedback as release blockers, not feature requests.

Exit criteria:

- iOS approved.
- Android approved.
- `v1.0.0` tag created after approved binaries match the shipped commit.

## 5. Recommended Execution Order

Do these next:

1. Account deletion backend + mobile.
2. Sign in with Apple.
3. Privacy/Support/Delete web URLs.
4. Production EAS config.
5. Release hardening pass.
6. Beta QA.
7. Store submission.

Skip for now:

- New discovery sections.
- Social.
- Recommendation engine rewrite.
- UI redesign beyond release-blocking clarity.

## 6. Release Readiness Checklist

Use [Release Smoke Checklist](release-smoke-checklist.md) as the detailed gate
before TestFlight/closed testing. Quick gate:

- [ ] `corepack pnpm verify` passes.
- [ ] `corepack pnpm verify:full` passes.
- [ ] Authenticated `corepack pnpm api:check` passes against Vercel.
- [ ] iOS production build installs.
- [ ] Android production build installs.
- [ ] Google login works where allowed.
- [ ] Apple login works on iOS after provider configuration.
- [ ] Account deletion works and removes/anonymizes user-owned data.
- [x] Privacy Policy link opens from Profile and store metadata.
- [x] Support link opens from Profile and store metadata.
- [x] Google Play deletion URL is public.
- [x] Search starts in a release-friendly state.
- [x] `/health/error` is not publicly exposed in production.
- [ ] Store screenshots and descriptions match the actual app.
- [ ] Reviewer instructions are written.
- [ ] No secrets are committed.
- [ ] No known blocker remains in `docs/backlog.md`.
