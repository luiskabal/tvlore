import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../prisma.service";
import { TrackingRepository } from "../tracking/tracking.repository";

const userId = "00000000-0000-4000-8000-000000000001";
const showId = "00000000-0000-4000-8000-000000000002";
const firstEpisodeId = "00000000-0000-4000-8000-000000000003";
const secondEpisodeId = "00000000-0000-4000-8000-000000000004";

describe("TrackingRepository", () => {
  it("returns full show progress after marking an episode watched", async () => {
    const watchedAt = new Date("2026-08-14T00:00:00.000Z");
    const client = {
      episode: {
        findUnique: vi.fn().mockResolvedValue({ id: firstEpisodeId, showId }),
      },
      episodeWatch: {
        upsert: vi.fn().mockResolvedValue({ watchedAt }),
      },
      show: {
        findUnique: vi.fn().mockResolvedValue({
          id: showId,
          seasons: [
            {
              episodes: [
                {
                  episodeNumber: 1,
                  id: firstEpisodeId,
                  seasonNumber: 1,
                  title: "Pilot",
                  watches: [{ watchedAt }],
                },
                {
                  episodeNumber: 2,
                  id: secondEpisodeId,
                  seasonNumber: 1,
                  title: "Second",
                  watches: [],
                },
              ],
              seasonNumber: 1,
            },
          ],
        }),
      },
    };
    const repository = new TrackingRepository({ getClient: () => client } as unknown as PrismaService);

    await expect(repository.markEpisodeWatched(userId, firstEpisodeId, watchedAt)).resolves.toEqual({
      episodeId: firstEpisodeId,
      lastWatchedAt: watchedAt.toISOString(),
      showProgress: {
        isComplete: false,
        nextEpisode: {
          episodeNumber: 2,
          id: secondEpisodeId,
          seasonNumber: 1,
          title: "Second",
        },
        percentComplete: 50,
        seasons: [
          {
            percentComplete: 50,
            seasonNumber: 1,
            totalEpisodeCount: 2,
            watchedEpisodeCount: 1,
          },
        ],
        showId,
        status: "watching",
        totalEpisodeCount: 2,
        watchedEpisodeCount: 1,
      },
      watchCount: 1,
      watched: true,
    });
  });
});
