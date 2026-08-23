import { describe, expect, it, vi } from "vitest";

import { LibraryRepository } from "../library/library.repository";
import type { PrismaService } from "../prisma.service";

const userId = "00000000-0000-4000-8000-000000000001";
const showId = "00000000-0000-4000-8000-000000000002";
const movieId = "00000000-0000-4000-8000-000000000003";

describe("LibraryRepository", () => {
  it("returns rated titles sorted by latest update with rating summary stats", async () => {
    const showUpdatedAt = new Date("2026-08-14T10:00:00.000Z");
    const movieUpdatedAt = new Date("2026-08-14T11:00:00.000Z");
    const client = {
      episodeWatch: { findMany: vi.fn().mockResolvedValue([]) },
      moviePreference: {
        findMany: vi.fn().mockResolvedValue([
          {
            movie: { id: movieId, posterPath: null, title: "The Dark Knight" },
            rating: 4,
            updatedAt: movieUpdatedAt,
          },
        ]),
      },
      movieWatch: { findMany: vi.fn().mockResolvedValue([]) },
      movieWatchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
      show: {
        findMany: vi.fn().mockResolvedValue([
          {
            episodes: [],
            id: showId,
            posterPath: "/dark.jpg",
            title: "Dark",
          },
        ]),
      },
      showPreference: {
        findMany: vi.fn().mockResolvedValue([
          {
            rating: 5,
            show: { id: showId, posterPath: "/dark.jpg", title: "Dark" },
            updatedAt: showUpdatedAt,
          },
        ]),
      },
      showWatchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const repository = new LibraryRepository({ getClient: () => client } as unknown as PrismaService);

    await expect(repository.getLibrary(userId)).resolves.toMatchObject({
      ratedTitles: [
        {
          id: movieId,
          mediaType: "movie",
          posterPath: null,
          rating: 4,
          title: "The Dark Knight",
          updatedAt: movieUpdatedAt.toISOString(),
        },
        {
          id: showId,
          mediaType: "show",
          posterPath: "/dark.jpg",
          rating: 5,
          title: "Dark",
          updatedAt: showUpdatedAt.toISOString(),
        },
      ],
      summary: {
        averageRating: 4.5,
        ratedTitleCount: 2,
        watchlistItemCount: 0,
        watchedEpisodeCount: 0,
        watchedMovieCount: 0,
        watchedShowCount: 0,
      },
      shows: [
        {
          id: showId,
          inWatchlist: false,
          latestActivityAt: showUpdatedAt.toISOString(),
          mediaType: "show",
          nextEpisode: null,
          percentComplete: 0,
          posterPath: "/dark.jpg",
          rating: 5,
          status: "not_started",
          title: "Dark",
          totalEpisodeCount: 0,
          watchedEpisodeCount: 0,
        },
      ],
    });
    expect(client.show.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: [showId] } },
    }));
  });

  it("returns complete watched episodes separately from recent activity", async () => {
    const episodeWatches = Array.from({ length: 11 }, (_, index) => ({
      episode: {
        episodeNumber: index + 1,
        id: `episode-${index + 1}`,
        seasonNumber: 1,
        show: { id: showId, posterPath: "/dark.jpg", title: "Dark" },
        stillPath: `/episode-${index + 1}.jpg`,
        title: `Episode ${index + 1}`,
      },
      watchedAt: new Date(`2026-08-14T10:${String(index).padStart(2, "0")}:00.000Z`),
    })).reverse();
    const client = {
      episodeWatch: { findMany: vi.fn().mockResolvedValue(episodeWatches) },
      moviePreference: { findMany: vi.fn().mockResolvedValue([]) },
      movieWatch: { findMany: vi.fn().mockResolvedValue([]) },
      movieWatchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
      show: {
        findMany: vi.fn().mockResolvedValue([
          {
            episodes: episodeWatches.map((watch) => ({
              episodeNumber: watch.episode.episodeNumber,
              id: watch.episode.id,
              seasonNumber: watch.episode.seasonNumber,
              stillPath: watch.episode.stillPath,
              title: watch.episode.title,
              watches: [{ watchedAt: watch.watchedAt }],
            })),
            id: showId,
            posterPath: "/dark.jpg",
            title: "Dark",
          },
        ]),
      },
      showPreference: { findMany: vi.fn().mockResolvedValue([]) },
      showWatchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const repository = new LibraryRepository({ getClient: () => client } as unknown as PrismaService);
    const library = await repository.getLibrary(userId);

    expect(library.summary.watchedEpisodeCount).toBe(11);
    expect(library.summary.watchedShowCount).toBe(1);
    expect(library.shows).toHaveLength(1);
    expect(library.shows[0]).toMatchObject({
      id: showId,
      status: "completed",
      title: "Dark",
      totalEpisodeCount: 11,
      watchedEpisodeCount: 11,
    });
    expect(library.recentlyWatched).toHaveLength(10);
    expect(library.watchedEpisodes).toHaveLength(11);
    expect(library.watchedEpisodes[0]).toMatchObject({
      episodeNumber: 11,
      id: "episode-11",
      mediaType: "episode",
      seasonNumber: 1,
      showId,
      showPosterPath: "/dark.jpg",
      showTitle: "Dark",
      stillPath: "/episode-11.jpg",
      title: "Episode 11",
    });
  });

  it("returns paginated chronology sorted across movies and episodes", async () => {
    const episodeWatches = [
      {
        episode: {
          episodeNumber: 2,
          id: "episode-new",
          seasonNumber: 1,
          show: { id: showId, posterPath: "/dark.jpg", title: "Dark" },
          stillPath: "/lies.jpg",
          title: "Lies",
        },
        watchedAt: new Date("2026-08-14T10:02:00.000Z"),
      },
      {
        episode: {
          episodeNumber: 1,
          id: "episode-old",
          seasonNumber: 1,
          show: { id: showId, posterPath: "/dark.jpg", title: "Dark" },
          stillPath: null,
          title: "Secrets",
        },
        watchedAt: new Date("2026-08-14T10:00:00.000Z"),
      },
    ];
    const movieWatches = [
      {
        movie: { id: "movie-new", posterPath: "/new.jpg", title: "Newest Movie" },
        watchedAt: new Date("2026-08-14T10:03:00.000Z"),
      },
      {
        movie: { id: "movie-mid", posterPath: null, title: "Middle Movie" },
        watchedAt: new Date("2026-08-14T10:01:00.000Z"),
      },
    ];
    const client = {
      episodeWatch: {
        count: vi.fn().mockResolvedValueOnce(1),
        findMany: vi.fn()
          .mockResolvedValueOnce(episodeWatches)
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([episodeWatches[1]]),
      },
      movieWatch: {
        count: vi.fn().mockResolvedValueOnce(0),
        findMany: vi.fn()
          .mockResolvedValueOnce(movieWatches)
          .mockResolvedValueOnce([movieWatches[1]])
          .mockResolvedValueOnce([]),
      },
    };
    const repository = new LibraryRepository({ getClient: () => client } as unknown as PrismaService);
    const chronology = await repository.getChronology(userId, { limit: 3 });

    expect(chronology.items.map((item) => item.id)).toEqual(["movie-new", "episode-new", "movie-mid"]);
    expect(chronology.items[1]).toMatchObject({
      id: "episode-new",
      showPosterPath: "/dark.jpg",
      stillPath: "/lies.jpg",
    });
    expect(chronology.nextCursor).toBe("2026-08-14T10:01:00.000Z");
    expect(client.episodeWatch.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { watchedAt: "desc" },
      take: 4,
      where: { userId },
    }));
    expect(client.movieWatch.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { watchedAt: "desc" },
      take: 4,
      where: { userId },
    }));

    const cursor = new Date("2026-08-14T10:01:00.000Z");

    await repository.getChronology(userId, { cursor, limit: 2 });

    expect(client.episodeWatch.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      take: 3,
      where: { userId, watchedAt: { lt: cursor } },
    }));
    expect(client.movieWatch.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      take: 3,
      where: { userId, watchedAt: { lt: cursor } },
    }));
  });

  it("keeps chronology items with the same boundary timestamp on one page", async () => {
    const watchedAt = new Date("2026-08-14T10:00:00.000Z");
    const episodeWatches = [1, 2, 3].map((episodeNumber) => ({
      episode: {
        episodeNumber,
        id: `episode-${episodeNumber}`,
        seasonNumber: 1,
        show: { id: showId, posterPath: "/dark.jpg", title: "Dark" },
        stillPath: null,
        title: `Episode ${episodeNumber}`,
      },
      watchedAt,
    }));
    const movieWatches = [{
      movie: { id: "movie-new", posterPath: "/new.jpg", title: "Newest Movie" },
      watchedAt: new Date("2026-08-14T10:03:00.000Z"),
    }];
    const client = {
      episodeWatch: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn()
          .mockResolvedValueOnce(episodeWatches)
          .mockResolvedValueOnce(episodeWatches),
      },
      movieWatch: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn()
          .mockResolvedValueOnce(movieWatches)
          .mockResolvedValueOnce([]),
      },
    };
    const repository = new LibraryRepository({ getClient: () => client } as unknown as PrismaService);
    const chronology = await repository.getChronology(userId, { limit: 2 });

    expect(chronology.items.map((item) => item.id)).toEqual([
      "movie-new",
      "episode-1",
      "episode-2",
      "episode-3",
    ]);
    expect(chronology.nextCursor).toBeNull();
  });
});
