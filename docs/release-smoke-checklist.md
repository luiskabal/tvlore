# Release Smoke Checklist

Use this checklist before TestFlight, Google Play internal testing, or any
release-candidate build. The goal is to catch broken core flows, not to perform
exploratory QA.

## Required Setup

- Latest `main` is pushed.
- Vercel `tvlore-api` points to the intended commit.
- Local `.env` files match the tracked `.env.example` files.
- `corepack pnpm env:check` passes for local API/mobile envs and Vercel env names.
- EAS project env vars exist for the profile being built.
- `corepack pnpm eas:env:check` passes when Expo login is available locally.
- `corepack pnpm release:preflight` passes before EAS preview/production builds.
- `TVLORE_SUPABASE_ACCESS_TOKEN` is set when running authenticated API smoke.
- Mobile points to `https://tvlore-api.vercel.app`.
- Test account is not a personal account that cannot be deleted during QA.

## Automated Smoke

Run from the repository root:

```powershell
corepack pnpm release:smoke
```

If release secrets are not configured yet, run the public/non-destructive smoke:

```powershell
corepack pnpm release:smoke:public
```

To validate only the public store/legal URLs:

```powershell
corepack pnpm store:check
```

To validate EAS remote env names without printing values:

```powershell
corepack pnpm eas:env:check
```

To validate Supabase Google OAuth accepts the native callback:

```powershell
corepack pnpm auth:redirect:check
```

For the Android-first lane:

```powershell
corepack pnpm release:android:preflight
corepack pnpm release:android:smoke
```

`release:android:smoke` keeps the mobile/EAS env, legal URL, OAuth callback,
build, and API gates, but does not require a complete local API `.env` for
Android preview QA against the deployed Vercel backend. The preflight messaging
treats Apple Developer setup as an iOS-only blocked gate instead of the next
Android action.

For authenticated API paths:

```powershell
$env:TVLORE_API_BASE_URL="https://tvlore-api.vercel.app"
$env:TVLORE_SUPABASE_ACCESS_TOKEN="SUPABASE_ACCESS_TOKEN"
corepack pnpm api:check
```

Expected result:

- Typecheck passes for every workspace.
- Unit tests pass for API and mobile.
- API build passes.
- Local API/mobile envs match `.env.example`.
- Required Vercel env names exist for Production and Preview.
- Required EAS public env names exist for development, preview, and production.
- Release preflight fails if a real `.env` file is tracked.
- Release preflight fails if obvious secret-like values are tracked.
- Release preflight fails if known development-only diagnostics appear in mobile UI source.
- Store public URLs return `200` HTML without authentication.
- Supabase Google OAuth returns a redirect for `tvlore:///auth/callback`.
- Public API smoke returns `200` for root/health routes.
- Protected routes return `401` without a token.
- Authenticated product flow passes when a token is provided.

## Backend Production Smoke

| Check | Expected |
| --- | --- |
| `GET /` | `200`, service is `tvlore-api`. |
| `GET /health` | `200`, service is `tvlore-api`, release metadata is present. |
| `GET /health/db` | `200`, database is `ok`, release metadata is present. |
| `GET /health/error` | `404` in production. |
| `GET /users/me` without token | `401 UNAUTHORIZED`. |
| `GET /users/me/account-deletion` without token | `401 UNAUTHORIZED`. |
| `GET /search?query=dark` without token | `401 UNAUTHORIZED`. |
| Rate-limit headers on `/users/me` | `x-ratelimit-limit=180` by default. |
| Rate-limit headers on `/search?query=dark` | `x-ratelimit-limit=40` by default. |

Quick rate-limit header check:

```powershell
Invoke-WebRequest https://tvlore-api.vercel.app/search?query=dark -SkipHttpErrorCheck
```

If PowerShell does not support `-SkipHttpErrorCheck`, use Postman and inspect
response headers.

## Mobile Device Matrix

Run this matrix on at least one iPhone before iOS beta and one Android device
or emulator before Android beta.

| Area | iPhone | Android | Expected |
| --- | --- | --- | --- |
| Fresh launch | [ ] | [ ] | App opens to Library/Auth state without crash. |
| Google login | [ ] | [ ] | OAuth completes and returns to app. |
| Apple login | [ ] | N/A | Native Apple sheet completes after Apple/Supabase provider config. |
| Logout | [ ] | [ ] | Session clears and API cache is cleared. |
| Cold restart after login | [ ] | [ ] | Session restores without manual login. |
| Bad network | [ ] | [ ] | Loading/error state is readable; app does not freeze. |
| Tab navigation | [ ] | [ ] | Library, Search, Paths, Profile animate in correct direction. |
| Active tab press | [ ] | [ ] | Pressing current tab does not re-animate the screen. |

## Android Play Install Smoke

Run this once the internal testing release appears in Google Play for the tester
account. This validates Play distribution rather than EAS artifact generation.

| Step | Expected |
| --- | --- |
| Open opt-in link on the Android device. | Page says the Google account is a tester for `com.luiskabal.tvlore`. |
| Tap Download test app. | Play Store opens the TVLore test listing. |
| Install from Play Store. | Install completes without sideloading or APK prompts. |
| Launch the Play-installed app. | App opens with the release UI and no development diagnostics. |
| Sign in with Google. | OAuth returns to `tvlore:///auth/callback` and the app stores the session. |
| Cold restart the app. | Session restores and Library loads against `https://tvlore-api.vercel.app`. |
| Open Profile legal links. | Privacy, Terms, Support, and Account deletion public pages open. |

If the opt-in page works but Play Store says the item was not found:

- Do not create a new app record.
- Do not change `com.luiskabal.tvlore`.
- Do not rebuild immediately.
- First confirm tester account, track activity, Publishing overview, and Play
  propagation/review state.

## Core Product Flows

| Flow | Steps | Expected |
| --- | --- | --- |
| Search | Open Search, search `dark`, switch All/Shows/Movies. | Results update, filters do not look stuck, rows open detail. |
| TVLore Picks | Open Search TVLore Picks entry. | List loads, tapping a title opens detail. |
| Recommendations | Open Search recommendations entry. | List loads, tapping a title opens detail. |
| Available to stream | Open Search Available entry. | Country-aware streamable rows load and open detail. |
| Popular in country | Open Popular entry. | Country-aware rows load and open detail. |
| Movie detail | Open a movie from Search. | Poster, rating comparison, Where to Watch, watched/watchlist controls render. |
| Show detail | Open a show from Search. | Poster, seasons, progress, watched/watchlist controls render. |
| Season detail | Open a season from a show. | Show context is visible; episodes load; season watched/unwatched works. |
| Episode detail | Open an episode from a season or Library. | Episode context, rating, watched state, and check-in entry render. |
| Watchlist | Save then remove a title. | Library watchlist count updates after returning. |
| Movie watched | Mark movie watched. | Detail updates optimistically and check-in screen opens. |
| Episode watched | Mark episode watched. | Detail updates optimistically and check-in screen opens. |
| Show watched | Mark show watched. | Progress and Library counts update after returning. |
| Season watched | Mark all season watched. | All visible episodes become watched and progress recalculates. |
| Rating | Rate a show/movie/episode, then clear/change rating. | Rating persists after leaving and returning. |
| Check-in | Save reaction, favorite character, and optional comment. | Reflection persists and detail shows the saved state. |
| Where to Watch | Open a show/movie with providers. | Provider icons render by saved country; attribution remains visible. |
| Watch Paths | Open curated path, open item, save path to watchlist. | Items resolve/open and watchlist count reflects saved titles. |
| TMDB Collection import | Create a Path from `https://www.themoviedb.org/collection/10-star-wars-collection`. | A personal path opens with ordered movie rows and posters. |
| Personal Watch Path | Import a small path from TMDB refs/text. | Path persists and can be reopened. |
| Cronologia | Open Library Cronologia and scroll. | Items append without duplicates or layout jump. |
| Account deletion | Test only on disposable account. | User-owned data and auth account are deleted when service role key is configured. |
| Legal links | Open Profile and tap Privacy, Terms, Support, and Deletion help. | Each link opens a public `tvlore-api.vercel.app` page. |

## Store Readiness Smoke

| Check | Expected |
| --- | --- |
| Local/Vercel env smoke | `corepack pnpm env:check` passes before release. |
| EAS envs | `EXPO_PUBLIC_TVLORE_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exist in EAS `preview` and `production`. |
| EAS env smoke | `corepack pnpm eas:env:check` passes for development, preview, and production. |
| Node debugger env | `corepack pnpm release:preflight` fails if `NODE_OPTIONS` enables debugger flags. |
| Supabase redirect smoke | `corepack pnpm auth:redirect:check` returns a Google OAuth redirect for `tvlore:///auth/callback`. |
| EAS preview build | `eas build --profile preview --platform ios` and Android equivalent can produce installable builds. |
| EAS production build | Production build starts only after preview QA passes. |
| App icon and splash | Match current TVLore branding. |
| Privacy link | Opens from Profile and can be used in store metadata. |
| Support link | Opens from Profile and can be used in store metadata. |
| Account deletion URL | Public page opens without login. |
| Store URL smoke | `corepack pnpm store:check` returns `200` for Privacy, Terms, Support, and Account deletion. |
| Delete account entry | Visible in Profile. |
| Delete account readiness | Profile disables deletion and explains it if `SUPABASE_SERVICE_ROLE_KEY` is not configured. |
| Reviewer notes | `docs/store-reviewer-notes.md` explains login path and core flows. |
| Store metadata | `docs/store-metadata.md` matches the actual app and public URLs. |
| Store screenshots | Match current UI, use a preview/production build, and do not show development-only states. |
| Secrets | No real secrets in git diff or committed files. |
| Secret smoke | `corepack pnpm release:preflight` reports `ok no obvious tracked secrets`. |

## Failure Handling

If a smoke check fails:

1. Add a short item to `docs/backlog.md` under `Active` or `Next`.
2. Fix only blockers or severe UX failures during release stabilization.
3. Re-run the smallest relevant check, then `corepack pnpm release:smoke`.
4. Commit the fix separately so rollback stays obvious.
