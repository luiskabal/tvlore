import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { UsersService } from "../../users/users.service";
import type { WatchlistRepository } from "../watchlist.repository";
import { WatchlistService } from "../watchlist.service";

const user = {
  createdAt: "2026-08-13T00:00:00.000Z",
  displayName: "Luis",
  id: "00000000-0000-4000-8000-000000000001",
};
const showId = "00000000-0000-4000-8000-000000000002";
const movieId = "00000000-0000-4000-8000-000000000003";

describe("WatchlistService", () => {
  it("adds a show for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.addShow("Bearer token", showId)).resolves.toEqual({
      id: showId,
      inWatchlist: true,
      mediaType: "show",
    });
    expect(repository.addShow).toHaveBeenCalledWith(user.id, showId);
  });

  it("removes a movie for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.removeMovie("Bearer token", movieId)).resolves.toEqual({
      id: movieId,
      inWatchlist: false,
      mediaType: "movie",
    });
    expect(repository.removeMovie).toHaveBeenCalledWith(user.id, movieId);
  });

  it("rejects malformed route ids", async () => {
    const { service } = createService();

    await expect(service.addShow("Bearer token", "tmdb-70523")).rejects.toThrow(BadRequestException);
  });
});

function createService() {
  const usersService = {
    getMe: vi.fn().mockResolvedValue(user),
  };
  const repository = {
    addMovie: vi.fn().mockResolvedValue({ id: movieId, inWatchlist: true, mediaType: "movie" }),
    addShow: vi.fn().mockResolvedValue({ id: showId, inWatchlist: true, mediaType: "show" }),
    removeMovie: vi.fn().mockResolvedValue({ id: movieId, inWatchlist: false, mediaType: "movie" }),
    removeShow: vi.fn().mockResolvedValue({ id: showId, inWatchlist: false, mediaType: "show" }),
  };

  return {
    repository,
    service: new WatchlistService(
      usersService as unknown as UsersService,
      repository as unknown as WatchlistRepository,
    ),
  };
}
