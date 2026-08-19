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
  it("hydrates incomplete seasons before marking a show watched", async () => {
    const watchedAt = "2026-08-14T00:00:00.000Z";
    const seasonOne = { seasonNumber: 1 };
    const seasonTwo = { seasonNumber: 2 };
    const catalogRepository = {
      findShowProviderId: vi.fn().mockResolvedValue(providerShowId),
      findShowSeasonHydrationPlan: vi.fn().mockResolvedValue({
        seasons: [
          { episodeCount: 2, seasonNumber: 1, storedEpisodeCount: 0 },
          { episodeCount: 1, seasonNumber: 2, storedEpisodeCount: 0 },
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

  it("hydrates the selected season before marking it watched", async () => {
    const watchedAt = "2026-08-14T00:00:00.000Z";
    const seasonOne = { seasonNumber: 1 };
    const catalogRepository = {
      findShowProviderId: vi.fn().mockResolvedValue(providerShowId),
      upsertSeasonDetail: vi.fn().mockResolvedValue(undefined),
    };
    const tmdbClient = {
      getResolvedSeason: vi.fn().mockResolvedValue(seasonOne),
    };
    const trackingRepository = {
      markSeasonWatched: vi.fn().mockResolvedValue({
        isComplete: false,
        nextEpisode: null,
        percentComplete: 50,
        seasons: [],
        showId,
        status: "watching",
        totalEpisodeCount: 2,
        watchedEpisodeCount: 1,
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

    await expect(service.markSeasonWatched("Bearer token", showId, "1", { watchedAt })).resolves.toMatchObject({
      showId,
      status: "watching",
    });

    expect(tmdbClient.getResolvedSeason).toHaveBeenCalledWith(providerShowId, 1);
    expect(catalogRepository.upsertSeasonDetail).toHaveBeenCalledWith(showId, seasonOne);
    expect(trackingRepository.markSeasonWatched).toHaveBeenCalledWith(userId, showId, 1, new Date(watchedAt));
    expect(catalogRepository.upsertSeasonDetail.mock.invocationCallOrder[0])
      .toBeLessThan(trackingRepository.markSeasonWatched.mock.invocationCallOrder[0]);
  });
});
