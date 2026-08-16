import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { CatalogRepository } from "../../catalog/catalog.repository";
import type { CatalogResolveInput, CatalogResolvedItem, CatalogSearchResultDto } from "../../catalog/catalog.types";
import type { TmdbClient } from "../../catalog/tmdb-client";
import type { UsersService } from "../../users/users.service";
import type { WatchlistRepository } from "../../watchlist/watchlist.repository";
import type { WatchPathsRepository } from "../watch-paths.repository";
import { WatchPathsService } from "../watch-paths.service";

describe("WatchPathsService", () => {
  it("marks path items already saved to watchlist", async () => {
    const catalogRepository = {
      withExistingTvloreIds: vi.fn(async (items: CatalogSearchResultDto[]) => items.map((item, index) => ({
        ...item,
        tvloreId: index === 0 ? "saved-movie-id" : index === 1 ? "unsaved-movie-id" : null,
      }))),
    };
    const watchlistRepository = {
      findSavedCatalogKeys: vi.fn(async () => new Set(["movie:saved-movie-id"])),
    };
    const service = new WatchPathsService(
      catalogRepository as unknown as CatalogRepository,
      {} as unknown as TmdbClient,
      { getMe: vi.fn(async () => ({ createdAt: "", displayName: "Luis", id: "user-id" })) } as unknown as UsersService,
      watchlistRepository as unknown as WatchlistRepository,
      { findUserPath: vi.fn(), listUserSummaries: vi.fn() } as unknown as WatchPathsRepository,
    );

    const response = await service.get("Bearer token", "star-wars-skywalker-release");

    expect(response.savedItemCount).toBe(1);
    expect(response.items[0]).toMatchObject({
      inWatchlist: true,
      title: "Star Wars",
      tvloreId: "saved-movie-id",
    });
    expect(response.items[1]).toMatchObject({
      inWatchlist: false,
      title: "The Empire Strikes Back",
      tvloreId: "unsaved-movie-id",
    });
    expect(response.items[2]?.inWatchlist).toBe(false);
    expect(watchlistRepository.findSavedCatalogKeys).toHaveBeenCalledWith("user-id", [
      { id: "saved-movie-id", mediaType: "movie" },
      { id: "unsaved-movie-id", mediaType: "movie" },
    ]);
  });

  it("saves every path item to the user's watchlist", async () => {
    const catalogRepository = {
      upsertResolvedItem: vi.fn(async (item: CatalogResolvedItem) => ({
        id: `resolved-${item.externalRef.providerId}`,
        mediaType: item.mediaType,
      })),
      withExistingTvloreIds: vi.fn(async (items: CatalogSearchResultDto[]) => items.map((item, index) => ({
        ...item,
        tvloreId: index === 0 ? "existing-star-wars-id" : null,
      }))),
    };
    const tmdbClient = {
      getResolvedItem: vi.fn(async (input: CatalogResolveInput) => ({
        backdropPath: null,
        externalRef: { provider: "tmdb", providerId: input.providerId },
        firstAirDate: null,
        genreNames: [],
        mediaType: input.mediaType,
        originalTitle: null,
        overview: "",
        posterPath: null,
        releaseDate: null,
        runtimeMinutes: null,
        seasons: [],
        title: `Resolved ${input.providerId}`,
      })),
    };
    const usersService = {
      getMe: vi.fn(async () => ({ createdAt: "", displayName: "Luis", id: "user-id" })),
    };
    const watchlistRepository = {
      addMovie: vi.fn(async (_userId: string, movieId: string) => ({ id: movieId, inWatchlist: true, mediaType: "movie" })),
      addShow: vi.fn(),
    };
    const service = new WatchPathsService(
      catalogRepository as unknown as CatalogRepository,
      tmdbClient as unknown as TmdbClient,
      usersService as unknown as UsersService,
      watchlistRepository as unknown as WatchlistRepository,
      { findUserPath: vi.fn(), listUserSummaries: vi.fn() } as unknown as WatchPathsRepository,
    );

    const response = await service.saveToWatchlist("Bearer token", "star-wars-skywalker-release");

    expect(response).toEqual({
      id: "star-wars-skywalker-release",
      itemCount: 9,
      savedItemCount: 9,
      title: "Star Wars Skywalker Saga",
    });
    expect(usersService.getMe).toHaveBeenCalledWith("Bearer token");
    expect(tmdbClient.getResolvedItem).toHaveBeenCalledTimes(8);
    expect(catalogRepository.upsertResolvedItem).toHaveBeenCalledTimes(8);
    expect(watchlistRepository.addMovie).toHaveBeenCalledTimes(9);
    expect(watchlistRepository.addMovie).toHaveBeenCalledWith("user-id", "existing-star-wars-id");
    expect(watchlistRepository.addShow).not.toHaveBeenCalled();
  });

  it("rejects unknown watch paths", async () => {
    const service = new WatchPathsService(
      { withExistingTvloreIds: vi.fn() } as unknown as CatalogRepository,
      {} as unknown as TmdbClient,
      { getMe: vi.fn(async () => ({ createdAt: "", displayName: "Luis", id: "user-id" })) } as unknown as UsersService,
      {} as unknown as WatchlistRepository,
      { findUserPath: vi.fn(), listUserSummaries: vi.fn() } as unknown as WatchPathsRepository,
    );

    await expect(service.saveToWatchlist("Bearer token", "missing-path")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lists user watch paths before curated paths", async () => {
    const watchPathsRepository = {
      listUserSummaries: vi.fn(async () => [{
        description: "My order",
        id: "00000000-0000-4000-8000-000000000111",
        itemCount: 2,
        source: "user",
        title: "My path",
      }]),
    };
    const service = new WatchPathsService(
      {} as unknown as CatalogRepository,
      {} as unknown as TmdbClient,
      { getMe: vi.fn(async () => ({ createdAt: "", displayName: "Luis", id: "user-id" })) } as unknown as UsersService,
      {} as unknown as WatchlistRepository,
      watchPathsRepository as unknown as WatchPathsRepository,
    );

    const response = await service.list("Bearer token");

    expect(response.paths[0]).toMatchObject({
      id: "00000000-0000-4000-8000-000000000111",
      source: "user",
      title: "My path",
    });
    expect(response.paths[1]?.source).toBe("curated");
    expect(watchPathsRepository.listUserSummaries).toHaveBeenCalledWith("user-id");
  });

  it("creates user watch paths from TMDB refs", async () => {
    const tmdbClient = {
      getResolvedItem: vi.fn(async (input: CatalogResolveInput) => ({
        backdropPath: null,
        externalRef: { provider: "tmdb", providerId: input.providerId },
        firstAirDate: input.mediaType === "show" ? "2017-12-01" : null,
        genreNames: [],
        mediaType: input.mediaType,
        originalTitle: null,
        overview: "",
        posterPath: "/poster.jpg",
        publicRating: 8.7,
        releaseDate: input.mediaType === "movie" ? "2008-07-18" : null,
        runtimeMinutes: null,
        seasons: [],
        title: input.mediaType === "movie" ? "The Dark Knight" : "Dark",
      })),
    };
    const watchPathsRepository = {
      createUserPath: vi.fn(async (_userId: string, input: { items: Array<{ title: string; year: number | null }> }) => ({
        description: "Nolan-ish",
        id: "00000000-0000-4000-8000-000000000111",
        items: input.items.map((item, index) => ({
          externalRef: { provider: "tmdb", providerId: index === 0 ? "155" : "70523" },
          mediaType: index === 0 ? "movie" : "show",
          note: null,
          posterPath: "/poster.jpg",
          title: item.title,
          year: item.year,
        })),
        source: "user",
        title: "Dark things",
      })),
    };
    const service = new WatchPathsService(
      {} as unknown as CatalogRepository,
      tmdbClient as unknown as TmdbClient,
      { getMe: vi.fn(async () => ({ createdAt: "", displayName: "Luis", id: "user-id" })) } as unknown as UsersService,
      {} as unknown as WatchlistRepository,
      watchPathsRepository as unknown as WatchPathsRepository,
    );

    const response = await service.create("Bearer token", {
      description: "Nolan-ish",
      items: [
        { externalRef: { provider: "tmdb", providerId: "155" }, mediaType: "movie" },
        { externalRef: { provider: "tmdb", providerId: "70523" }, mediaType: "show" },
      ],
      title: "Dark things",
    });

    expect(response).toMatchObject({
      id: "00000000-0000-4000-8000-000000000111",
      itemCount: 2,
      source: "user",
      title: "Dark things",
    });
    expect(response.items[0]).toMatchObject({
      posterPath: "/poster.jpg",
      title: "The Dark Knight",
      year: 2008,
    });
    expect(response.items[1]).toMatchObject({
      title: "Dark",
      year: 2017,
    });
    expect(tmdbClient.getResolvedItem).toHaveBeenCalledTimes(2);
    expect(watchPathsRepository.createUserPath).toHaveBeenCalledWith("user-id", expect.objectContaining({
      items: [
        expect.objectContaining({ title: "The Dark Knight", year: 2008 }),
        expect.objectContaining({ title: "Dark", year: 2017 }),
      ],
    }));
  });
});
