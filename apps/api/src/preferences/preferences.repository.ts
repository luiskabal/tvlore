import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import type { PreferenceMutationResponseDto } from "./preferences.types";

@Injectable()
export class PreferencesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async setShowRating(userId: string, showId: string, rating: number): Promise<PreferenceMutationResponseDto> {
    const client = this.prismaService.getClient();
    const show = await client.show.findUnique({ select: { id: true }, where: { id: showId } });

    if (!show) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    const preference = await client.showPreference.upsert({
      create: { rating, showId, userId },
      update: { rating },
      where: { userId_showId: { showId, userId } },
    });

    return toPreferenceResponse(showId, "show", preference.rating, preference.updatedAt);
  }

  async clearShowRating(userId: string, showId: string): Promise<PreferenceMutationResponseDto> {
    const client = this.prismaService.getClient();
    const show = await client.show.findUnique({ select: { id: true }, where: { id: showId } });

    if (!show) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    await client.showPreference.deleteMany({ where: { showId, userId } });

    return toPreferenceResponse(showId, "show", null, null);
  }

  async setMovieRating(userId: string, movieId: string, rating: number): Promise<PreferenceMutationResponseDto> {
    const client = this.prismaService.getClient();
    const movie = await client.movie.findUnique({ select: { id: true }, where: { id: movieId } });

    if (!movie) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    const preference = await client.moviePreference.upsert({
      create: { movieId, rating, userId },
      update: { rating },
      where: { userId_movieId: { movieId, userId } },
    });

    return toPreferenceResponse(movieId, "movie", preference.rating, preference.updatedAt);
  }

  async clearMovieRating(userId: string, movieId: string): Promise<PreferenceMutationResponseDto> {
    const client = this.prismaService.getClient();
    const movie = await client.movie.findUnique({ select: { id: true }, where: { id: movieId } });

    if (!movie) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    await client.moviePreference.deleteMany({ where: { movieId, userId } });

    return toPreferenceResponse(movieId, "movie", null, null);
  }
}

function toPreferenceResponse(
  id: string,
  mediaType: "movie" | "show",
  rating: number | null,
  updatedAt: Date | null,
): PreferenceMutationResponseDto {
  return {
    id,
    mediaType,
    rating,
    updatedAt: updatedAt ? updatedAt.toISOString() : null,
  };
}

function throwNotFound(code: string, message: string): never {
  throw new NotFoundException({
    code,
    details: null,
    message,
  });
}
