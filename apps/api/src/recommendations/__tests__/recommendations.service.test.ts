import { describe, expect, it, vi } from "vitest";

import type { CatalogRepository } from "../../catalog/catalog.repository";
import type { TmdbClient } from "../../catalog/tmdb-client";
import { RecommendationsRepository } from "../recommendations.repository";
import { RecommendationsService } from "../recommendations.service";
import type { UsersService } from "../../users/users.service";

const user = {
  availabilityCountry: "CL",
  createdAt: "2026-08-15T00:00:00.000Z",
  displayName: "Luis KabaL",
  id: "00000000-0000-4000-8000-000000000001",
};

describe("RecommendationsService", () => {
  it("prioritizes streamable recommendations inside the existing media ordering", async () => {
    const catalogRepository = {
      findMovieProviderId: vi.fn()
        .mockResolvedValueOnce("movie-unavailable-provider")
        .mockResolvedValueOnce("movie-available-provider"),
      findShowProviderId: vi.fn().mockResolvedValue("show-available-provider"),
    };
    const recommendationsRepository = {
      getRecommendations: vi.fn().mockResolvedValue({
        basis: {
          averageMovieRating: 5,
          averageShowRating: 4,
          availabilityCountry: "CL",
          preferredGenreNames: ["Drama"],
          ratedTitleCount: 2,
        },
        items: [
          recommendation("movie-unavailable", "movie"),
          recommendation("movie-available", "movie"),
          recommendation("show-available", "show"),
        ],
      }),
    };
    const tmdbClient = {
      getWatchProviders: vi.fn()
        .mockResolvedValueOnce(watchProviders(false))
        .mockResolvedValueOnce(watchProviders(true))
        .mockResolvedValueOnce(watchProviders(true)),
    };
    const usersService = {
      getMe: vi.fn().mockResolvedValue(user),
    };
    const service = new RecommendationsService(
      catalogRepository as unknown as CatalogRepository,
      recommendationsRepository as unknown as RecommendationsRepository,
      tmdbClient as unknown as TmdbClient,
      usersService as unknown as UsersService,
    );

    await expect(service.getRecommendations("Bearer token")).resolves.toMatchObject({
      basis: { availabilityCountry: "CL" },
      items: [
        { id: "movie-available", mediaType: "movie" },
        { id: "movie-unavailable", mediaType: "movie" },
        { id: "show-available", mediaType: "show" },
      ],
    });

    expect(recommendationsRepository.getRecommendations).toHaveBeenCalledWith(user.id, "CL");
    expect(tmdbClient.getWatchProviders).toHaveBeenCalledWith("movie", "movie-unavailable-provider", "CL");
    expect(tmdbClient.getWatchProviders).toHaveBeenCalledWith("movie", "movie-available-provider", "CL");
    expect(tmdbClient.getWatchProviders).toHaveBeenCalledWith("show", "show-available-provider", "CL");
  });
});

function recommendation(id: string, mediaType: "movie" | "show") {
  return {
    genreNames: ["Drama"],
    id,
    mediaType,
    overview: `${id} overview`,
    posterPath: null,
    reason: mediaType === "movie" ? "based_on_movie_ratings" : "based_on_show_ratings",
    title: id,
  };
}

function watchProviders(streamingAvailable: boolean) {
  return {
    country: "CL",
    link: null,
    providers: {
      buy: [],
      free: [],
      rent: [],
      stream: streamingAvailable ? [{ id: 8, logoPath: null, name: "Netflix" }] : [],
    },
  };
}
