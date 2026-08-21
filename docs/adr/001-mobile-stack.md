# 001 - Mobile Stack

## Status

Accepted, with server-state library deferred in the current MVP.

## Context

TVLore is mobile-first. The first client needs native mobile UI, navigation, secure storage, app lifecycle handling, and a productive TypeScript workflow.

## Decision

Use:

- React Native.
- Expo.
- Expo Router.
- TypeScript.
- Local route hooks and the TVLore API client cache for the current server-state
  surface.
- TanStack Query as the approved upgrade if request lifecycle complexity grows.
- No global client store by default.
- Zustand as the approved small-store option if real cross-screen UI state
  appears.
- Zod.
- Expo SecureStore.
- AsyncStorage where appropriate.

React Native and Expo own the native mobile application experience. Expo Router
owns navigation. Route hooks and the TVLore API client own the current
server-state boundary. Zod owns transport/schema validation. SecureStore owns
sensitive local credentials. AsyncStorage owns non-sensitive preferences.

## Implementation Update - 2026-08-21

The current MVP did not install TanStack Query or Zustand. It uses local route
hooks plus the TVLore API client's short-lived in-memory read cache.

The architectural rule remains the same: server resources must not become
global client state. TanStack Query and Zustand remain approved future tools if
request lifecycle or cross-screen client-only state grows beyond the current
simple boundary.

## Alternatives Considered

- Native iOS/Android separately: stronger platform control, slower MVP and duplicated work.
- Flutter: productive cross-platform option, but less aligned with TypeScript contracts and React ecosystem.
- React Native without Expo: more native control, more setup and operational overhead.
- Redux Toolkit for global state: powerful, but unnecessary for the intended split between server state and small client state.

## Consequences

- The app can move quickly without giving up native mobile behavior.
- Navigation follows a file-based Expo Router structure.
- Server state has one owner in the MVP: route hooks plus the TVLore API client.
- If TanStack Query is added later, it becomes the only server-state owner.
- Any future global store must not become a database mirror.
- Sensitive credentials must not be stored in AsyncStorage.

## References

- https://docs.expo.dev/develop/app-navigation/
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/versions/latest/sdk/async-storage/
- https://zod.dev/
