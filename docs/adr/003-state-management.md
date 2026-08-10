# 003 - State Management

## Status

Accepted

## Context

The mobile app will handle local UI state, server data, authentication bootstrap, and persistent device preferences. Mixing these into one global store risks duplicating backend state and moving business behavior into the client.

## Decision

Use four state categories:

- React state for local UI state.
- TanStack Query for server state.
- Zustand for sparse global application state.
- SecureStore/AsyncStorage for persistent device state.

Do not store server resources such as shows, episodes, watch history, ratings, friends, or matches in Zustand as synchronized domain stores.

## Alternatives Considered

- Zustand for all app data: simple at first, but turns into a client database.
- Redux Toolkit for all data: powerful, but unnecessary when TanStack Query owns server state.
- Raw React state everywhere: creates duplicate fetching/caching behavior and inconsistent request lifecycles.

## Consequences

- Query invalidation becomes the main server-state update mechanism.
- Client state stays small and explicit.
- Business logic remains backend-owned.
- Components use hooks instead of raw HTTP calls.

## References

- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs/

