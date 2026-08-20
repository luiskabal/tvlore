import { toShowProgress, type ProgressEpisode } from "../progress";
import type {
  EpisodeDetailResponseDto,
  MovieDetailResponseDto,
  SeasonEpisodePageDto,
  SeasonEpisodePageInput,
  ShowDetailResponseDto,
  ShowEpisodeDto,
  ShowSeasonDetailResponseDto,
  ShowSeasonSummaryDto,
} from "./catalog.types";

export function toShowDetailResponse(show: {
  backdropPath: string | null;
  firstAirDate: Date | null;
  id: string;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  preferences: Array<{ rating: number }>;
  publicRating: number | null;
  reflections: Array<ReflectionRecord>;
  seasons: Array<Parameters<typeof toSeasonSummaryResponse>[0] & { episodes: ProgressEpisode[] }>;
  title: string;
  watchlistItems: Array<{ createdAt: Date }>;
}): ShowDetailResponseDto {
  return {
    backdropPath: show.backdropPath,
    firstAirDate: toDateString(show.firstAirDate),
    id: show.id,
    inWatchlist: show.watchlistItems.length > 0,
    originalTitle: show.originalTitle,
    overview: show.overview,
    posterPath: show.posterPath,
    progress: toShowProgress(show),
    publicRating: show.publicRating,
    rating: show.preferences[0]?.rating ?? null,
    reflection: toReflection(show.reflections),
    seasons: show.seasons.map(toSeasonSummaryResponse),
    title: show.title,
  };
}

export function toMovieDetailResponse(movie: {
  backdropPath: string | null;
  id: string;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  preferences: Array<{ rating: number }>;
  publicRating: number | null;
  reflections: Array<ReflectionRecord>;
  releaseDate: Date | null;
  runtimeMinutes: number | null;
  title: string;
  watchlistItems: Array<{ createdAt: Date }>;
  watches: Array<{ watchedAt: Date }>;
}): MovieDetailResponseDto {
  const watch = movie.watches[0];

  return {
    backdropPath: movie.backdropPath,
    id: movie.id,
    inWatchlist: movie.watchlistItems.length > 0,
    lastWatchedAt: watch ? watch.watchedAt.toISOString() : null,
    originalTitle: movie.originalTitle,
    overview: movie.overview,
    posterPath: movie.posterPath,
    publicRating: movie.publicRating,
    rating: movie.preferences[0]?.rating ?? null,
    reflection: toReflection(movie.reflections),
    releaseDate: toDateString(movie.releaseDate),
    runtimeMinutes: movie.runtimeMinutes,
    title: movie.title,
    watchCount: watch ? 1 : 0,
    watched: Boolean(watch),
  };
}

export function toSeasonSummaryResponse(season: {
  airDate: Date | null;
  episodeCount: number;
  id: string;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  title: string;
}): ShowSeasonSummaryDto {
  return {
    airDate: toDateString(season.airDate),
    episodeCount: season.episodeCount,
    id: season.id,
    overview: season.overview,
    posterPath: season.posterPath,
    seasonNumber: season.seasonNumber,
    title: season.title,
  };
}

export function toSeasonDetailResponse(season: {
  _count: {
    episodes: number;
  };
  airDate: Date | null;
  episodeCount: number;
  episodes: Array<{
    airDate: Date | null;
    episodeNumber: number;
    id: string;
    overview: string;
    runtimeMinutes: number | null;
    seasonNumber: number;
    stillPath: string | null;
    title: string;
    watches: Array<{ watchedAt: Date }>;
  }>;
  id: string;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  show: {
    title: string;
  };
  showId: string;
  title: string;
}, page: SeasonEpisodePageInput & { watchedCount: number } = { offset: 0, watchedCount: 0 }): ShowSeasonDetailResponseDto {
  return {
    ...toSeasonSummaryResponse(season),
    episodePage: toSeasonEpisodePage(season, page),
    episodes: season.episodes.map(toEpisodeResponse),
    showId: season.showId,
    showTitle: season.show.title,
  };
}

function toSeasonEpisodePage(
  season: { _count: { episodes: number }; episodeCount: number; episodes: unknown[] },
  page: SeasonEpisodePageInput & { watchedCount: number },
): SeasonEpisodePageDto {
  const limit = page.limit ?? null;
  const returnedCount = season.episodes.length;
  const storedCount = season._count.episodes;

  return {
    hasMore: limit !== null && page.offset + returnedCount < storedCount,
    limit,
    offset: page.offset,
    returnedCount,
    storedCount,
    totalCount: season.episodeCount,
    watchedCount: page.watchedCount,
  };
}

export function toEpisodeDetailResponse(episode: Parameters<typeof toEpisodeResponse>[0] & {
  preferences: Array<{ rating: number }>;
  reflections: Array<ReflectionRecord>;
  season: {
    id: string;
    title: string;
  };
  show: {
    id: string;
    posterPath: string | null;
    title: string;
  };
}): EpisodeDetailResponseDto {
  return {
    ...toEpisodeResponse(episode),
    rating: episode.preferences[0]?.rating ?? null,
    reflection: toReflection(episode.reflections),
    seasonId: episode.season.id,
    seasonTitle: episode.season.title,
    showId: episode.show.id,
    showPosterPath: episode.show.posterPath,
    showTitle: episode.show.title,
  };
}

function toEpisodeResponse(episode: {
  airDate: Date | null;
  episodeNumber: number;
  id: string;
  overview: string;
  runtimeMinutes: number | null;
  seasonNumber: number;
  stillPath: string | null;
  title: string;
  watches: Array<{ watchedAt: Date }>;
}): ShowEpisodeDto {
  const watch = episode.watches[0];

  return {
    airDate: toDateString(episode.airDate),
    episodeNumber: episode.episodeNumber,
    id: episode.id,
    lastWatchedAt: watch ? watch.watchedAt.toISOString() : null,
    overview: episode.overview,
    runtimeMinutes: episode.runtimeMinutes,
    seasonNumber: episode.seasonNumber,
    stillPath: episode.stillPath,
    title: episode.title,
    watchCount: watch ? 1 : 0,
    watched: Boolean(watch),
  };
}

type ReflectionRecord = {
  comment: string | null;
  favoriteCharacter: string | null;
  reaction: string;
  updatedAt: Date;
};

function toReflection(reflections: ReflectionRecord[] | undefined) {
  const reflection = reflections?.[0];

  return reflection
    ? {
        comment: reflection.comment,
        favoriteCharacter: reflection.favoriteCharacter,
        reaction: reflection.reaction as "loved" | "liked" | "mixed" | "not_for_me",
        updatedAt: reflection.updatedAt.toISOString(),
      }
    : null;
}

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}
