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
