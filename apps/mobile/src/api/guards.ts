import type {
  CatalogResolveResponse,
  CatalogSearchResponse,
  CatalogSearchResult,
  ContinueWatchingShow,
  EpisodeDetailResponse,
  EpisodeWatchResponse,
  LibraryChronologyResponse,
  LibraryRatedTitle,
  LibraryResponse,
  LibraryWatchlistItem,
  MediaType,
  MovieDetailResponse,
  MovieWatchResponse,
  PreferenceMediaType,
  PreferenceMutationResponse,
  RecommendationItem,
  RecommendationsResponse,
  RecentlyWatchedItem,
  ShowDetailResponse,
  ShowEpisode,
  ShowProgressResponse,
  ShowSeasonDetailResponse,
  ShowSeasonSummary,
  UserResponse,
  WatchPathDetailResponse,
  WatchPathItem,
  WatchPathsResponse,
  WatchPathSummary,
  WatchPathWatchlistResponse,
  WatchProvider,
  WatchProvidersResponse,
  WatchReflection,
  WatchReflectionResponse,
  WatchlistMutationResponse,
  WatchedEpisodeItem,
} from "./types";

export function isUserResponse(value: unknown): value is UserResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.availabilityCountry === "string" &&
    typeof candidate.id === "string" &&
    typeof candidate.displayName === "string" &&
    typeof candidate.createdAt === "string"
  );
}

export function isLibraryResponse(value: unknown): value is LibraryResponse {
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
    value.watchlist.every(isLibraryWatchlistItem) &&
    Array.isArray(value.watchedEpisodes) &&
    value.watchedEpisodes.every(isWatchedEpisodeItem)
  );
}

export function isLibraryChronologyResponse(value: unknown): value is LibraryChronologyResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.items) &&
    value.items.every(isRecentlyWatchedItem) &&
    isNullableString(value.nextCursor)
  );
}

export function isRecommendationsResponse(value: unknown): value is RecommendationsResponse {
  if (!isRecord(value) || !isRecord(value.basis)) {
    return false;
  }

  return (
    isNullableNumber(value.basis.averageMovieRating) &&
    isNullableNumber(value.basis.averageShowRating) &&
    typeof value.basis.availabilityCountry === "string" &&
    Array.isArray(value.basis.preferredGenreNames) &&
    value.basis.preferredGenreNames.every(isString) &&
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
    Array.isArray(value.genreNames) &&
    value.genreNames.every(isString) &&
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

export function isCatalogSearchResponse(value: unknown): value is CatalogSearchResponse {
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

export function isCatalogResolveResponse(value: unknown): value is CatalogResolveResponse {
  return isRecord(value) && typeof value.id === "string" && isMediaType(value.mediaType);
}

export function isWatchPathsResponse(value: unknown): value is WatchPathsResponse {
  return isRecord(value) && Array.isArray(value.paths) && value.paths.every(isWatchPathSummary);
}

export function isWatchPathDetailResponse(value: unknown): value is WatchPathDetailResponse {
  if (!isWatchPathSummary(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    Array.isArray(candidate.items) &&
    candidate.items.every(isWatchPathItem) &&
    typeof candidate.savedItemCount === "number"
  );
}

export function isWatchPathWatchlistResponse(value: unknown): value is WatchPathWatchlistResponse {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.itemCount === "number" &&
    typeof value.savedItemCount === "number" &&
    typeof value.title === "string"
  );
}

function isWatchPathSummary(value: unknown): value is WatchPathSummary {
  return (
    isRecord(value) &&
    typeof value.description === "string" &&
    typeof value.id === "string" &&
    typeof value.itemCount === "number" &&
    (value.source === "curated" || value.source === "user") &&
    typeof value.title === "string"
  );
}

function isWatchPathItem(value: unknown): value is WatchPathItem {
  return (
    isRecord(value) &&
    isRecord(value.externalRef) &&
    value.externalRef.provider === "tmdb" &&
    typeof value.externalRef.providerId === "string" &&
    typeof value.id === "string" &&
    typeof value.inWatchlist === "boolean" &&
    isMediaType(value.mediaType) &&
    isNullableString(value.note) &&
    isNullableString(value.posterPath) &&
    typeof value.position === "number" &&
    typeof value.title === "string" &&
    isNullableString(value.tvloreId) &&
    isNullableNumber(value.year)
  );
}

export function isWatchProvidersResponse(value: unknown): value is WatchProvidersResponse {
  return (
    isRecord(value) &&
    typeof value.country === "string" &&
    isNullableString(value.link) &&
    isRecord(value.providers) &&
    isWatchProviderList(value.providers.buy) &&
    isWatchProviderList(value.providers.free) &&
    isWatchProviderList(value.providers.rent) &&
    isWatchProviderList(value.providers.stream)
  );
}

function isWatchProviderList(value: unknown): value is WatchProvider[] {
  return Array.isArray(value) && value.every(isWatchProvider);
}

function isWatchProvider(value: unknown): value is WatchProvider {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    isNullableString(value.logoPath)
  );
}

export function isShowDetailResponse(value: unknown): value is Omit<ShowDetailResponse, "mediaType"> {
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
    isPublicRating(value.publicRating) &&
    isRating(value.rating) &&
    isNullableWatchReflection(value.reflection) &&
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

export function isShowSeasonDetailResponse(value: unknown): value is ShowSeasonDetailResponse {
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

export function isEpisodeDetailResponse(value: unknown): value is EpisodeDetailResponse {
  if (!isShowEpisode(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.seasonId === "string" &&
    typeof candidate.seasonTitle === "string" &&
    typeof candidate.showId === "string" &&
    isNullableString(candidate.showPosterPath) &&
    typeof candidate.showTitle === "string" &&
    isRating(candidate.rating) &&
    isNullableWatchReflection(candidate.reflection)
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

export function isMovieDetailResponse(value: unknown): value is Omit<MovieDetailResponse, "mediaType"> {
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
    isPublicRating(value.publicRating) &&
    isRating(value.rating) &&
    isNullableWatchReflection(value.reflection) &&
    typeof value.watched === "boolean" &&
    typeof value.watchCount === "number" &&
    isNullableString(value.lastWatchedAt)
  );
}

export function isEpisodeWatchResponse(value: unknown): value is EpisodeWatchResponse {
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

export function isShowProgressResponse(value: unknown): value is ShowProgressResponse {
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

export function isMovieWatchResponse(value: unknown): value is MovieWatchResponse {
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

export function isWatchlistMutationResponse(value: unknown): value is WatchlistMutationResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.inWatchlist === "boolean" &&
    isMediaType(value.mediaType)
  );
}

export function isPreferenceMutationResponse(value: unknown): value is PreferenceMutationResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    isPreferenceMediaType(value.mediaType) &&
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

  return isWatchedEpisodeItem(value);
}

function isWatchedEpisodeItem(value: unknown): value is WatchedEpisodeItem {
  return (
    isRecord(value) &&
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

export function isWatchReflectionResponse(value: unknown): value is WatchReflectionResponse {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isPreferenceMediaType(value.mediaType) &&
    isRating(value.rating) &&
    isWatchReflection(value)
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

function isNullableWatchReflection(value: unknown): value is WatchReflection | null {
  return value === null || isWatchReflection(value);
}

function isWatchReflection(value: unknown): value is WatchReflection {
  return (
    isRecord(value) &&
    isNullableString(value.comment) &&
    isNullableString(value.favoriteCharacter) &&
    isWatchReaction(value.reaction) &&
    typeof value.updatedAt === "string"
  );
}

function isWatchReaction(value: unknown) {
  return value === "loved" || value === "liked" || value === "mixed" || value === "not_for_me";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableNumber(value: unknown) {
  return value === null || typeof value === "number";
}

function isRating(value: unknown) {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5);
}

function isPublicRating(value: unknown) {
  return value === null || (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10);
}

function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "show";
}

function isPreferenceMediaType(value: unknown): value is PreferenceMediaType {
  return value === "episode" || isMediaType(value);
}
