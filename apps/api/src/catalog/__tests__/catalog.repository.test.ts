import { describe, expect, it, vi } from "vitest";

import { CatalogRepository } from "../catalog.repository";
import type { PrismaService } from "../../prisma.service";

const userId = "00000000-0000-4000-8000-000000000001";
const episodeId = "00000000-0000-4000-8000-000000000002";
const showId = "00000000-0000-4000-8000-000000000003";
const seasonId = "00000000-0000-4000-8000-000000000004";

describe("CatalogRepository", () => {
  it("returns episode detail with show and season context", async () => {
    const watchedAt = new Date("2026-08-14T00:00:00.000Z");
    const client = {
      episode: {
        findUnique: vi.fn().mockResolvedValue({
          airDate: new Date("2022-06-11T00:00:00.000Z"),
          episodeNumber: 1,
          id: episodeId,
          overview: "Pilot overview.",
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
      where: { id: episodeId },
    }));
  });
});
