import { describe, expect, it, vi } from "vitest";

import type { CatalogRepository } from "../../catalog/catalog.repository";
import type { CatalogSearchResultDto } from "../../catalog/catalog.types";
import type { TmdbClient } from "../../catalog/tmdb-client";
import type { UsersService } from "../../users/users.service";
import { DiscoveryService } from "../discovery.service";

const user = {
  availabilityCountry: "CL",
  createdAt: "2026-08-16T00:00:00.000Z",
  displayName: "Luis KabaL",
  id: "00000000-0000-4000-8000-000000000001",
};

describe("DiscoveryService", () => {
  it("returns popular country-aware catalog items with existing TVLore ids", async () => {
    const popularItems = [
      catalogResult("show", "70523", "Dark"),
      catalogResult("movie", "155", "The Dark Knight"),
    ];
    const itemsWithTvloreIds = [
      { ...popularItems[0], tvloreId: "00000000-0000-4000-8000-000000000010" },
      popularItems[1],
    ];
    const catalogRepository = {
      withExistingTvloreIds: vi.fn().mockResolvedValue(itemsWithTvloreIds),
    };
    const tmdbClient = {
      getPopularByCountry: vi.fn().mockResolvedValue(popularItems),
    };
    const usersService = {
      getMe: vi.fn().mockResolvedValue(user),
    };
    const service = new DiscoveryService(
      catalogRepository as unknown as CatalogRepository,
      tmdbClient as unknown as TmdbClient,
      usersService as unknown as UsersService,
    );

    await expect(service.getPopular("Bearer token")).resolves.toEqual({
      country: "CL",
      items: itemsWithTvloreIds,
      section: "popular_in_country",
    });

    expect(usersService.getMe).toHaveBeenCalledWith("Bearer token");
    expect(tmdbClient.getPopularByCountry).toHaveBeenCalledWith("CL");
    expect(catalogRepository.withExistingTvloreIds).toHaveBeenCalledWith(popularItems);
  });
});

function catalogResult(
  mediaType: "movie" | "show",
  providerId: string,
  title: string,
): CatalogSearchResultDto {
  return {
    externalRef: {
      provider: "tmdb",
      providerId,
    },
    mediaType,
    overview: `${title} overview`,
    posterPath: null,
    title,
    tvloreId: null,
    year: 2020,
  };
}
