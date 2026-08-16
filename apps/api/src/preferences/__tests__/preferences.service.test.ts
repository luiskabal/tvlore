import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { UsersService } from "../../users/users.service";
import type { PreferencesRepository } from "../preferences.repository";
import { PreferencesService } from "../preferences.service";

const user = {
  createdAt: "2026-08-13T00:00:00.000Z",
  displayName: "Luis",
  id: "00000000-0000-4000-8000-000000000001",
};
const showId = "00000000-0000-4000-8000-000000000002";
const movieId = "00000000-0000-4000-8000-000000000003";
const episodeId = "00000000-0000-4000-8000-000000000004";

describe("PreferencesService", () => {
  it("sets a show rating for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.setShowRating("Bearer token", showId, { rating: 5 })).resolves.toEqual({
      id: showId,
      mediaType: "show",
      rating: 5,
      updatedAt: "2026-08-14T00:00:00.000Z",
    });
    expect(repository.setShowRating).toHaveBeenCalledWith(user.id, showId, 5);
  });

  it("clears a movie rating for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.clearMovieRating("Bearer token", movieId)).resolves.toEqual({
      id: movieId,
      mediaType: "movie",
      rating: null,
      updatedAt: null,
    });
    expect(repository.clearMovieRating).toHaveBeenCalledWith(user.id, movieId);
  });

  it("sets an episode rating for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.setEpisodeRating("Bearer token", episodeId, { rating: 4 })).resolves.toEqual({
      id: episodeId,
      mediaType: "episode",
      rating: 4,
      updatedAt: "2026-08-14T00:00:00.000Z",
    });
    expect(repository.setEpisodeRating).toHaveBeenCalledWith(user.id, episodeId, 4);
  });

  it("rejects malformed route ids and invalid ratings", async () => {
    const { service } = createService();

    await expect(service.setShowRating("Bearer token", "tmdb-70523", { rating: 5 })).rejects.toThrow(BadRequestException);
    await expect(service.setMovieRating("Bearer token", movieId, { rating: 6 })).rejects.toThrow(BadRequestException);
    await expect(service.setEpisodeRating("Bearer token", episodeId, { rating: 0 })).rejects.toThrow(BadRequestException);
  });
});

function createService() {
  const usersService = {
    getMe: vi.fn().mockResolvedValue(user),
  };
  const repository = {
    clearEpisodeRating: vi.fn().mockResolvedValue({ id: episodeId, mediaType: "episode", rating: null, updatedAt: null }),
    clearMovieRating: vi.fn().mockResolvedValue({ id: movieId, mediaType: "movie", rating: null, updatedAt: null }),
    clearShowRating: vi.fn().mockResolvedValue({ id: showId, mediaType: "show", rating: null, updatedAt: null }),
    setEpisodeRating: vi.fn().mockResolvedValue({
      id: episodeId,
      mediaType: "episode",
      rating: 4,
      updatedAt: "2026-08-14T00:00:00.000Z",
    }),
    setMovieRating: vi.fn().mockResolvedValue({
      id: movieId,
      mediaType: "movie",
      rating: 4,
      updatedAt: "2026-08-14T00:00:00.000Z",
    }),
    setShowRating: vi.fn().mockResolvedValue({
      id: showId,
      mediaType: "show",
      rating: 5,
      updatedAt: "2026-08-14T00:00:00.000Z",
    }),
  };

  return {
    repository,
    service: new PreferencesService(
      repository as unknown as PreferencesRepository,
      usersService as unknown as UsersService,
    ),
  };
}
