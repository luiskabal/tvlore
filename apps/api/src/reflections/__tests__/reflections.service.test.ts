import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { UsersService } from "../../users/users.service";
import type { ReflectionsRepository } from "../reflections.repository";
import { ReflectionsService } from "../reflections.service";

const user = {
  createdAt: "2026-08-13T00:00:00.000Z",
  displayName: "Luis",
  id: "00000000-0000-4000-8000-000000000001",
};
const showId = "00000000-0000-4000-8000-000000000002";
const movieId = "00000000-0000-4000-8000-000000000003";
const episodeId = "00000000-0000-4000-8000-000000000004";
const body = {
  comment: "That ending worked.",
  favoriteCharacter: "Jonas",
  rating: 5,
  reaction: "loved",
};
const parsedInput = {
  comment: "That ending worked.",
  favoriteCharacter: "Jonas",
  rating: 5,
  reaction: "loved",
};

describe("ReflectionsService", () => {
  it("sets a show reflection for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.setShowReflection("Bearer token", showId, body)).resolves.toEqual({
      id: showId,
      mediaType: "show",
      ...parsedInput,
      updatedAt: "2026-08-14T00:00:00.000Z",
    });
    expect(repository.setShowReflection).toHaveBeenCalledWith(user.id, showId, parsedInput);
  });

  it("sets a movie reflection for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.setMovieReflection("Bearer token", movieId, body)).resolves.toMatchObject({
      id: movieId,
      mediaType: "movie",
      rating: 5,
      reaction: "loved",
    });
    expect(repository.setMovieReflection).toHaveBeenCalledWith(user.id, movieId, parsedInput);
  });

  it("sets an episode reflection for the authenticated user", async () => {
    const { repository, service } = createService();

    await expect(service.setEpisodeReflection("Bearer token", episodeId, body)).resolves.toMatchObject({
      id: episodeId,
      mediaType: "episode",
      rating: 5,
      reaction: "loved",
    });
    expect(repository.setEpisodeReflection).toHaveBeenCalledWith(user.id, episodeId, parsedInput);
  });

  it("rejects malformed route ids and invalid bodies", async () => {
    const { service } = createService();

    await expect(service.setMovieReflection("Bearer token", "tmdb-155", body)).rejects.toThrow(BadRequestException);
    await expect(service.setEpisodeReflection("Bearer token", episodeId, { rating: 0, reaction: "liked" })).rejects.toThrow(BadRequestException);
  });
});

function createService() {
  const usersService = {
    getMe: vi.fn().mockResolvedValue(user),
  };
  const repository = {
    setEpisodeReflection: vi.fn().mockResolvedValue({
      id: episodeId,
      mediaType: "episode",
      ...parsedInput,
      updatedAt: "2026-08-14T00:00:00.000Z",
    }),
    setMovieReflection: vi.fn().mockResolvedValue({
      id: movieId,
      mediaType: "movie",
      ...parsedInput,
      updatedAt: "2026-08-14T00:00:00.000Z",
    }),
    setShowReflection: vi.fn().mockResolvedValue({
      id: showId,
      mediaType: "show",
      ...parsedInput,
      updatedAt: "2026-08-14T00:00:00.000Z",
    }),
  };

  return {
    repository,
    service: new ReflectionsService(
      repository as unknown as ReflectionsRepository,
      usersService as unknown as UsersService,
    ),
  };
}
