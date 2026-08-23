# Operations Runbook

This runbook is the day-to-day operating guide for TVLore. Use it when you need
to run the app, validate a deployment, generate a mobile build, smoke-test the
API, or decide whether a failure is a code problem or an external-platform
problem.

The deeper reference docs are:

- [Configuration](configuration.md)
- [Infrastructure Setup](infrastructure.md)
- [Release Smoke Checklist](release-smoke-checklist.md)
- [Google Play Android Release Prep](google-play-android-release.md)
- [Mobile Development Build](mobile-development-build.md)
- [Service Map](service-map.md)

## 1. Baseline Rules

- Run commands from the repository root unless the command says otherwise.
- Use `corepack pnpm ...`, not bare `pnpm`.
- Keep real secrets in ignored `.env` files, Vercel, EAS, Supabase, Google, or
  Play Console. Never commit them.
- Use `.env.example` files as the variable contract only.
- Prefer the smallest relevant verification first, then broaden if the change
  touched shared behavior or release output.
- Commit and push coherent increments so rollback remains obvious.

Repository root on the current workstation:

```powershell
cd D:\tvlore
```

## 2. Local Setup

Install workspace dependencies:

```powershell
corepack pnpm install
```

Create local env files from tracked examples:

```text
apps/api/.env
apps/mobile/.env
```

Validate local env shape and Vercel env names:

```powershell
corepack pnpm env:check
```

Validate EAS remote mobile env names when Expo login is available:

```powershell
corepack pnpm eas:env:check
```

## 3. Backend Operations

Production API:

```text
https://tvlore-api.vercel.app
```

Local build and start:

```powershell
corepack pnpm --filter @tvlore/api build
corepack pnpm --filter @tvlore/api start
```

Public API smoke against production:

```powershell
corepack pnpm api:check
```

Public API smoke against local API:

```powershell
$env:TVLORE_API_BASE_URL="http://localhost:3000"
corepack pnpm api:check
Remove-Item Env:\TVLORE_API_BASE_URL
```

Authenticated API smoke against production:

```powershell
$env:TVLORE_API_BASE_URL="https://tvlore-api.vercel.app"
$env:TVLORE_SUPABASE_ACCESS_TOKEN="<supabase_access_token>"
corepack pnpm api:check
```

Get a short-lived Supabase access token through the Postman OAuth callback. Do
not write that token into tracked files.

## 4. Database Operations

Runtime database:

```text
Supabase Postgres
Project ref: qpekdijebjzigrgcumpv
```

Apply production migrations:

```powershell
corepack pnpm db:migrate:deploy
```

Local migration/dev database commands:

```powershell
corepack pnpm db:start
corepack pnpm db:migrate
corepack pnpm db:logs
corepack pnpm db:stop
```

Use `MIGRATE_DATABASE_URL` for migrations and `DATABASE_URL` for API runtime.
The production runtime connection should use the Supabase transaction pooler;
the migration connection should use the direct database connection.

## 5. Mobile Operations

Run Expo for a development-client build:

```powershell
corepack pnpm --filter @tvlore/mobile start:dev-client
```

Run Expo standard start:

```powershell
corepack pnpm --filter @tvlore/mobile start
```

For release-like OAuth testing, use an installed development, preview, or Play
build. Expo Go is fine for simple UI checks but does not own TVLore's native
scheme.

Native callback:

```text
tvlore:///auth/callback
```

Mobile public envs:

```text
EXPO_PUBLIC_TVLORE_API_BASE_URL
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

These are safe to bundle in the app. Do not put database URLs, TMDB tokens, or
Supabase service-role keys in mobile envs.

## 6. Verification Matrix

| Situation | Command |
| --- | --- |
| Normal code change | `corepack pnpm verify` |
| Larger merge or release-impacting change | `corepack pnpm verify:full` |
| Public API/live backend smoke | `corepack pnpm api:check` |
| Authenticated API product smoke | Set `TVLORE_SUPABASE_ACCESS_TOKEN`, then `corepack pnpm api:check` |
| Env contract or Vercel env names changed | `corepack pnpm env:check` |
| EAS env changed | `corepack pnpm eas:env:check` |
| Supabase native redirect changed | `corepack pnpm auth:redirect:check` |
| Public legal/store URLs changed | `corepack pnpm store:check` |
| Android release config changed | `corepack pnpm release:android:preflight` |
| Android release candidate | `corepack pnpm release:android:smoke` |
| Full release gate | `corepack pnpm release:smoke` |

Docs-only changes normally need a secret scan and a careful diff, not the full
test suite.

## 7. Android Build And Play Internal Testing

Fast Android release-config gate:

```powershell
corepack pnpm release:android:preflight
```

Full Android smoke before asking EAS for a store artifact:

```powershell
corepack pnpm release:android:smoke
```

Create an Android preview APK:

```powershell
corepack pnpm release:android:build:preview
```

Create an Android production AAB for Play Console:

```powershell
corepack pnpm release:android:build:production
```

Submit the latest Android production AAB to the Google Play internal testing
track:

```powershell
corepack pnpm release:android:submit:production
```

Build and submit in one command:

```powershell
corepack pnpm release:android:build-and-submit:production
```

Automated submit requires a Google Play service account JSON configured in EAS
Submit. Keep that JSON outside git. Without it, EAS can still generate the AAB,
but Play Console upload remains manual.

Current Play package:

```text
com.luiskabal.tvlore
```

Current internal testing state:

```text
Track: Internal testing
Release: 7 (1.0.0)
Distribution: invited internal testers
Install: confirmed from Google Play tester flow
```

If the Play opt-in page works but the Play Store says the item was not found,
triage in this order:

1. Confirm the device Play Store is logged in with the same Google account that
   opted into testing.
2. Reopen the opt-in link on the Android device and tap the test-app download
   button.
3. Wait for Play propagation/review if the release was just rolled out.
4. Check Play Console -> Test and release -> Internal testing. The track should
   be active and the release should be available to testers.
5. Check Play Console -> Publishing overview for pending tasks.
6. Rebuild only if Play Console rejects the artifact, the package/version is
   wrong, or a downloaded build fails QA.

## 8. Vercel Deployment

Vercel is connected to GitHub `main`. A pushed backend change deploys the API
through the `tvlore-api` project.

Backend project settings:

```text
Preset: NestJS
Root Directory: apps/api
Install Command: corepack pnpm install --frozen-lockfile
Build Command: corepack pnpm build
Output Directory: public
```

Required server-side env names live in [Configuration](configuration.md). If a
new env is added:

1. Update `.env.example`.
2. Update docs.
3. Configure Vercel Production and Preview.
4. Run `corepack pnpm env:check`.
5. Redeploy.
6. Run `corepack pnpm api:check`.

## 9. Supabase Auth And Postman

Postman collection:

```text
tools/postman/tvlore.postman_collection.json
```

Postman environments:

```text
tools/postman/tvlore.local.postman_environment.json
tools/postman/tvlore.vercel.postman_environment.json
```

Supabase Google OAuth helper URL:

```text
https://qpekdijebjzigrgcumpv.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://oauth.pstmn.io/v1/callback
```

Manual token workflow:

1. Open the Supabase Google OAuth URL in a browser.
2. Complete Google sign-in.
3. Copy the `access_token` from the callback URL fragment.
4. Paste it into the Postman environment as `supabaseAccessToken`, or into
   PowerShell as `TVLORE_SUPABASE_ACCESS_TOKEN`.
5. Re-run protected API requests.

Supabase access tokens are short-lived. If protected endpoints return `401`
after previously working, refresh the token before debugging backend code.

## 10. Common Failures

| Symptom | First check |
| --- | --- |
| `401 UNAUTHORIZED` on protected API | Missing, expired, malformed, or wrongly pasted Supabase access token. |
| `GET /health/db` fails | Vercel database envs, Supabase connectivity, Prisma startup. |
| Search is slow or fails | TMDB token/env, provider rate limit, backend provider logs. |
| OAuth browser says invalid address | Supabase redirect allow list and `tvlore:///auth/callback`. |
| Mobile login returns but app stays logged out | Native scheme/build mismatch or SecureStore/session handling. |
| Play Store says item not found | Tester account, opt-in state, Play propagation/review, Publishing overview. |
| Account deletion says not configured | `SUPABASE_SERVICE_ROLE_KEY` missing in the target backend environment. |
| EAS build has wrong API target | EAS env for the selected profile is missing or stale. |
| Duplicate Play upload rejected | Version code/build number did not increment. |
| Play warns about deobfuscation | Non-blocking for internal testing; upload mapping before public hardening if minification is enabled. |

## 11. Rollback

Code rollback should stay non-destructive:

- Use the git commit history to identify the last known-good change.
- Prefer a revert commit over rewriting history.
- Vercel can promote or redeploy an older successful deployment.
- Google Play cannot mutate an already uploaded artifact; create a new release
  with a known-good build and higher version code.

Never use destructive git operations unless the user explicitly asks for that
operation.

## 12. Release Exit Criteria

Android internal testing is considered useful when:

- The Play build installs from the tester flow.
- Google login returns to the app.
- Search, detail navigation, watchlist, watched, rating, check-in, Library, and
  Profile flows pass on a real Android device.
- Public legal links open.
- Account deletion readiness is configured and verified on a disposable
  account.
- No secrets appear in git.

Public production is a separate gate. For a new personal Play account, plan for
the closed-testing requirement before production access.
