# Mobile Development Build

TVLore uses a native URL scheme for Google OAuth:

```text
tvlore://auth/callback
```

Expo Go cannot reliably validate this flow because it does not own TVLore's
native scheme. Use Expo Go for UI and backend smoke tests. Use a development
build for Google OAuth and release-like Apple Sign-In testing.

## Current Native IDs

```text
iOS bundle identifier: com.luiskabal.tvlore
Android package: com.luiskabal.tvlore
URL scheme: tvlore
iOS Sign in with Apple: enabled through `ios.usesAppleSignIn`
```

## Supabase Redirect URL

Supabase Auth must allow:

```text
tvlore://auth/callback
```

## Build With EAS

From the mobile workspace:

```bash
cd apps/mobile
npx --yes eas-cli@latest login
npx --yes eas-cli@latest build:configure
npx --yes eas-cli@latest build --profile development --platform ios
```

EAS will ask for Apple credentials and device registration when needed.
The monorepo pins `pnpm@10.14.0` because the EAS Android builder supports it
with the current Node image and the lockfile is already pnpm lockfile v9.

## EAS Profiles

`apps/mobile/eas.json` defines three build profiles:

```text
development -> internal development-client build for Metro/device testing
preview     -> internal release-like build before beta/store submission
production  -> store build with remote build-number auto-increment
```

The production profile uses EAS remote app versioning for the developer-facing
build number. Keep `expo.version` in `app.json` as the human-facing release
version, and let EAS increment the store build number to avoid duplicate upload
failures.

## EAS Environment Variables

Remote EAS builds do not receive ignored local `.env` files automatically. Add
the same public mobile variables to the EAS project before creating preview or
production builds:

```bash
cd apps/mobile
npx --yes eas-cli@latest env:set development --name EXPO_PUBLIC_TVLORE_API_BASE_URL --value https://tvlore-api.vercel.app --visibility plaintext --non-interactive
npx --yes eas-cli@latest env:set development --name EXPO_PUBLIC_SUPABASE_URL --value https://qpekdijebjzigrgcumpv.supabase.co --visibility plaintext --non-interactive
npx --yes eas-cli@latest env:set development --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value YOUR_SUPABASE_PUBLISHABLE_KEY --visibility plaintext --non-interactive

npx --yes eas-cli@latest env:set preview --name EXPO_PUBLIC_TVLORE_API_BASE_URL --value https://tvlore-api.vercel.app --visibility plaintext --non-interactive
npx --yes eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_URL --value https://qpekdijebjzigrgcumpv.supabase.co --visibility plaintext --non-interactive
npx --yes eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value YOUR_SUPABASE_PUBLISHABLE_KEY --visibility plaintext --non-interactive

npx --yes eas-cli@latest env:set production --name EXPO_PUBLIC_TVLORE_API_BASE_URL --value https://tvlore-api.vercel.app --visibility plaintext --non-interactive
npx --yes eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_URL --value https://qpekdijebjzigrgcumpv.supabase.co --visibility plaintext --non-interactive
npx --yes eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value YOUR_SUPABASE_PUBLISHABLE_KEY --visibility plaintext --non-interactive
```

Verify them with:

```bash
npx --yes eas-cli@latest env:list development
npx --yes eas-cli@latest env:list preview
npx --yes eas-cli@latest env:list production
```

Before requesting a preview or production build, run the local release preflight
from the repo root:

```bash
corepack pnpm release:preflight
```

This checks the committed mobile app config, EAS profiles, local mobile `.env`,
and prints the external gates that still require dashboard verification.

These are client-side values, so they are embedded into the mobile bundle. Do
not add backend secrets, database URLs, TMDB tokens, or service-role keys to
mobile/EAS client variables.

## Build Commands

```bash
cd apps/mobile
npx --yes eas-cli@latest build --profile development --platform ios
npx --yes eas-cli@latest build --profile preview --platform android
npx --yes eas-cli@latest build --profile preview --platform ios
npx --yes eas-cli@latest build --profile production --platform android
npx --yes eas-cli@latest build --profile production --platform ios
```

Use `preview` for release-like device testing before store submission. Use
`production` only when the app is ready to upload to the stores.

Before testing Apple Sign-In in a release-like build:

- Enable Sign in with Apple for the `com.luiskabal.tvlore` App ID in Apple Developer.
- Enable Apple as an external provider in Supabase Auth.
- Add the native Apple client ID / bundle ID accepted by the Apple token to Supabase's Apple Client IDs.

After installing the build on iPhone, run Metro for the development client:

```bash
corepack pnpm start:dev-client
```

Open the installed TVLore app, connect it to the Metro server, then test
`Continue with Google` or `Continue with Apple`.

## Expected Result

After Google login, Supabase redirects to:

```text
tvlore://auth/callback
```

iOS opens the installed TVLore development build, and the app stores the
Supabase session in SecureStore.

After Apple login, iOS shows the native Apple sign-in sheet, Supabase exchanges
the Apple identity token for a Supabase session, and the app stores that session
in SecureStore. Apple only returns the user's name on the first authorization,
so TVLore saves that name into Supabase user metadata when it is available.

## Submit Commands

The submit profile is intentionally minimal until App Store Connect and Google
Play app records exist.

```bash
cd apps/mobile
npx --yes eas-cli@latest submit --profile production --platform android
npx --yes eas-cli@latest submit --profile production --platform ios
```

Android is configured to submit to the internal track first. iOS will prompt for
the App Store Connect app record until `ascAppId` is known.
