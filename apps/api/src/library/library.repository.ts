import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { calculatePercentComplete } from "../progress";
import type {
  LibraryContinueWatchingShowDto,
  LibraryNextEpisodeDto,
  LibraryRecentlyWatchedItemDto,
  LibraryResponseDto,
  ShowProgressResponseDto,
} from "./library.types";

@Injectable()
export class LibraryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getLibrary(userId: string): Promise<LibraryResponseDto> {
    const client = this.prismaService.getClient();
    const [episodeWatches, movieWatches] = await Promise.all([
      client.episodeWatch.findMany({
        include: {
          episode: {
            select: {
              episodeNumber: true,
              id: true,
              seasonNumber: true,
              show: { select: { id: true, posterPath: true, title: true } },
              title: true,
            },
          },
        },
        orderBy: { watchedAt: "desc" },
        where: { userId },
      }),
      client.movieWatch.findMany({
        include: {
          movie: { select: { id: true, posterPath: true, title: true } },
        },
        orderBy: { watchedAt: "desc" },
        where: { userId },
      }),
    ]);
    const watchedShowIds = [...new Set(episodeWatches.map((watch) => watch.episode.show.id))];
    const shows = watchedShowIds.length === 0
      ? []
      : await client.show.findMany({
          select: {
            episodes: {
              orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
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
            id: true,
            posterPath: true,
            title: true,
          },
          where: { id: { in: watchedShowIds } },
        });
    const latestWatchedAtByShowId = new Map<string, string>();

    for (const watch of episodeWatches) {
      if (!latestWatchedAtByShowId.has(watch.episode.show.id)) {
        latestWatchedAtByShowId.set(watch.episode.show.id, watch.watchedAt.toISOString());
      }
    }

    return {
      continueWatching: shows
        .map((show) => toContinueWatchingShow(show))
        .filter((show): show is LibraryContinueWatchingShowDto => Boolean(show))
        .sort((left, right) => compareIsoDates(latestWatchedAtByShowId.get(right.id), latestWatchedAtByShowId.get(left.id))),
      recentlyWatched: toRecentlyWatched(episodeWatches, movieWatches),
      summary: {
        watchedEpisodeCount: episodeWatches.length,
        watchedMovieCount: movieWatches.length,
        watchedShowCount: watchedShowIds.length,
      },
    };
  }

  async findShowProgress(userId: string, showId: string): Promise<ShowProgressResponseDto | null> {
    const show = await this.prismaService.getClient().show.findUnique({
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

    return show ? toShowProgress(show) : null;
  }
}

function toShowProgress(show: {
  id: string;
  seasons: Array<{
    episodes: WatchedEpisode[];
    seasonNumber: number;
  }>;
}): ShowProgressResponseDto {
  const episodes = show.seasons.flatMap((season) => season.episodes);
  const totalEpisodeCount = episodes.length;
  const watchedEpisodeCount = countWatched(episodes);

  return {
    isComplete: totalEpisodeCount > 0 && watchedEpisodeCount === totalEpisodeCount,
    nextEpisode: toNextEpisode(episodes.find((episode) => episode.watches.length === 0)),
    percentComplete: calculatePercentComplete(watchedEpisodeCount, totalEpisodeCount),
    seasons: show.seasons.map((season) => {
      const seasonTotalEpisodeCount = season.episodes.length;
      const seasonWatchedEpisodeCount = countWatched(season.episodes);

      return {
        percentComplete: calculatePercentComplete(seasonWatchedEpisodeCount, seasonTotalEpisodeCount),
        seasonNumber: season.seasonNumber,
        totalEpisodeCount: seasonTotalEpisodeCount,
        watchedEpisodeCount: seasonWatchedEpisodeCount,
      };
    }),
    showId: show.id,
    totalEpisodeCount,
    watchedEpisodeCount,
  };
}

function toContinueWatchingShow(show: {
  episodes: WatchedEpisode[];
  id: string;
  posterPath: string | null;
  title: string;
}): LibraryContinueWatchingShowDto | null {
  const totalEpisodeCount = show.episodes.length;
  const watchedEpisodeCount = countWatched(show.episodes);
  const nextEpisode = toNextEpisode(show.episodes.find((episode) => episode.watches.length === 0));

  if (!nextEpisode || watchedEpisodeCount === 0 || watchedEpisodeCount === totalEpisodeCount) {
    return null;
  }

  return {
    id: show.id,
    mediaType: "show",
    nextEpisode,
    percentComplete: calculatePercentComplete(watchedEpisodeCount, totalEpisodeCount),
    posterPath: show.posterPath,
    title: show.title,
  };
}

function toRecentlyWatched(
  episodeWatches: Array<{
    episode: {
      episodeNumber: number;
      id: string;
      seasonNumber: number;
      show: { id: string; title: string };
      title: string;
    };
    watchedAt: Date;
  }>,
  movieWatches: Array<{
    movie: { id: string; posterPath: string | null; title: string };
    watchedAt: Date;
  }>,
): LibraryRecentlyWatchedItemDto[] {
  return [
    ...episodeWatches.map((watch) => ({
      episodeNumber: watch.episode.episodeNumber,
      id: watch.episode.id,
      mediaType: "episode" as const,
      seasonNumber: watch.episode.seasonNumber,
      showId: watch.episode.show.id,
      showTitle: watch.episode.show.title,
      title: watch.episode.title,
      watchedAt: watch.watchedAt.toISOString(),
    })),
    ...movieWatches.map((watch) => ({
      id: watch.movie.id,
      mediaType: "movie" as const,
      posterPath: watch.movie.posterPath,
      title: watch.movie.title,
      watchedAt: watch.watchedAt.toISOString(),
    })),
  ].sort((left, right) => compareIsoDates(right.watchedAt, left.watchedAt)).slice(0, 10);
}

function countWatched(episodes: WatchedEpisode[]) {
  return episodes.filter((episode) => episode.watches.length > 0).length;
}

function toNextEpisode(episode: WatchedEpisode | undefined): LibraryNextEpisodeDto | null {
  return episode
    ? {
        episodeNumber: episode.episodeNumber,
        id: episode.id,
        seasonNumber: episode.seasonNumber,
        title: episode.title,
      }
    : null;
}

function compareIsoDates(left: string | undefined, right: string | undefined) {
  return Date.parse(left ?? "") - Date.parse(right ?? "");
}

type WatchedEpisode = {
  episodeNumber: number;
  id: string;
  seasonNumber: number;
  title: string;
  watches: Array<{ watchedAt: Date }>;
};
