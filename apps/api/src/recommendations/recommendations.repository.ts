import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import type { RecommendationCandidateDto, RecommendationCandidatesResponseDto } from "./recommendations.types";

type MediaType = "movie" | "show";

@Injectable()
export class RecommendationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getRecommendations(userId: string, availabilityCountry: string): Promise<RecommendationCandidatesResponseDto> {
    const client = this.prismaService.getClient();
    const [
      showPreferences,
      moviePreferences,
      showWatchlistItems,
      movieWatchlistItems,
      episodeWatches,
      movieWatches,
    ] = await Promise.all([
      client.showPreference.findMany({
        select: { rating: true, show: { select: { genreNames: true } }, showId: true },
        where: { userId },
      }),
      client.moviePreference.findMany({
        select: { movie: { select: { genreNames: true } }, movieId: true, rating: true },
        where: { userId },
      }),
      client.showWatchlistItem.findMany({
        select: { showId: true },
        where: { userId },
      }),
      client.movieWatchlistItem.findMany({
        select: { movieId: true },
        where: { userId },
      }),
      client.episodeWatch.findMany({
        select: { episode: { select: { showId: true } } },
        where: { userId },
      }),
      client.movieWatch.findMany({
        select: { movieId: true },
        where: { userId },
      }),
    ]);
    const averageShowRating = getAverageRating(showPreferences);
    const averageMovieRating = getAverageRating(moviePreferences);
    const mediaOrder = getMediaOrder(averageShowRating, averageMovieRating);
    const preferredGenreNames = getPreferredGenreNames(showPreferences, moviePreferences);

    if (mediaOrder.length === 0) {
      return {
        basis: {
          averageMovieRating,
          averageShowRating,
          availabilityCountry,
          preferredGenreNames,
          ratedTitleCount: 0,
        },
        items: [],
      };
    }

    const excludedShowIds = unique([
      ...showPreferences.map((item) => item.showId),
      ...showWatchlistItems.map((item) => item.showId),
      ...episodeWatches.map((item) => item.episode.showId),
    ]);
    const excludedMovieIds = unique([
      ...moviePreferences.map((item) => item.movieId),
      ...movieWatchlistItems.map((item) => item.movieId),
      ...movieWatches.map((item) => item.movieId),
    ]);
    const [shows, movies] = await Promise.all([
      client.show.findMany({
        orderBy: { updatedAt: "desc" },
        select: { genreNames: true, id: true, overview: true, posterPath: true, title: true },
        take: 20,
        where: withoutIds(excludedShowIds),
      }),
      client.movie.findMany({
        orderBy: { updatedAt: "desc" },
        select: { genreNames: true, id: true, overview: true, posterPath: true, title: true },
        take: 20,
        where: withoutIds(excludedMovieIds),
      }),
    ]);
    const itemsByType = {
      movie: rankByGenreMatch(movies, preferredGenreNames).slice(0, 10).map((movie) => toRecommendation(movie, "movie", averageMovieRating)),
      show: rankByGenreMatch(shows, preferredGenreNames).slice(0, 10).map((show) => toRecommendation(show, "show", averageShowRating)),
    };

    return {
      basis: {
        averageMovieRating,
        averageShowRating,
        availabilityCountry,
        preferredGenreNames,
        ratedTitleCount: showPreferences.length + moviePreferences.length,
      },
      items: mediaOrder.flatMap((mediaType) => itemsByType[mediaType]).slice(0, 10),
    };
  }
}

function toRecommendation(
  item: { genreNames: string[]; id: string; overview: string; posterPath: string | null; title: string },
  mediaType: MediaType,
  averageRating: number | null,
): RecommendationCandidateDto {
  return {
    ...item,
    mediaType,
    reason: averageRating === null ? "from_catalog" : mediaType === "movie" ? "based_on_movie_ratings" : "based_on_show_ratings",
  };
}

function getPreferredGenreNames(
  showPreferences: Array<{ rating: number; show: { genreNames: string[] } }>,
  moviePreferences: Array<{ movie: { genreNames: string[] }; rating: number }>,
) {
  return unique([
    ...showPreferences.filter((item) => item.rating >= 4).flatMap((item) => item.show.genreNames),
    ...moviePreferences.filter((item) => item.rating >= 4).flatMap((item) => item.movie.genreNames),
  ]);
}

function rankByGenreMatch<T extends { genreNames: string[] }>(items: T[], preferredGenreNames: string[]) {
  if (preferredGenreNames.length === 0) {
    return items;
  }

  const preferred = new Set(preferredGenreNames);

  return [...items].sort((left, right) => getGenreScore(right, preferred) - getGenreScore(left, preferred));
}

function getGenreScore(item: { genreNames: string[] }, preferredGenreNames: Set<string>) {
  return item.genreNames.filter((genreName) => preferredGenreNames.has(genreName)).length;
}

function getMediaOrder(averageShowRating: number | null, averageMovieRating: number | null): MediaType[] {
  if (averageShowRating === null && averageMovieRating === null) {
    return [];
  }

  if (averageShowRating === null) {
    return ["movie", "show"];
  }

  if (averageMovieRating === null) {
    return ["show", "movie"];
  }

  return averageShowRating >= averageMovieRating ? ["show", "movie"] : ["movie", "show"];
}

function getAverageRating(items: Array<{ rating: number }>) {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + item.rating, 0);

  return Math.round((total / items.length) * 10) / 10;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function withoutIds(ids: string[]) {
  return ids.length === 0 ? {} : { id: { notIn: ids } };
}
