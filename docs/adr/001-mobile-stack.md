# 001 - Mobile Stack

## Status

Accepted

## Context

TVLore is mobile-first. The first client needs native mobile UI, navigation, secure storage, app lifecycle handling, and a productive TypeScript workflow.

## Decision

Use:

- React Native.
- Expo.
- Expo Router.
- TypeScript.
- TanStack Query.
- Zustand.
- Zod.
- Expo SecureStore.
- AsyncStorage where appropriate.

React Native and Expo own the native mobile application experience. Expo Router owns navigation. TanStack Query owns server state. Zustand owns only genuine global application state. Zod owns transport/schema validation. SecureStore owns sensitive local credentials. AsyncStorage owns non-sensitive preferences.

## Alternatives Considered

- Native iOS/Android separately: stronger platform control, slower MVP and duplicated work.
- Flutter: productive cross-platform option, but less aligned with TypeScript contracts and React ecosystem.
- React Native without Expo: more native control, more setup and operational overhead.
- Redux Toolkit for global state: powerful, but unnecessary for the intended split between server state and small client state.

## Consequences

- The app can move quickly without giving up native mobile behavior.
- Navigation follows a file-based Expo Router structure.
- Server state has one owner: TanStack Query.
- Zustand must not become a database mirror.
- Sensitive credentials must not be stored in AsyncStorage.

## References

- https://docs.expo.dev/develop/app-navigation/
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/versions/latest/sdk/async-storage/
- https://zod.dev/

