import { describe, expect, it, vi } from "vitest";

import type { CatalogRepository } from "../catalog/catalog.repository";
import type { TmdbClient } from "../catalog/tmdb-client";
import { TrackingRepository } from "../tracking/tracking.repository";
import { TrackingService } from "../tracking/tracking.service";
import type { UsersService } from "../users/users.service";

const userId = "00000000-0000-4000-8000-000000000001";
const showId = "00000000-0000-4000-8000-000000000002";
const providerShowId = "70523";

describe("TrackingService", () => {
  it("hydrates non-empty seasons before marking a show watched", async () => {
    const watchedAt = "2026-08-14T00:00:00.000Z";
    const seasonOne = { seasonNumber: 1 };
    const seasonTwo = { seasonNumber: 2 };
    const catalogRepository = {
      findShowProviderId: vi.fn().mockResolvedValue(providerShowId),
      findShowSeasons: vi.fn().mockResolvedValue({
        seasons: [
          { episodeCount: 0, seasonNumber: 0 },
          { episodeCount: 2, seasonNumber: 1 },
          { episodeCount: 1, seasonNumber: 2 },
        ],
        showId,
      }),
      upsertSeasonDetail: vi.fn().mockResolvedValue(undefined),
    };
    const tmdbClient = {
      getResolvedSeason: vi.fn()
        .mockResolvedValueOnce(seasonOne)
        .mockResolvedValueOnce(seasonTwo),
    };
    const trackingRepository = {
      markShowWatched: vi.fn().mockResolvedValue({
        isComplete: true,
        nextEpisode: null,
        percentComplete: 100,
        seasons: [],
        showId,
        status: "completed",
        totalEpisodeCount: 3,
        watchedEpisodeCount: 3,
      }),
    };
    const usersService = {
      getMe: vi.fn().mockResolvedValue({ id: userId }),
    };
    const service = new TrackingService(
      catalogRepository as unknown as CatalogRepository,
      trackingRepository as unknown as TrackingRepository,
      tmdbClient as unknown as TmdbClient,
      usersService as unknown as UsersService,
    );

    await expect(service.markShowWatched("Bearer token", showId, { watchedAt })).resolves.toMatchObject({
      isComplete: true,
      showId,
      status: "completed",
    });

    expect(tmdbClient.getResolvedSeason).toHaveBeenCalledTimes(2);
    expect(tmdbClient.getResolvedSeason).toHaveBeenCalledWith(providerShowId, 1);
    expect(tmdbClient.getResolvedSeason).toHaveBeenCalledWith(providerShowId, 2);
    expect(catalogRepository.upsertSeasonDetail).toHaveBeenCalledWith(showId, seasonOne);
    expect(catalogRepository.upsertSeasonDetail).toHaveBeenCalledWith(showId, seasonTwo);
    expect(trackingRepository.markShowWatched).toHaveBeenCalledWith(userId, showId, new Date(watchedAt));
    expect(catalogRepository.upsertSeasonDetail.mock.invocationCallOrder[1])
      .toBeLessThan(trackingRepository.markShowWatched.mock.invocationCallOrder[0]);
  });
});
