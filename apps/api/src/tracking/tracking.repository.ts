import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { toShowProgress } from "../progress";
import type { ShowProgressResponseDto } from "../progress";
import type { EpisodeWatchResponseDto, MovieWatchResponseDto } from "./tracking.types";

@Injectable()
export class TrackingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async markEpisodeWatched(userId: string, episodeId: string, watchedAt: Date): Promise<EpisodeWatchResponseDto> {
    const client = this.prismaService.getClient();
    const episode = await client.episode.findUnique({
      select: { id: true, showId: true },
      where: { id: episodeId },
    });

    if (!episode) {
      throwNotFound("EPISODE_NOT_FOUND", "Episode was not found");
    }

    const watch = await client.episodeWatch.upsert({
      create: { episodeId, userId, watchedAt },
      update: { watchedAt },
      where: { userId_episodeId: { episodeId, userId } },
    });

    return {
      episodeId,
      lastWatchedAt: watch.watchedAt.toISOString(),
      showProgress: await this.getShowProgress(userId, episode.showId),
      watchCount: 1,
      watched: true,
    };
  }

  async unmarkEpisodeWatched(userId: string, episodeId: string): Promise<EpisodeWatchResponseDto> {
    const client = this.prismaService.getClient();
    const episode = await client.episode.findUnique({
      select: { id: true, showId: true },
      where: { id: episodeId },
    });

    if (!episode) {
      throwNotFound("EPISODE_NOT_FOUND", "Episode was not found");
    }

    await client.episodeWatch.deleteMany({
      where: { episodeId, userId },
    });

    return {
      episodeId,
      lastWatchedAt: null,
      showProgress: await this.getShowProgress(userId, episode.showId),
      watchCount: 0,
      watched: false,
    };
  }

  async markMovieWatched(userId: string, movieId: string, watchedAt: Date): Promise<MovieWatchResponseDto> {
    const client = this.prismaService.getClient();
    const movie = await client.movie.findUnique({
      select: { id: true },
      where: { id: movieId },
    });

    if (!movie) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    const watch = await client.movieWatch.upsert({
      create: { movieId, userId, watchedAt },
      update: { watchedAt },
      where: { userId_movieId: { movieId, userId } },
    });

    return {
      lastWatchedAt: watch.watchedAt.toISOString(),
      movieId,
      watchCount: 1,
      watched: true,
    };
  }

  async unmarkMovieWatched(userId: string, movieId: string): Promise<MovieWatchResponseDto> {
    const client = this.prismaService.getClient();
    const movie = await client.movie.findUnique({
      select: { id: true },
      where: { id: movieId },
    });

    if (!movie) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    await client.movieWatch.deleteMany({
      where: { movieId, userId },
    });

    return {
      lastWatchedAt: null,
      movieId,
      watchCount: 0,
      watched: false,
    };
  }

  private async getShowProgress(userId: string, showId: string): Promise<ShowProgressResponseDto> {
    const client = this.prismaService.getClient();
    const show = await client.show.findUnique({
      select: {
        id: true,
        seasons: {
          orderBy: { seasonNumber: "asc" },
          select: {
            episodes: {
              orderBy: { episodeNumber: "asc" },
              select: {
                episodeNumber: true,
                id: true,
                seasonNumber: true,
                title: true,
                watches: {
                  select: { watchedAt: true },
                  take: 1,
                  where: { userId },
                },
              },
            },
            seasonNumber: true,
          },
        },
      },
      where: { id: showId },
    });

    if (!show) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    return toShowProgress(show);
  }
}

function throwNotFound(code: string, message: string): never {
  throw new NotFoundException({
    code,
    message,
    details: null,
  });
}
