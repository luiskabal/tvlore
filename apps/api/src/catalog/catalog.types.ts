import type { ShowProgressResponseDto } from "../progress";

export type MediaType = "movie" | "show";

export type CatalogSearchInput = {
  mediaTypes: MediaType[];
  page: number;
  query: string;
};

export type CatalogExternalRefDto = {
  provider: "tmdb";
  providerId: string;
};

export type CatalogSearchResultDto = {
  externalRef: CatalogExternalRefDto;
  mediaType: MediaType;
  overview: string;
  posterPath: string | null;
  title: string;
  tvloreId: string | null;
  year: number | null;
};

export type CatalogSearchResponseDto = {
  page: number;
  query: string;
  results: CatalogSearchResultDto[];
};

export type CatalogResolveInput = {
  mediaType: MediaType;
  provider: "tmdb";
  providerId: string;
};

export type CatalogResolvedItem = {
  backdropPath: string | null;
  externalRef: CatalogExternalRefDto;
  firstAirDate: string | null;
  genreNames: string[];
  mediaType: MediaType;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  publicRating: number | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  seasons: CatalogResolvedSeasonSummary[];
  title: string;
};

export type CatalogResolveResponseDto = {
  id: string;
  mediaType: MediaType;
};

export type CatalogResolvedSeasonSummary = {
  airDate: string | null;
  episodeCount: number;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  title: string;
};

export type CatalogResolvedEpisode = {
  airDate: string | null;
  episodeNumber: number;
  overview: string;
  runtimeMinutes: number | null;
  seasonNumber: number;
  stillPath: string | null;
  title: string;
};

export type CatalogResolvedSeason = CatalogResolvedSeasonSummary & {
  episodes: CatalogResolvedEpisode[];
};

export type ShowSeasonSummaryDto = CatalogResolvedSeasonSummary & {
  id: string;
};

export type ShowEpisodeDto = CatalogResolvedEpisode & {
  id: string;
  lastWatchedAt: string | null;
  watchCount: number;
  watched: boolean;
};

export type ShowDetailResponseDto = {
  backdropPath: string | null;
  firstAirDate: string | null;
  id: string;
  inWatchlist: boolean;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  progress: ShowProgressResponseDto;
  publicRating: number | null;
  rating: number | null;
  seasons: ShowSeasonSummaryDto[];
  title: string;
};

export type MovieDetailResponseDto = {
  backdropPath: string | null;
  id: string;
  inWatchlist: boolean;
  lastWatchedAt: string | null;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  publicRating: number | null;
  rating: number | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  title: string;
  watchCount: number;
  watched: boolean;
};

export type ShowSeasonsResponseDto = {
  seasons: ShowSeasonSummaryDto[];
  showId: string;
};

export type ShowSeasonDetailResponseDto = ShowSeasonSummaryDto & {
  episodes: ShowEpisodeDto[];
  showId: string;
};

export type EpisodeDetailResponseDto = ShowEpisodeDto & {
  seasonId: string;
  seasonTitle: string;
  showId: string;
  showPosterPath: string | null;
  showTitle: string;
};

export type WatchProviderDto = {
  id: number;
  logoPath: string | null;
  name: string;
};

export type WatchProvidersResponseDto = {
  country: string;
  link: string | null;
  providers: {
    buy: WatchProviderDto[];
    free: WatchProviderDto[];
    rent: WatchProviderDto[];
    stream: WatchProviderDto[];
  };
};
