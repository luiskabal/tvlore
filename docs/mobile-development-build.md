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
npx eas login
npx eas build:configure
npx eas build --profile development --platform ios
```

EAS will ask for Apple credentials and device registration when needed.

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
npx eas env:set development --name EXPO_PUBLIC_TVLORE_API_BASE_URL --value https://tvlore-api.vercel.app --visibility plaintext
npx eas env:set development --name EXPO_PUBLIC_SUPABASE_URL --value https://qpekdijebjzigrgcumpv.supabase.co --visibility plaintext
npx eas env:set development --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value YOUR_SUPABASE_PUBLISHABLE_KEY --visibility sensitive

npx eas env:set preview --name EXPO_PUBLIC_TVLORE_API_BASE_URL --value https://tvlore-api.vercel.app --visibility plaintext
npx eas env:set preview --name EXPO_PUBLIC_SUPABASE_URL --value https://qpekdijebjzigrgcumpv.supabase.co --visibility plaintext
npx eas env:set preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value YOUR_SUPABASE_PUBLISHABLE_KEY --visibility sensitive

npx eas env:set production --name EXPO_PUBLIC_TVLORE_API_BASE_URL --value https://tvlore-api.vercel.app --visibility plaintext
npx eas env:set production --name EXPO_PUBLIC_SUPABASE_URL --value https://qpekdijebjzigrgcumpv.supabase.co --visibility plaintext
npx eas env:set production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value YOUR_SUPABASE_PUBLISHABLE_KEY --visibility sensitive
```

Verify them with:

```bash
npx eas env:list development
npx eas env:list preview
npx eas env:list production
```

These are client-side values, so they are embedded into the mobile bundle. Do
not add backend secrets, database URLs, TMDB tokens, or service-role keys to
mobile/EAS client variables.

## Build Commands

```bash
cd apps/mobile
npx eas build --profile development --platform ios
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
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
npx eas submit --profile production --platform android
npx eas submit --profile production --platform ios
```

Android is configured to submit to the internal track first. iOS will prompt for
the App Store Connect app record until `ascAppId` is known.
