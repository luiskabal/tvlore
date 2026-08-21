# Diagrams

Mermaid diagrams are written for GitHub Markdown compatibility.

## 1. TVLore System Context

```mermaid
flowchart LR
  User[Mobile User]
  Mobile[TVLore Mobile App]
  API[TVLore API]
  DB[(PostgreSQL)]
  Google[Google Identity]
  TMDB[TMDB API]

  User --> Mobile
  Mobile --> API
  Mobile --> Google
  API --> Google
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

  DB[(PostgreSQL)]
  TMDB[TMDB API]

  Screens --> Hooks
  Hooks --> ApiClient
  ApiClient --> Controllers
  Controllers --> UseCases
  UseCases --> Domain
  UseCases --> Repos
  UseCases --> TmdbAdapter
  Repos --> DB
  TmdbAdapter --> TMDB
  ApiClient --> SecureStore
  Screens --> AsyncStorage
```

## 3. Google Authentication Flow

```mermaid
sequenceDiagram
  participant U as User
  participant M as Mobile App
  participant G as Google
  participant A as TVLore API
  participant D as PostgreSQL

  U->>M: Tap Google Sign-In
  M->>G: Start Google Sign-In
  G-->>M: Google credential
  M->>A: POST /auth/google
  A->>G: Verify credential
  G-->>A: Valid provider subject
  A->>D: Find or create UserIdentity and User
  D-->>A: TVLore User
  A->>D: Create RefreshSession
  A-->>M: Access token and refresh token
  M->>M: Store refresh token in SecureStore
```

## 4. Token Refresh Flow

```mermaid
sequenceDiagram
  participant M as Mobile App
  participant A as TVLore API
  participant D as PostgreSQL

  M->>A: POST /auth/refresh
  A->>D: Find active session by token hash
  D-->>A: RefreshSession
  A->>A: Validate expiration and revocation
  A->>D: Rotate token hash and update lastUsedAt
  A-->>M: New access token and optional refresh token
  M->>M: Update SecureStore
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
  M->>M: Invalidate show, season, library queries
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
  M->>M: Invalidate movie and library queries
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

## 10. MVP Database ER Model

```mermaid
erDiagram
  USER ||--o{ USER_IDENTITY : has
  USER ||--o{ REFRESH_SESSION : has
  USER ||--o{ EPISODE_WATCH : records
  USER ||--o{ MOVIE_WATCH : records
  SHOW ||--o{ SEASON : has
  SHOW ||--o{ EPISODE : has
  SEASON ||--o{ EPISODE : contains
  EPISODE ||--o{ EPISODE_WATCH : watched_as
  MOVIE ||--o{ MOVIE_WATCH : watched_as
  SHOW ||--o{ EXTERNAL_IDENTIFIER : maps
  SEASON ||--o{ EXTERNAL_IDENTIFIER : maps
  EPISODE ||--o{ EXTERNAL_IDENTIFIER : maps
  MOVIE ||--o{ EXTERNAL_IDENTIFIER : maps

  USER {
    uuid id PK
    string displayName
  }
  USER_IDENTITY {
    uuid id PK
    uuid userId FK
    string provider
    string providerSubject
  }
  REFRESH_SESSION {
    uuid id PK
    uuid userId FK
    string tokenHash
  }
  SHOW {
    uuid id PK
    string title
  }
  SEASON {
    uuid id PK
    uuid showId FK
    int seasonNumber
  }
  EPISODE {
    uuid id PK
    uuid showId FK
    uuid seasonId FK
    int episodeNumber
  }
  MOVIE {
    uuid id PK
    string title
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
  EXTERNAL_IDENTIFIER {
    uuid id PK
    string entityType
    uuid entityId
    string provider
    string providerId
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
    DB[(PostgreSQL)]
  end

  subgraph Providers[External Providers]
    Google[Google Identity]
    TMDB[TMDB API]
  end

  Mobile --> HTTPS
  HTTPS --> API
  API --> Auth
  API --> Privacy
  API --> Domain
  Auth --> DB
  Privacy --> DB
  Domain --> DB
  Auth --> Google
  Domain --> TMDB
  Mobile --> SecureStore
  Mobile --> AsyncStorage
```
