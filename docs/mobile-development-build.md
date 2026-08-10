# Mobile Development Build

TVLore uses a native URL scheme for Google OAuth:

```text
tvlore://auth/callback
```

Expo Go cannot reliably validate this flow because it does not own TVLore's
native scheme. Use Expo Go for UI and backend smoke tests. Use a development
build for Google OAuth.

## Current Native IDs

```text
iOS bundle identifier: com.luiskabal.tvlore
Android package: com.luiskabal.tvlore
URL scheme: tvlore
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

After installing the build on iPhone, run Metro for the development client:

```bash
corepack pnpm start:dev-client
```

Open the installed TVLore app, connect it to the Metro server, then test
`Continue with Google`.

## Expected Result

After Google login, Supabase redirects to:

```text
tvlore://auth/callback
```

iOS opens the installed TVLore development build, and the app stores the
Supabase session in SecureStore.
