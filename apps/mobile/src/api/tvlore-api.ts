import { apiBaseUrl } from "../config/env";

export type MediaType = "movie" | "show";

export type UserResponse = {
  createdAt: string;
  displayName: string;
  id: string;
};

export type LibraryResponse = {
  continueWatching: ContinueWatchingShow[];
  ratedTitles: LibraryRatedTitle[];
  recentlyWatched: RecentlyWatchedItem[];
  summary: {
    averageRating: number | null;
    ratedTitleCount: number;
    watchlistItemCount: number;
    watchedEpisodeCount: number;
    watchedMovieCount: number;
    watchedShowCount: number;
  };
  watchlist: LibraryWatchlistItem[];
};

export type RecommendationsResponse = {
  basis: {
    averageMovieRating: number | null;
    averageShowRating: number | null;
    ratedTitleCount: number;
  };
  items: RecommendationItem[];
};

export type RecommendationItem = {
  id: string;
  mediaType: MediaType;
  overview: string;
  posterPath: string | null;
  reason: "based_on_movie_ratings" | "based_on_show_ratings" | "from_catalog";
  title: string;
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

export type LibraryWatchlistItem =
  | {
      createdAt: string;
      id: string;
      mediaType: "show";
      posterPath: string | null;
      title: string;
    }
  | {
      createdAt: string;
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      title: string;
    };

export type LibraryRatedTitle =
  | {
      id: string;
      mediaType: "show";
      posterPath: string | null;
      rating: number;
      title: string;
      updatedAt: string;
    }
  | {
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      rating: number;
      title: string;
      updatedAt: string;
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
  inWatchlist: boolean;
  mediaType: "show";
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  progress: ShowProgressResponse;
  rating: number | null;
  seasons: ShowSeasonSummary[];
  title: string;
};

export type MovieDetailResponse = {
  backdropPath: string | null;
  id: string;
  inWatchlist: boolean;
  lastWatchedAt: string | null;
  mediaType: "movie";
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  rating: number | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  title: string;
  watchCount: number;
  watched: boolean;
};

export type CatalogDetailResponse = MovieDetailResponse | ShowDetailResponse;

export type ShowProgressResponse = {
  isComplete: boolean;
  nextEpisode: {
    episodeNumber: number;
    id: string;
    seasonNumber: number;
    title: string;
  } | null;
  percentComplete: number;
  seasons: Array<{
    percentComplete: number;
    seasonNumber: number;
    totalEpisodeCount: number;
    watchedEpisodeCount: number;
  }>;
  showId: string;
  status: "completed" | "not_started" | "watching";
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

export type WatchlistMutationResponse = {
  id: string;
  inWatchlist: boolean;
  mediaType: MediaType;
};

export type PreferenceMutationResponse = {
  id: string;
  mediaType: MediaType;
  rating: number | null;
  updatedAt: string | null;
};

export type HomeData = {
  library: LibraryResponse | null;
  recommendations: RecommendationsResponse | null;
  user: UserResponse | null;
};

export async function getHomeData(
  accessToken: string | null,
  options: { includeRecommendations?: boolean } = {},
): Promise<HomeData> {
  if (!accessToken) {
    return { library: null, recommendations: null, user: null };
  }

  const includeRecommendations = options.includeRecommendations ?? true;
  const authOptions = { headers: getAuthHeaders(accessToken) };
  const [user, library, recommendations] = await Promise.all([
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
    includeRecommendations
      ? fetchJson(
        "/recommendations",
        isRecommendationsResponse,
        "Unexpected recommendations response",
        authOptions,
      )
      : Promise.resolve(null),
  ]);

  return { library, recommendations, user };
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

export async function markShowWatched(
  accessToken: string | null,
  showId: string,
): Promise<ShowProgressResponse> {
  return fetchJson(
    `/shows/${showId}/watches`,
    isShowProgressResponse,
    "Unexpected show watch response",
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

export async function unmarkShowWatched(
  accessToken: string | null,
  showId: string,
): Promise<ShowProgressResponse> {
  return fetchJson(
    `/shows/${showId}/watches`,
    isShowProgressResponse,
    "Unexpected show unwatch response",
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

export async function addToWatchlist(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<WatchlistMutationResponse> {
  return fetchJson(
    `/${getMediaPath(mediaType, id)}/watchlist`,
    isWatchlistMutationResponse,
    "Unexpected watchlist response",
    {
      headers: getAuthHeaders(accessToken),
      method: "POST",
    },
  );
}

export async function removeFromWatchlist(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<WatchlistMutationResponse> {
  return fetchJson(
    `/${getMediaPath(mediaType, id)}/watchlist`,
    isWatchlistMutationResponse,
    "Unexpected watchlist response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}

export async function setPreferenceRating(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
  rating: number,
): Promise<PreferenceMutationResponse> {
  return fetchJson(
    `/${getMediaPath(mediaType, id)}/preference`,
    isPreferenceMutationResponse,
    "Unexpected preference response",
    {
      body: JSON.stringify({ rating }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "PUT",
    },
  );
}

export async function clearPreferenceRating(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<PreferenceMutationResponse> {
  return fetchJson(
    `/${getMediaPath(mediaType, id)}/preference`,
    isPreferenceMutationResponse,
    "Unexpected preference response",
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

function getMediaPath(mediaType: MediaType, id: string) {
  return mediaType === "show" ? `shows/${id}` : `movies/${id}`;
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
    isNullableNumber(value.summary.averageRating) &&
    typeof value.summary.ratedTitleCount === "number" &&
    typeof value.summary.watchlistItemCount === "number" &&
    typeof value.summary.watchedEpisodeCount === "number" &&
    typeof value.summary.watchedMovieCount === "number" &&
    typeof value.summary.watchedShowCount === "number" &&
    Array.isArray(value.continueWatching) &&
    value.continueWatching.every(isContinueWatchingShow) &&
    Array.isArray(value.ratedTitles) &&
    value.ratedTitles.every(isLibraryRatedTitle) &&
    Array.isArray(value.recentlyWatched) &&
    value.recentlyWatched.every(isRecentlyWatchedItem) &&
    Array.isArray(value.watchlist) &&
    value.watchlist.every(isLibraryWatchlistItem)
  );
}

function isRecommendationsResponse(value: unknown): value is RecommendationsResponse {
  if (!isRecord(value) || !isRecord(value.basis)) {
    return false;
  }

  return (
    isNullableNumber(value.basis.averageMovieRating) &&
    isNullableNumber(value.basis.averageShowRating) &&
    typeof value.basis.ratedTitleCount === "number" &&
    Array.isArray(value.items) &&
    value.items.every(isRecommendationItem)
  );
}

function isRecommendationItem(value: unknown): value is RecommendationItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isMediaType(value.mediaType) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.overview === "string" &&
    isNullableString(value.posterPath) &&
    isRecommendationReason(value.reason)
  );
}

function isRecommendationReason(value: unknown): value is RecommendationItem["reason"] {
  return value === "based_on_movie_ratings" || value === "based_on_show_ratings" || value === "from_catalog";
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
    typeof value.inWatchlist === "boolean" &&
    typeof value.title === "string" &&
    isNullableString(value.originalTitle) &&
    typeof value.overview === "string" &&
    isNullableString(value.posterPath) &&
    isNullableString(value.backdropPath) &&
    isNullableString(value.firstAirDate) &&
    isShowProgressResponse(value.progress) &&
    isRating(value.rating) &&
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
    isRating(value.rating) &&
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
    typeof value.isComplete === "boolean" &&
    isNextEpisode(value.nextEpisode) &&
    typeof value.percentComplete === "number" &&
    Array.isArray(value.seasons) &&
    value.seasons.every(isShowProgressSeason) &&
    isShowProgressStatus(value.status) &&
    typeof value.totalEpisodeCount === "number" &&
    typeof value.watchedEpisodeCount === "number"
  );
}

function isNextEpisode(value: unknown) {
  return value === null || (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.seasonNumber === "number" &&
    typeof value.episodeNumber === "number" &&
    typeof value.title === "string"
  );
}

function isShowProgressSeason(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.seasonNumber === "number" &&
    typeof value.percentComplete === "number" &&
    typeof value.totalEpisodeCount === "number" &&
    typeof value.watchedEpisodeCount === "number"
  );
}

function isShowProgressStatus(value: unknown) {
  return value === "completed" || value === "not_started" || value === "watching";
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

function isWatchlistMutationResponse(value: unknown): value is WatchlistMutationResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.inWatchlist === "boolean" &&
    isMediaType(value.mediaType)
  );
}

function isPreferenceMutationResponse(value: unknown): value is PreferenceMutationResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    isMediaType(value.mediaType) &&
    isRating(value.rating) &&
    isNullableString(value.updatedAt)
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

function isLibraryWatchlistItem(value: unknown): value is LibraryWatchlistItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.mediaType === "show" || value.mediaType === "movie") &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isNullableString(value.posterPath) &&
    typeof value.createdAt === "string"
  );
}

function isLibraryRatedTitle(value: unknown): value is LibraryRatedTitle {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isMediaType(value.mediaType) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isNullableString(value.posterPath) &&
    typeof value.rating === "number" &&
    Number.isInteger(value.rating) &&
    value.rating >= 1 &&
    value.rating <= 5 &&
    typeof value.updatedAt === "string"
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

function isRating(value: unknown) {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5);
}

function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "show";
}
