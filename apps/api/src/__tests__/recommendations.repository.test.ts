import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../prisma.service";
import { RecommendationsRepository } from "../recommendations/recommendations.repository";

const userId = "00000000-0000-4000-8000-000000000001";

describe("RecommendationsRepository", () => {
  it("recommends unrated catalog titles ordered by the user's strongest rating type", async () => {
    const client = {
      episodeWatch: {
        findMany: vi.fn().mockResolvedValue([{ episode: { showId: "watched-show" } }]),
      },
      movie: {
        findMany: vi.fn().mockResolvedValue([
          {
            genreNames: [],
            id: "movie-candidate-without-genre-match",
            overview: "A candidate movie without matching genres.",
            posterPath: null,
            title: "Candidate Movie Without Match",
          },
          {
            genreNames: ["Action", "Sci-Fi"],
            id: "movie-candidate",
            overview: "A candidate movie.",
            posterPath: null,
            title: "Candidate Movie",
          },
        ]),
      },
      moviePreference: {
        findMany: vi.fn().mockResolvedValue([{ movie: { genreNames: ["Action"] }, movieId: "rated-movie", rating: 5 }]),
      },
      movieWatch: {
        findMany: vi.fn().mockResolvedValue([{ movieId: "watched-movie" }]),
      },
      movieWatchlistItem: {
        findMany: vi.fn().mockResolvedValue([{ movieId: "saved-movie" }]),
      },
      show: {
        findMany: vi.fn().mockResolvedValue([
          {
            genreNames: ["Drama"],
            id: "show-candidate",
            overview: "A candidate show.",
            posterPath: "/show.jpg",
            title: "Candidate Show",
          },
        ]),
      },
      showPreference: {
        findMany: vi.fn().mockResolvedValue([{ rating: 3, show: { genreNames: ["Drama"] }, showId: "rated-show" }]),
      },
      showWatchlistItem: {
        findMany: vi.fn().mockResolvedValue([{ showId: "saved-show" }]),
      },
    };
    const repository = new RecommendationsRepository({ getClient: () => client } as unknown as PrismaService);

    await expect(repository.getRecommendations(userId, "CL")).resolves.toEqual({
      basis: {
        averageMovieRating: 5,
        averageShowRating: 3,
        availabilityCountry: "CL",
        preferredGenreNames: ["Action"],
        ratedTitleCount: 2,
      },
      items: [
        {
          genreNames: ["Action", "Sci-Fi"],
          id: "movie-candidate",
          mediaType: "movie",
          overview: "A candidate movie.",
          posterPath: null,
          reason: "based_on_movie_ratings",
          title: "Candidate Movie",
        },
        {
          genreNames: [],
          id: "movie-candidate-without-genre-match",
          mediaType: "movie",
          overview: "A candidate movie without matching genres.",
          posterPath: null,
          reason: "based_on_movie_ratings",
          title: "Candidate Movie Without Match",
        },
        {
          genreNames: ["Drama"],
          id: "show-candidate",
          mediaType: "show",
          overview: "A candidate show.",
          posterPath: "/show.jpg",
          reason: "based_on_show_ratings",
          title: "Candidate Show",
        },
      ],
    });
    expect(client.movie.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { notIn: ["rated-movie", "saved-movie", "watched-movie"] } },
    }));
    expect(client.show.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { notIn: ["rated-show", "saved-show", "watched-show"] } },
    }));
  });

  it("returns no items until the user rates at least one title", async () => {
    const client = {
      episodeWatch: { findMany: vi.fn().mockResolvedValue([]) },
      movie: { findMany: vi.fn() },
      moviePreference: { findMany: vi.fn().mockResolvedValue([]) },
      movieWatch: { findMany: vi.fn().mockResolvedValue([]) },
      movieWatchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
      show: { findMany: vi.fn() },
      showPreference: { findMany: vi.fn().mockResolvedValue([]) },
      showWatchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const repository = new RecommendationsRepository({ getClient: () => client } as unknown as PrismaService);

    await expect(repository.getRecommendations(userId, "CL")).resolves.toEqual({
      basis: {
        averageMovieRating: null,
        averageShowRating: null,
        availabilityCountry: "CL",
        preferredGenreNames: [],
        ratedTitleCount: 0,
      },
      items: [],
    });
    expect(client.movie.findMany).not.toHaveBeenCalled();
    expect(client.show.findMany).not.toHaveBeenCalled();
  });
});
