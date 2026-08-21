# 003 - State Management

## Status

Accepted, with TanStack Query and Zustand deferred in the current MVP.

## Context

The mobile app will handle local UI state, server data, authentication bootstrap, and persistent device preferences. Mixing these into one global store risks duplicating backend state and moving business behavior into the client.

## Decision

Use four state categories:

- React state for local UI state.
- Route hooks plus the TVLore API client cache for current server state.
- TanStack Query as the upgrade path if request lifecycle complexity grows.
- No global client store by default.
- Zustand only if sparse cross-screen application state becomes necessary.
- SecureStore/AsyncStorage for persistent device state.

Do not store server resources such as shows, episodes, watch history, ratings, friends, or matches in Zustand as synchronized domain stores.

## Implementation Update - 2026-08-21

The current MVP uses local React state, route hooks, SecureStore,
AsyncStorage, and the TVLore API client's short-lived in-memory read cache.
TanStack Query and Zustand are not installed yet.

The decision's intent still stands: keep backend data out of a global client
store, keep business behavior backend-owned, and add a state library only when
the app has enough real request lifecycle or cross-screen UI complexity to
justify it.

## Alternatives Considered

- Zustand for all app data: simple at first, but turns into a client database.
- Redux Toolkit for all data: powerful, but unnecessary for the current mobile
  state surface.
- Raw React state everywhere: creates duplicate fetching/caching behavior and inconsistent request lifecycles.

## Consequences

- The route hook/API-client boundary owns server-state refresh and
  invalidation.
- Client state stays small and explicit.
- Business logic remains backend-owned.
- Components use hooks instead of raw HTTP calls.

## References

- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs/
