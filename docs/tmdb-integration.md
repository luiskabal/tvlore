# TMDB Integration

TMDB is the initial catalog provider. It supplies catalog metadata, not TVLore product identity.

The backend is the only layer that should call TMDB using server-side credentials.

## Current MVP Implementation

- `TMDB_ACCESS_TOKEN` is read by the backend configuration provider and validated at startup.
- `GET /search` is protected by the Supabase bearer token used by other TVLore endpoints.
- The API calls `https://api.themoviedb.org/3/search/multi` with the TMDB API Read Access Token as a bearer token.
- TMDB `movie` and `tv` results are mapped to TVLore `movie` and `show` results.
- TMDB `person` results and malformed provider rows are ignored.
- Search returns provider-backed refs and includes `tvloreId` when the provider item has already been resolved.
- `POST /catalog/resolve` calls TMDB detail endpoints and persists `shows`, `movies`, and `external_identifiers`.

## Anti-Corruption Boundary

Do not let TMDB API responses leak throughout TVLore.

Create a provider adapter boundary:

```ts
interface MediaCatalogProvider {
  search(input: CatalogSearchInput): Promise<CatalogSearchResult[]>;
  getShow(input: ProviderShowInput): Promise<ExternalShow>;
  getMovie(input: ProviderMovieInput): Promise<ExternalMovie>;
  getSeason(input: ProviderSeasonInput): Promise<ExternalSeason>;
}
```

Illustrative contracts:

```ts
type CatalogProvider = "tmdb";

type CatalogSearchInput = {
  query: string;
  mediaTypes?: Array<"show" | "movie">;
  page?: number;
};

type ProviderShowInput = {
  provider: CatalogProvider;
  providerId: string;
};

type ProviderMovieInput = {
  provider: CatalogProvider;
  providerId: string;
};

type ProviderSeasonInput = {
  provider: CatalogProvider;
  providerId: string;
  seasonNumber: number;
};
```

This interface is illustrative. Implementation may refine names, but the boundary must remain.

## Mapping Rules

- TMDB models are mapped into `ExternalShow`, `ExternalMovie`, `ExternalSeason`, and `ExternalEpisode` adapter models.
- Adapter models are mapped into TVLore entities/contracts.
- Backend use cases decide whether to persist/update internal records.
- Mobile contracts use TVLore terminology.

## Catalog Persistence Strategies

### A - Always Proxy TMDB

The API always calls TMDB and never persists catalog records.

Pros:

- Fastest to start.
- No local catalog sync.

Cons:

- Watch history cannot safely reference durable internal IDs.
- Provider ID leaks into domain.
- User data becomes coupled to TMDB availability/shape.

### B - Persist on Interaction

Persist a TVLore catalog entity when a user resolves a title for detail or tracking.

Pros:

- Simple.
- Supports durable internal watch-history references.
- Avoids mirroring the full catalog.
- Fits MVP scale.

Cons:

- Requires upsert/refresh behavior.
- Search results may initially reference provider IDs until resolved.

### C - Local Catalog Mirror

Maintain a local mirror of provider catalog data.

Pros:

- Fast local reads.
- Strong control over catalog shape.
- Useful for large-scale search/recommendation later.

Cons:

- Operationally heavy.
- Requires sync jobs, storage, freshness rules, and provider policy review.
- Unnecessary for MVP.

## Recommendation

Use strategy B: persist on interaction.

Search may return provider-backed results with an external reference. When the user opens a detail page or marks content watched, the backend resolves the provider item and creates or updates TVLore internal records.

This lets watch history reference internal IDs without requiring a full TMDB mirror.

## Search-to-Detail Flow

1. Mobile calls `GET /search?query=dark`.
2. API calls TMDB through the catalog provider adapter.
3. API returns normalized search results with provider refs and optional existing TVLore IDs.
4. User taps a result.
5. Mobile calls `POST /catalog/resolve` with provider, media type, and provider ID.
6. API fetches provider details.
7. API upserts internal Show/Movie records and external identifier mappings.
8. API returns the TVLore ID.
9. Mobile navigates to `/shows/:id` or `/movies/:id`.

## Freshness

For MVP, refresh catalog metadata opportunistically when:

- A title is resolved from search.
- A detail page is opened and local data is stale.
- A season is opened and local episode data is incomplete or stale.

Do not create background sync jobs in the MVP.

## Provider Failures

TMDB errors should map to TVLore error codes. Do not leak raw TMDB error payloads.

Examples:

- `CATALOG_PROVIDER_UNAVAILABLE`
- `CATALOG_ITEM_NOT_FOUND`
- `CATALOG_RATE_LIMITED`
