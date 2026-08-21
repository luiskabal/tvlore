# Diagrams

Mermaid diagrams are written for GitHub Markdown compatibility.

## 1. TVLore System Context

```mermaid
flowchart LR
  User[Mobile User]
  Mobile[TVLore Mobile App]
  API[TVLore API]
  Auth[Supabase Auth]
  DB[(Supabase Postgres)]
  Google[Google OAuth]
  TMDB[TMDB API]

  User --> Mobile
  Mobile --> API
  Mobile --> Auth
  Auth --> Google
  API --> Auth
  API --> DB
  API --> TMDB
```

## 2. Mobile/API/TMDB/PostgreSQL Architecture

```mermaid
flowchart TB
  subgraph MobileApp[Mobile App]
    Screens[Screens]
    Hooks[Route and Mutation Hooks]
    ApiClient[TVLore API Client]
    SupabaseClient[Supabase Client]
    SecureStore[SecureStore]
    AsyncStorage[AsyncStorage]
  end

  subgraph Backend[TVLore API]
    Controllers[Controllers]
    UseCases[Application Use Cases]
    Domain[Domain Services]
    Repos[Repositories]
    TmdbAdapter[TMDB Adapter]
  end

  Auth[Supabase Auth]
  DB[(Supabase Postgres)]
  TMDB[TMDB API]

  Screens --> Hooks
  Hooks --> ApiClient
  Hooks --> SupabaseClient
  SupabaseClient --> Auth
  ApiClient --> Controllers
  Controllers --> Auth
  Controllers --> UseCases
  UseCases --> Domain
  UseCases --> Repos
  UseCases --> TmdbAdapter
  Repos --> DB
  TmdbAdapter --> TMDB
  SupabaseClient --> SecureStore
  Screens --> AsyncStorage
```

## 3. Supabase Google Authentication Flow

```mermaid
sequenceDiagram
  participant U as User
  participant M as Mobile App
  participant G as Google
  participant S as Supabase Auth
  participant A as TVLore API
  participant D as Supabase Postgres

  U->>M: Tap Google Sign-In
  M->>S: signInWithOAuth(provider: google)
  S->>G: Redirect to Google consent/login
  G-->>S: Provider callback
  S-->>M: tvlore:///auth/callback with session tokens
  M->>M: Store Supabase session in SecureStore
  M->>A: GET /users/me with Supabase bearer token
  A->>S: Validate token via /auth/v1/user
  S-->>A: Supabase user
  A->>D: Find or create UserIdentity and User
  D-->>A: TVLore user
  A-->>M: TVLore user profile
```

## 4. Supabase Session Refresh and API Validation Flow

```mermaid
sequenceDiagram
  participant M as Mobile App
  participant S as Supabase Auth
  participant A as TVLore API
  participant D as Supabase Postgres

  M->>S: Supabase client refreshes session when needed
  S-->>M: Fresh Supabase access token
  M->>A: Protected request with Authorization: Bearer token
  A->>S: Validate token via /auth/v1/user
  S-->>A: Supabase user
  A->>D: Resolve TVLore user identity
  D-->>A: TVLore user and permissions context
  A-->>M: Protected resource response
```

## 5. Show Search Flow

```mermaid
sequenceDiagram
  participant M as Mobile App
  participant A as TVLore API
  participant C as Catalog Use Case
  participant T as TMDB Adapter
  participant D as PostgreSQL

  M->>A: GET /search?query=dark
  A->>C: Search catalog
  C->>T: search(query)
  T-->>C: External results
  C->>D: Check existing external identifiers
  D-->>C: Existing TVLore IDs if any
  C-->>A: Normalized search results
  A-->>M: Results with external refs
```

## 6. Show Detail Flow

```mermaid
sequenceDiagram
  participant M as Mobile App
  participant A as TVLore API
  participant C as Catalog Use Case
  participant T as TMDB Adapter
  participant D as PostgreSQL

  M->>A: POST /catalog/resolve
  A->>C: Resolve provider show
  C->>D: Find ExternalIdentifier
  alt Missing or stale
    C->>T: getShow(providerId)
    T-->>C: ExternalShow
    C->>D: Upsert Show and ExternalIdentifier
  end
  C-->>A: TVLore show ID
  A-->>M: showId
  M->>A: GET /shows/:showId
  A->>D: Load show details
  A-->>M: Show response
```

## 7. Mark Episode Watched Flow

```mermaid
sequenceDiagram
  participant M as Mobile App
  participant A as TVLore API
  participant T as Tracking Use Case
  participant D as PostgreSQL

  M->>A: POST /episodes/:episodeId/watches
  A->>T: Mark episode watched for authenticated user
  T->>D: Verify episode exists
  T->>D: Create or ensure EpisodeWatch
  T->>D: Query show progress
  D-->>T: Watch state and progress
  T-->>A: Result
  A-->>M: Watched state and progress
  M->>M: Invalidate local show, season, and library cache
```

## 8. Mark Movie Watched Flow

```mermaid
sequenceDiagram
  participant M as Mobile App
  participant A as TVLore API
  participant T as Tracking Use Case
  participant D as PostgreSQL

  M->>A: POST /movies/:movieId/watches
  A->>T: Mark movie watched for authenticated user
  T->>D: Verify movie exists
  T->>D: Create or ensure MovieWatch
  D-->>T: Watch state
  T-->>A: Result
  A-->>M: Watched state
  M->>M: Invalidate local movie and library cache
```

## 9. State Ownership

```mermaid
flowchart TB
  ReactState[React State: local UI]
  ServerHooks[Route hooks + API client cache: server state]
  AppState[Optional global UI state]
  Secure[SecureStore: sensitive credentials]
  Async[AsyncStorage: non-sensitive preferences]
  Backend[Backend: business state and rules]

  ReactState --> UI[Presentation]
  ServerHooks --> Backend
  AppState --> UI
  Secure --> AuthBootstrap[Auth Bootstrap]
  Async --> Preferences[Preferences]
  Backend --> Domain[Tracking, Progress, Privacy, Matching]
```

## 10. Core Database ER Model

`REFRESH_SESSION` remains in the schema from the earlier custom-token strategy,
but current MVP sessions are Supabase-managed. Do not build new authentication
behavior around it without an explicit auth architecture change.

```mermaid
erDiagram
  USER ||--o{ USER_IDENTITY : has
  USER ||--o{ REFRESH_SESSION : has
  USER ||--o{ EPISODE_WATCH : records
  USER ||--o{ MOVIE_WATCH : records
  USER ||--o{ SHOW_WATCHLIST_ITEM : saves
  USER ||--o{ MOVIE_WATCHLIST_ITEM : saves
  USER ||--o{ SHOW_PREFERENCE : rates
  USER ||--o{ MOVIE_PREFERENCE : rates
  USER ||--o{ EPISODE_PREFERENCE : rates
  USER ||--o{ SHOW_REFLECTION : reflects
  USER ||--o{ MOVIE_REFLECTION : reflects
  USER ||--o{ EPISODE_REFLECTION : reflects
  USER ||--o{ USER_WATCH_PATH : owns

  SHOW ||--o{ SEASON : has
  SHOW ||--o{ EPISODE : has
  SHOW ||--o{ SHOW_WATCHLIST_ITEM : saved_as
  SHOW ||--o{ SHOW_PREFERENCE : rated_as
  SHOW ||--o{ SHOW_REFLECTION : reflected_as
  MOVIE ||--o{ MOVIE_WATCH : watched_as
  MOVIE ||--o{ MOVIE_WATCHLIST_ITEM : saved_as
  MOVIE ||--o{ MOVIE_PREFERENCE : rated_as
  MOVIE ||--o{ MOVIE_REFLECTION : reflected_as

  SEASON ||--o{ EPISODE : contains
  EPISODE ||--o{ EPISODE_WATCH : watched_as
  EPISODE ||--o{ EPISODE_PREFERENCE : rated_as
  EPISODE ||--o{ EPISODE_REFLECTION : reflected_as
  USER_WATCH_PATH ||--o{ USER_WATCH_PATH_ITEM : contains
  EXTERNAL_IDENTIFIER }o--|| SHOW : maps_show
  EXTERNAL_IDENTIFIER }o--|| SEASON : maps_season
  EXTERNAL_IDENTIFIER }o--|| EPISODE : maps_episode
  EXTERNAL_IDENTIFIER }o--|| MOVIE : maps_movie

  USER {
    uuid id PK
    string displayName
    string availabilityCountry
  }
  USER_IDENTITY {
    uuid id PK
    uuid userId FK
    string provider
    string providerSubject
    string email
  }
  REFRESH_SESSION {
    uuid id PK
    uuid userId FK
    string tokenHash
  }
  SHOW {
    uuid id PK
    string title
    stringArray genreNames
    float publicRating
  }
  MOVIE {
    uuid id PK
    string title
    stringArray genreNames
    float publicRating
  }
  SEASON {
    uuid id PK
    uuid showId FK
    int seasonNumber
    int episodeCount
  }
  EPISODE {
    uuid id PK
    uuid showId FK
    uuid seasonId FK
    int seasonNumber
    int episodeNumber
  }
  EPISODE_WATCH {
    uuid id PK
    uuid userId FK
    uuid episodeId FK
    datetime watchedAt
  }
  MOVIE_WATCH {
    uuid id PK
    uuid userId FK
    uuid movieId FK
    datetime watchedAt
  }
  SHOW_WATCHLIST_ITEM {
    uuid userId FK
    uuid showId FK
  }
  MOVIE_WATCHLIST_ITEM {
    uuid userId FK
    uuid movieId FK
  }
  SHOW_PREFERENCE {
    uuid userId FK
    uuid showId FK
    int rating
  }
  MOVIE_PREFERENCE {
    uuid userId FK
    uuid movieId FK
    int rating
  }
  EPISODE_PREFERENCE {
    uuid userId FK
    uuid episodeId FK
    int rating
  }
  SHOW_REFLECTION {
    uuid userId FK
    uuid showId FK
    string reaction
    string favoriteCharacter
  }
  MOVIE_REFLECTION {
    uuid userId FK
    uuid movieId FK
    string reaction
    string favoriteCharacter
  }
  EPISODE_REFLECTION {
    uuid userId FK
    uuid episodeId FK
    string reaction
    string favoriteCharacter
  }
  EXTERNAL_IDENTIFIER {
    uuid id PK
    string entityType
    uuid entityId
    string provider
    string providerId
  }
  USER_WATCH_PATH {
    uuid id PK
    uuid userId FK
    string title
  }
  USER_WATCH_PATH_ITEM {
    uuid id PK
    uuid pathId FK
    string mediaType
    string provider
    string providerId
    int position
  }
```

## 11. Future QR Match Flow

```mermaid
sequenceDiagram
  participant AUser as User A
  participant AMobile as User A Mobile
  participant API as TVLore API
  participant DB as PostgreSQL
  participant BMobile as User B Mobile
  participant BUser as User B

  AUser->>AMobile: Generate match link
  AMobile->>API: POST /match-links
  API->>DB: Store opaque token hash and expiry
  API-->>AMobile: Deep link / QR URL
  AUser->>BUser: Share QR or link
  BUser->>BMobile: Open link
  BMobile->>API: POST /matches with opaque token
  API->>DB: Resolve token and identify owner
  API->>DB: Load privacy settings
  API->>DB: Compare authorized histories
  API-->>BMobile: Derived match result
```

## 12. Future Social Domain Extension

```mermaid
erDiagram
  USER ||--o{ PROFILE_PRIVACY_SETTINGS : configures
  USER ||--o{ MATCH_SHARE_TOKEN : creates
  USER ||--o{ MATCH_SESSION : participant_a
  USER ||--o{ MATCH_SESSION : participant_b
  USER ||--o{ FRIENDSHIP : requester
  USER ||--o{ FRIENDSHIP : addressee
  MATCH_SHARE_TOKEN ||--o{ MATCH_SESSION : initiates

  PROFILE_PRIVACY_SETTINGS {
    uuid id PK
    uuid userId FK
    boolean allowComparisons
    boolean shareWatchedTitles
    boolean shareRatings
    boolean shareWatchDates
  }
  MATCH_SHARE_TOKEN {
    uuid id PK
    uuid ownerUserId FK
    string tokenHash
    datetime expiresAt
    datetime revokedAt
  }
  MATCH_SESSION {
    uuid id PK
    uuid ownerUserId FK
    uuid viewerUserId FK
    uuid matchShareTokenId FK
    datetime createdAt
  }
  FRIENDSHIP {
    uuid id PK
    uuid requesterUserId FK
    uuid addresseeUserId FK
    string status
  }
```

## 13. Trust/Security Boundaries

```mermaid
flowchart TB
  subgraph Device[User Device - Untrusted]
    Mobile[Mobile App]
    SecureStore[SecureStore]
    AsyncStorage[AsyncStorage]
  end

  subgraph Internet[Network Boundary]
    HTTPS[HTTPS]
  end

  subgraph Backend[Trusted Backend Boundary]
    API[TVLore API]
    Auth[Auth and Authorization]
    Privacy[Privacy Rules]
    Domain[Domain Rules]
  end

  subgraph Data[Data Boundary]
    DB[(Supabase Postgres)]
  end

  subgraph Providers[External Providers]
    SupabaseAuth[Supabase Auth]
    Google[Google OAuth]
    TMDB[TMDB API]
  end

  Mobile --> HTTPS
  Mobile --> SupabaseAuth
  SupabaseAuth --> Google
  HTTPS --> API
  API --> Auth
  API --> Privacy
  API --> Domain
  Auth --> DB
  Privacy --> DB
  Domain --> DB
  Auth --> SupabaseAuth
  Domain --> TMDB
  Mobile --> SecureStore
  Mobile --> AsyncStorage
```
