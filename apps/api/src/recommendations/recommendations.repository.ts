import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import type { RecommendationItemDto, RecommendationsResponseDto } from "./recommendations.types";

type MediaType = "movie" | "show";

@Injectable()
export class RecommendationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getRecommendations(userId: string): Promise<RecommendationsResponseDto> {
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
        select: { rating: true, showId: true },
        where: { userId },
      }),
      client.moviePreference.findMany({
        select: { movieId: true, rating: true },
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

    if (mediaOrder.length === 0) {
      return {
        basis: {
          averageMovieRating,
          averageShowRating,
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
        select: { id: true, overview: true, posterPath: true, title: true },
        take: 10,
        where: withoutIds(excludedShowIds),
      }),
      client.movie.findMany({
        orderBy: { updatedAt: "desc" },
        select: { id: true, overview: true, posterPath: true, title: true },
        take: 10,
        where: withoutIds(excludedMovieIds),
      }),
    ]);
    const itemsByType = {
      movie: movies.map((movie) => toRecommendation(movie, "movie", averageMovieRating)),
      show: shows.map((show) => toRecommendation(show, "show", averageShowRating)),
    };

    return {
      basis: {
        averageMovieRating,
        averageShowRating,
        ratedTitleCount: showPreferences.length + moviePreferences.length,
      },
      items: mediaOrder.flatMap((mediaType) => itemsByType[mediaType]).slice(0, 10),
    };
  }
}

function toRecommendation(
  item: { id: string; overview: string; posterPath: string | null; title: string },
  mediaType: MediaType,
  averageRating: number | null,
): RecommendationItemDto {
  return {
    ...item,
    mediaType,
    reason: averageRating === null ? "from_catalog" : mediaType === "movie" ? "based_on_movie_ratings" : "based_on_show_ratings",
  };
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
