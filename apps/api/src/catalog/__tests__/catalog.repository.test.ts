import { describe, expect, it, vi } from "vitest";

import { CatalogRepository } from "../catalog.repository";
import type { PrismaService } from "../../prisma.service";

const userId = "00000000-0000-4000-8000-000000000001";
const episodeId = "00000000-0000-4000-8000-000000000002";
const showId = "00000000-0000-4000-8000-000000000003";
const seasonId = "00000000-0000-4000-8000-000000000004";

describe("CatalogRepository", () => {
  it("returns only seasons that still need episode hydration", async () => {
    const client = {
      show: {
        findUnique: vi.fn().mockResolvedValue({
          id: showId,
          seasons: [
            { _count: { episodes: 0 }, episodeCount: 0, seasonNumber: 0 },
            { _count: { episodes: 1 }, episodeCount: 3, seasonNumber: 1 },
            { _count: { episodes: 8 }, episodeCount: 8, seasonNumber: 2 },
          ],
        }),
      },
    };
    const repository = new CatalogRepository({ getClient: () => client } as unknown as PrismaService);

    await expect(repository.findShowSeasonHydrationPlan(showId)).resolves.toEqual({
      seasons: [
        {
          episodeCount: 3,
          seasonNumber: 1,
          storedEpisodeCount: 1,
        },
      ],
      showId,
    });
    expect(client.show.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({
        seasons: expect.objectContaining({
          select: expect.objectContaining({
            _count: { select: { episodes: true } },
          }),
        }),
      }),
      where: { id: showId },
    }));
  });

  it("returns season detail with show context", async () => {
    const watchedAt = new Date("2026-08-14T00:00:00.000Z");
    const client = {
      season: {
        findUnique: vi.fn().mockResolvedValue({
          airDate: new Date("2022-06-11T00:00:00.000Z"),
          episodeCount: 1,
          episodes: [
            {
              airDate: new Date("2022-06-11T00:00:00.000Z"),
              episodeNumber: 1,
              id: episodeId,
              overview: "Pilot overview.",
              runtimeMinutes: 50,
              seasonNumber: 1,
              stillPath: "/still.jpg",
              title: "Monster Slayer",
              watches: [{ watchedAt }],
            },
          ],
          id: seasonId,
          overview: "Season overview.",
          posterPath: "/season.jpg",
          seasonNumber: 1,
          show: {
            title: "Dark Winds",
          },
          showId,
          title: "Season 1",
        }),
      },
    };
    const repository = new CatalogRepository({ getClient: () => client } as unknown as PrismaService);

    await expect(repository.findSeasonDetail(showId, 1, userId)).resolves.toEqual({
      airDate: "2022-06-11",
      episodeCount: 1,
      episodes: [
        {
          airDate: "2022-06-11",
          episodeNumber: 1,
          id: episodeId,
          lastWatchedAt: watchedAt.toISOString(),
          overview: "Pilot overview.",
          runtimeMinutes: 50,
          seasonNumber: 1,
          stillPath: "/still.jpg",
          title: "Monster Slayer",
          watchCount: 1,
          watched: true,
        },
      ],
      id: seasonId,
      overview: "Season overview.",
      posterPath: "/season.jpg",
      seasonNumber: 1,
      showId,
      showTitle: "Dark Winds",
      title: "Season 1",
    });
    expect(client.season.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        show: { select: { title: true } },
      }),
      where: { showId_seasonNumber: { seasonNumber: 1, showId } },
    }));
  });

  it("returns episode detail with show and season context", async () => {
    const watchedAt = new Date("2026-08-14T00:00:00.000Z");
    const client = {
      episode: {
        findUnique: vi.fn().mockResolvedValue({
          airDate: new Date("2022-06-11T00:00:00.000Z"),
          episodeNumber: 1,
          id: episodeId,
          overview: "Pilot overview.",
          preferences: [{ rating: 4 }],
          reflections: [],
          runtimeMinutes: 50,
          season: {
            id: seasonId,
            title: "Season 1",
          },
          seasonNumber: 1,
          show: {
            id: showId,
            posterPath: "/poster.jpg",
            title: "Dark Winds",
          },
          stillPath: "/still.jpg",
          title: "Monster Slayer",
          watches: [{ watchedAt }],
        }),
      },
    };
    const repository = new CatalogRepository({ getClient: () => client } as unknown as PrismaService);

    await expect(repository.findEpisodeDetail(episodeId, userId)).resolves.toEqual({
      airDate: "2022-06-11",
      episodeNumber: 1,
      id: episodeId,
      lastWatchedAt: watchedAt.toISOString(),
      overview: "Pilot overview.",
      rating: 4,
      reflection: null,
      runtimeMinutes: 50,
      seasonId,
      seasonNumber: 1,
      seasonTitle: "Season 1",
      showId,
      showPosterPath: "/poster.jpg",
      showTitle: "Dark Winds",
      stillPath: "/still.jpg",
      title: "Monster Slayer",
      watchCount: 1,
      watched: true,
    });
    expect(client.episode.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        reflections: expect.objectContaining({
          where: { userId },
        }),
      }),
      where: { id: episodeId },
    }));
  });

  it("bulk upserts season episodes", async () => {
    const transaction = {
      $executeRaw: vi.fn().mockResolvedValue(2),
      season: {
        upsert: vi.fn().mockResolvedValue({ id: seasonId }),
      },
    };
    const client = {
      $transaction: vi.fn(async (callback) => callback(transaction)),
    };
    const repository = new CatalogRepository({ getClient: () => client } as unknown as PrismaService);

    await repository.upsertSeasonDetail(showId, {
      airDate: "2026-08-14",
      episodeCount: 2,
      episodes: [
        {
          airDate: "2026-08-14",
          episodeNumber: 1,
          overview: "First.",
          runtimeMinutes: 44,
          seasonNumber: 1,
          stillPath: "/one.jpg",
          title: "One",
        },
        {
          airDate: "2026-08-21",
          episodeNumber: 2,
          overview: "Second.",
          runtimeMinutes: 45,
          seasonNumber: 1,
          stillPath: "/two.jpg",
          title: "Two",
        },
      ],
      overview: "Season overview.",
      posterPath: "/season.jpg",
      seasonNumber: 1,
      title: "Season 1",
    });

    expect(transaction.season.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { showId_seasonNumber: { seasonNumber: 1, showId } },
    }));
    expect(transaction.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
