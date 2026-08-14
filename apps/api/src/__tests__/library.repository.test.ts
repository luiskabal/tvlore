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
      show: { findMany: vi.fn().mockResolvedValue([]) },
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
    });
    expect(client.show.findMany).not.toHaveBeenCalled();
  });
});
