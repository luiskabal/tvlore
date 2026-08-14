import { apiBaseUrl } from "../config/env";

export type MediaType = "movie" | "show";

export type UserResponse = {
  createdAt: string;
  displayName: string;
  id: string;
};

export type LibraryResponse = {
  continueWatching: ContinueWatchingShow[];
  recentlyWatched: RecentlyWatchedItem[];
  summary: {
    watchedEpisodeCount: number;
    watchedMovieCount: number;
    watchedShowCount: number;
  };
};

export type ContinueWatchingShow = {
  id: string;
  mediaType: "show";
  nextEpisode: {
    episodeNumber: number;
    id: string;
    seasonNumber: number;
    title: string;
  };
  percentComplete: number;
  posterPath: string | null;
  title: string;
};

export type RecentlyWatchedItem =
  | {
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      title: string;
      watchedAt: string;
    }
  | {
      episodeNumber: number;
      id: string;
      mediaType: "episode";
      seasonNumber: number;
      showId: string;
      showTitle: string;
      title: string;
      watchedAt: string;
    };

export type CatalogExternalRef = {
  provider: "tmdb";
  providerId: string;
};

export type CatalogSearchResult = {
  externalRef: CatalogExternalRef;
  mediaType: MediaType;
  overview: string;
  posterPath: string | null;
  title: string;
  tvloreId: string | null;
  year: number | null;
};

export type CatalogSearchResponse = {
  page: number;
  query: string;
  results: CatalogSearchResult[];
};

export type CatalogResolveResponse = {
  id: string;
  mediaType: MediaType;
};

export type ShowSeasonSummary = {
  airDate: string | null;
  episodeCount: number;
  id: string;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  title: string;
};

export type ShowEpisode = {
  airDate: string | null;
  episodeNumber: number;
  id: string;
  lastWatchedAt: string | null;
  overview: string;
  runtimeMinutes: number | null;
  seasonNumber: number;
  stillPath: string | null;
  title: string;
  watchCount: number;
  watched: boolean;
};

export type ShowSeasonDetailResponse = ShowSeasonSummary & {
  episodes: ShowEpisode[];
  showId: string;
};

export type ShowDetailResponse = {
  backdropPath: string | null;
  firstAirDate: string | null;
  id: string;
  mediaType: "show";
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  seasons: ShowSeasonSummary[];
  title: string;
};

export type MovieDetailResponse = {
  backdropPath: string | null;
  id: string;
  lastWatchedAt: string | null;
  mediaType: "movie";
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  title: string;
  watchCount: number;
  watched: boolean;
};

export type CatalogDetailResponse = MovieDetailResponse | ShowDetailResponse;

export type ShowProgressResponse = {
  percentComplete: number;
  showId: string;
  totalEpisodeCount: number;
  watchedEpisodeCount: number;
};

export type EpisodeWatchResponse = {
  episodeId: string;
  lastWatchedAt: string | null;
  showProgress: ShowProgressResponse;
  watchCount: number;
  watched: boolean;
};

export type MovieWatchResponse = {
  lastWatchedAt: string | null;
  movieId: string;
  watchCount: number;
  watched: boolean;
};

export type HomeData = {
  library: LibraryResponse | null;
  user: UserResponse | null;
};

export async function getHomeData(accessToken: string | null): Promise<HomeData> {
  if (!accessToken) {
    return { library: null, user: null };
  }

  const authOptions = { headers: getAuthHeaders(accessToken) };
  const [user, library] = await Promise.all([
    fetchJson(
      "/users/me",
      isUserResponse,
      "Unexpected current user response",
      authOptions,
    ),
    fetchJson(
      "/library",
      isLibraryResponse,
      "Unexpected library response",
      authOptions,
    ),
  ]);

  return { library, user };
}

export async function searchCatalog(
  accessToken: string | null,
  query: string,
  mediaTypes: MediaType[],
): Promise<CatalogSearchResponse> {
  const params = new URLSearchParams({
    page: "1",
    query,
    types: mediaTypes.join(","),
  });

  return fetchJson(
    `/search?${params.toString()}`,
    isCatalogSearchResponse,
    "Unexpected search response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function resolveCatalogItem(
  accessToken: string | null,
  result: CatalogSearchResult,
): Promise<CatalogResolveResponse> {
  return fetchJson(
    "/catalog/resolve",
    isCatalogResolveResponse,
    "Unexpected resolve response",
    {
      body: JSON.stringify({
        mediaType: result.mediaType,
        provider: result.externalRef.provider,
        providerId: result.externalRef.providerId,
      }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function getCatalogDetail(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<CatalogDetailResponse> {
  if (mediaType === "show") {
    const show = await fetchJson(
      `/shows/${id}`,
      isShowDetailResponse,
      "Unexpected show detail response",
      { headers: getAuthHeaders(accessToken) },
    );

    return { ...show, mediaType };
  }

  const movie = await fetchJson(
    `/movies/${id}`,
    isMovieDetailResponse,
    "Unexpected movie detail response",
    { headers: getAuthHeaders(accessToken) },
  );

  return { ...movie, mediaType };
}

export async function getShowSeasonDetail(
  accessToken: string | null,
  showId: string,
  seasonNumber: number,
): Promise<ShowSeasonDetailResponse> {
  return fetchJson(
    `/shows/${showId}/seasons/${seasonNumber}`,
    isShowSeasonDetailResponse,
    "Unexpected season detail response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function markEpisodeWatched(
  accessToken: string | null,
  episodeId: string,
): Promise<EpisodeWatchResponse> {
  return fetchJson(
    `/episodes/${episodeId}/watches`,
    isEpisodeWatchResponse,
    "Unexpected episode watch response",
    {
      body: JSON.stringify({ watchedAt: new Date().toISOString() }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function unmarkEpisodeWatched(
  accessToken: string | null,
  episodeId: string,
): Promise<EpisodeWatchResponse> {
  return fetchJson(
    `/episodes/${episodeId}/watches`,
    isEpisodeWatchResponse,
    "Unexpected episode unwatch response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}

export async function markMovieWatched(
  accessToken: string | null,
  movieId: string,
): Promise<MovieWatchResponse> {
  return fetchJson(
    `/movies/${movieId}/watches`,
    isMovieWatchResponse,
    "Unexpected movie watch response",
    {
      body: JSON.stringify({ watchedAt: new Date().toISOString() }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function unmarkMovieWatched(
  accessToken: string | null,
  movieId: string,
): Promise<MovieWatchResponse> {
  return fetchJson(
    `/movies/${movieId}/watches`,
    isMovieWatchResponse,
    "Unexpected movie unwatch response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}

async function fetchJson<T>(
  path: string,
  guard: (value: unknown) => value is T,
  errorMessage: string,
  options?: RequestInit,
) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  const body: unknown = await response.json();

  if (!response.ok || !guard(body)) {
    throw new Error(errorMessage);
  }

  return body;
}

function getAuthHeaders(accessToken: string | null) {
  if (!accessToken) {
    throw new Error("Sign in required");
  }

  return { Authorization: `Bearer ${accessToken}` };
}

function isUserResponse(value: unknown): value is UserResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.displayName === "string" &&
    typeof candidate.createdAt === "string"
  );
}

function isLibraryResponse(value: unknown): value is LibraryResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.summary) &&
    typeof value.summary.watchedEpisodeCount === "number" &&
    typeof value.summary.watchedMovieCount === "number" &&
    typeof value.summary.watchedShowCount === "number" &&
    Array.isArray(value.continueWatching) &&
    value.continueWatching.every(isContinueWatchingShow) &&
    Array.isArray(value.recentlyWatched) &&
    value.recentlyWatched.every(isRecentlyWatchedItem)
  );
}

function isCatalogSearchResponse(value: unknown): value is CatalogSearchResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.query === "string" &&
    typeof value.page === "number" &&
    Array.isArray(value.results) &&
    value.results.every(isCatalogSearchResult)
  );
}

function isCatalogSearchResult(value: unknown): value is CatalogSearchResult {
  if (!isRecord(value) || !isRecord(value.externalRef)) {
    return false;
  }

  return (
    isMediaType(value.mediaType) &&
    typeof value.title === "string" &&
    isNullableNumber(value.year) &&
    typeof value.overview === "string" &&
    isNullableString(value.posterPath) &&
    isNullableString(value.tvloreId) &&
    value.externalRef.provider === "tmdb" &&
    typeof value.externalRef.providerId === "string"
  );
}

function isCatalogResolveResponse(value: unknown): value is CatalogResolveResponse {
  return isRecord(value) && typeof value.id === "string" && isMediaType(value.mediaType);
}

function isShowDetailResponse(value: unknown): value is Omit<ShowDetailResponse, "mediaType"> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isNullableString(value.originalTitle) &&
    typeof value.overview === "string" &&
    isNullableString(value.posterPath) &&
    isNullableString(value.backdropPath) &&
    isNullableString(value.firstAirDate) &&
    Array.isArray(value.seasons) &&
    value.seasons.every(isShowSeasonSummary)
  );
}

function isShowSeasonSummary(value: unknown): value is ShowSeasonSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.overview === "string" &&
    isNullableString(value.posterPath) &&
    isNullableString(value.airDate) &&
    typeof value.seasonNumber === "number" &&
    typeof value.episodeCount === "number"
  );
}

function isShowSeasonDetailResponse(value: unknown): value is ShowSeasonDetailResponse {
  if (!isRecord(value) || !isShowSeasonSummary(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.showId === "string" &&
    Array.isArray(candidate.episodes) &&
    candidate.episodes.every(isShowEpisode)
  );
}

function isShowEpisode(value: unknown): value is ShowEpisode {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.overview === "string" &&
    isNullableString(value.stillPath) &&
    isNullableString(value.airDate) &&
    typeof value.seasonNumber === "number" &&
    typeof value.episodeNumber === "number" &&
    isNullableNumber(value.runtimeMinutes) &&
    typeof value.watched === "boolean" &&
    typeof value.watchCount === "number" &&
    isNullableString(value.lastWatchedAt)
  );
}

function isMovieDetailResponse(value: unknown): value is Omit<MovieDetailResponse, "mediaType"> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isNullableString(value.originalTitle) &&
    typeof value.overview === "string" &&
    isNullableString(value.posterPath) &&
    isNullableString(value.backdropPath) &&
    isNullableString(value.releaseDate) &&
    isNullableNumber(value.runtimeMinutes) &&
    typeof value.watched === "boolean" &&
    typeof value.watchCount === "number" &&
    isNullableString(value.lastWatchedAt)
  );
}

function isEpisodeWatchResponse(value: unknown): value is EpisodeWatchResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.episodeId === "string" &&
    typeof value.watched === "boolean" &&
    typeof value.watchCount === "number" &&
    isNullableString(value.lastWatchedAt) &&
    isShowProgressResponse(value.showProgress)
  );
}

function isShowProgressResponse(value: unknown): value is ShowProgressResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.showId === "string" &&
    typeof value.percentComplete === "number" &&
    typeof value.totalEpisodeCount === "number" &&
    typeof value.watchedEpisodeCount === "number"
  );
}

function isMovieWatchResponse(value: unknown): value is MovieWatchResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.movieId === "string" &&
    typeof value.watched === "boolean" &&
    typeof value.watchCount === "number" &&
    isNullableString(value.lastWatchedAt)
  );
}

function isContinueWatchingShow(value: unknown): value is ContinueWatchingShow {
  if (!isRecord(value) || !isRecord(value.nextEpisode)) {
    return false;
  }

  return (
    value.mediaType === "show" &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isNullableString(value.posterPath) &&
    typeof value.percentComplete === "number" &&
    typeof value.nextEpisode.id === "string" &&
    typeof value.nextEpisode.title === "string" &&
    typeof value.nextEpisode.seasonNumber === "number" &&
    typeof value.nextEpisode.episodeNumber === "number"
  );
}

function isRecentlyWatchedItem(value: unknown): value is RecentlyWatchedItem {
  if (!isRecord(value)) {
    return false;
  }

  if (value.mediaType === "movie") {
    return (
      typeof value.id === "string" &&
      typeof value.title === "string" &&
      isNullableString(value.posterPath) &&
      typeof value.watchedAt === "string"
    );
  }

  return (
    value.mediaType === "episode" &&
    typeof value.id === "string" &&
    typeof value.showId === "string" &&
    typeof value.showTitle === "string" &&
    typeof value.title === "string" &&
    typeof value.seasonNumber === "number" &&
    typeof value.episodeNumber === "number" &&
    typeof value.watchedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNullableString(value: unknown) {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown) {
  return value === null || typeof value === "number";
}

function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "show";
}
