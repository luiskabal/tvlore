import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { calculatePercentComplete, toShowProgress } from "../progress";
import type {
  LibraryChronologyResponseDto,
  LibraryContinueWatchingShowDto,
  LibraryNextEpisodeDto,
  LibraryRatedTitleDto,
  LibraryRecentlyWatchedItemDto,
  LibraryResponseDto,
  LibraryWatchlistItemDto,
  LibraryWatchedEpisodeDto,
  ShowProgressResponseDto,
} from "./library.types";

@Injectable()
export class LibraryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getLibrary(userId: string): Promise<LibraryResponseDto> {
    const client = this.prismaService.getClient();
    const [
      episodeWatches,
      movieWatches,
      showWatchlistItems,
      movieWatchlistItems,
      showPreferences,
      moviePreferences,
    ] = await Promise.all([
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
      client.showWatchlistItem.findMany({
        include: {
          show: { select: { id: true, posterPath: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        where: { userId },
      }),
      client.movieWatchlistItem.findMany({
        include: {
          movie: { select: { id: true, posterPath: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        where: { userId },
      }),
      client.showPreference.findMany({
        include: {
          show: { select: { id: true, posterPath: true, title: true } },
        },
        orderBy: { updatedAt: "desc" },
        where: { userId },
      }),
      client.moviePreference.findMany({
        include: {
          movie: { select: { id: true, posterPath: true, title: true } },
        },
        orderBy: { updatedAt: "desc" },
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

    const ratedTitles = toRatedTitles(showPreferences, moviePreferences);

    return {
      continueWatching: shows
        .map((show) => toContinueWatchingShow(show))
        .filter((show): show is LibraryContinueWatchingShowDto => Boolean(show))
        .sort((left, right) => compareIsoDates(latestWatchedAtByShowId.get(right.id), latestWatchedAtByShowId.get(left.id))),
      ratedTitles,
      recentlyWatched: toRecentlyWatched(episodeWatches, movieWatches),
      summary: {
        averageRating: getAverageRating(ratedTitles),
        ratedTitleCount: ratedTitles.length,
        watchlistItemCount: showWatchlistItems.length + movieWatchlistItems.length,
        watchedEpisodeCount: episodeWatches.length,
        watchedMovieCount: movieWatches.length,
        watchedShowCount: watchedShowIds.length,
      },
      watchlist: toWatchlist(showWatchlistItems, movieWatchlistItems),
      watchedEpisodes: toWatchedEpisodes(episodeWatches),
    };
  }

  async getChronology(
    userId: string,
    input: { cursor?: Date; limit: number },
  ): Promise<LibraryChronologyResponseDto> {
    const client = this.prismaService.getClient();
    const pageSize = input.limit + 1;
    const where = input.cursor
      ? { userId, watchedAt: { lt: input.cursor } }
      : { userId };
    const [episodeWatches, movieWatches] = await Promise.all([
      client.episodeWatch.findMany({
        include: {
          episode: {
            select: {
              episodeNumber: true,
              id: true,
              seasonNumber: true,
              show: { select: { id: true, title: true } },
              title: true,
            },
          },
        },
        orderBy: { watchedAt: "desc" },
        take: pageSize,
        where,
      }),
      client.movieWatch.findMany({
        include: {
          movie: { select: { id: true, posterPath: true, title: true } },
        },
        orderBy: { watchedAt: "desc" },
        take: pageSize,
        where,
      }),
    ]);
    const chronologyItems = toChronologyItems(episodeWatches, movieWatches);
    const items = chronologyItems.slice(0, input.limit);

    return {
      items,
      nextCursor: chronologyItems.length > input.limit ? items[items.length - 1]?.watchedAt ?? null : null,
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
  return toChronologyItems(episodeWatches, movieWatches).slice(0, 10);
}

function toChronologyItems(
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
    ...toWatchedEpisodes(episodeWatches),
    ...movieWatches.map((watch) => ({
      id: watch.movie.id,
      mediaType: "movie" as const,
      posterPath: watch.movie.posterPath,
      title: watch.movie.title,
      watchedAt: watch.watchedAt.toISOString(),
    })),
  ].sort((left, right) => compareIsoDates(right.watchedAt, left.watchedAt));
}

function toWatchedEpisodes(
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
): LibraryWatchedEpisodeDto[] {
  return episodeWatches.map((watch) => ({
    episodeNumber: watch.episode.episodeNumber,
    id: watch.episode.id,
    mediaType: "episode" as const,
    seasonNumber: watch.episode.seasonNumber,
    showId: watch.episode.show.id,
    showTitle: watch.episode.show.title,
    title: watch.episode.title,
    watchedAt: watch.watchedAt.toISOString(),
  }));
}

function toWatchlist(
  showItems: Array<{
    createdAt: Date;
    show: { id: string; posterPath: string | null; title: string };
  }>,
  movieItems: Array<{
    createdAt: Date;
    movie: { id: string; posterPath: string | null; title: string };
  }>,
): LibraryWatchlistItemDto[] {
  return [
    ...showItems.map((item) => ({
      createdAt: item.createdAt.toISOString(),
      id: item.show.id,
      mediaType: "show" as const,
      posterPath: item.show.posterPath,
      title: item.show.title,
    })),
    ...movieItems.map((item) => ({
      createdAt: item.createdAt.toISOString(),
      id: item.movie.id,
      mediaType: "movie" as const,
      posterPath: item.movie.posterPath,
      title: item.movie.title,
    })),
  ].sort((left, right) => compareIsoDates(right.createdAt, left.createdAt));
}

function toRatedTitles(
  showPreferences: Array<{
    rating: number;
    show: { id: string; posterPath: string | null; title: string };
    updatedAt: Date;
  }>,
  moviePreferences: Array<{
    movie: { id: string; posterPath: string | null; title: string };
    rating: number;
    updatedAt: Date;
  }>,
): LibraryRatedTitleDto[] {
  return [
    ...showPreferences.map((item) => ({
      id: item.show.id,
      mediaType: "show" as const,
      posterPath: item.show.posterPath,
      rating: item.rating,
      title: item.show.title,
      updatedAt: item.updatedAt.toISOString(),
    })),
    ...moviePreferences.map((item) => ({
      id: item.movie.id,
      mediaType: "movie" as const,
      posterPath: item.movie.posterPath,
      rating: item.rating,
      title: item.movie.title,
      updatedAt: item.updatedAt.toISOString(),
    })),
  ].sort((left, right) => compareIsoDates(right.updatedAt, left.updatedAt));
}

function getAverageRating(items: LibraryRatedTitleDto[]) {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + item.rating, 0);

  return Math.round((total / items.length) * 10) / 10;
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
