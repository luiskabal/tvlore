import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import type { ReflectionMediaType, WatchReaction, WatchReflectionInput, WatchReflectionResponseDto } from "./reflections.types";

@Injectable()
export class ReflectionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async setShowReflection(userId: string, showId: string, input: WatchReflectionInput): Promise<WatchReflectionResponseDto> {
    const client = this.prismaService.getClient();

    return client.$transaction(async (transaction) => {
      const show = await transaction.show.findUnique({ select: { id: true }, where: { id: showId } });

      if (!show) {
        throwNotFound("SHOW_NOT_FOUND", "Show was not found");
      }

      const preference = await transaction.showPreference.upsert({
        create: { rating: input.rating, showId, userId },
        update: { rating: input.rating },
        where: { userId_showId: { showId, userId } },
      });
      const reflection = await transaction.showReflection.upsert({
        create: toShowReflectionData(userId, showId, input),
        update: toReflectionUpdate(input),
        where: { userId_showId: { showId, userId } },
      });

      return toResponse(showId, "show", preference.rating, reflection);
    });
  }

  async setMovieReflection(userId: string, movieId: string, input: WatchReflectionInput): Promise<WatchReflectionResponseDto> {
    const client = this.prismaService.getClient();

    return client.$transaction(async (transaction) => {
      const movie = await transaction.movie.findUnique({ select: { id: true }, where: { id: movieId } });

      if (!movie) {
        throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
      }

      const preference = await transaction.moviePreference.upsert({
        create: { movieId, rating: input.rating, userId },
        update: { rating: input.rating },
        where: { userId_movieId: { movieId, userId } },
      });
      const reflection = await transaction.movieReflection.upsert({
        create: toMovieReflectionData(userId, movieId, input),
        update: toReflectionUpdate(input),
        where: { userId_movieId: { movieId, userId } },
      });

      return toResponse(movieId, "movie", preference.rating, reflection);
    });
  }

  async setEpisodeReflection(userId: string, episodeId: string, input: WatchReflectionInput): Promise<WatchReflectionResponseDto> {
    const client = this.prismaService.getClient();

    return client.$transaction(async (transaction) => {
      const episode = await transaction.episode.findUnique({ select: { id: true }, where: { id: episodeId } });

      if (!episode) {
        throwNotFound("EPISODE_NOT_FOUND", "Episode was not found");
      }

      const preference = await transaction.episodePreference.upsert({
        create: { episodeId, rating: input.rating, userId },
        update: { rating: input.rating },
        where: { userId_episodeId: { episodeId, userId } },
      });
      const reflection = await transaction.episodeReflection.upsert({
        create: toEpisodeReflectionData(userId, episodeId, input),
        update: toReflectionUpdate(input),
        where: { userId_episodeId: { episodeId, userId } },
      });

      return toResponse(episodeId, "episode", preference.rating, reflection);
    });
  }
}

function toShowReflectionData(userId: string, showId: string, input: WatchReflectionInput) {
  return {
    ...toReflectionUpdate(input),
    showId,
    userId,
  };
}

function toMovieReflectionData(userId: string, movieId: string, input: WatchReflectionInput) {
  return {
    ...toReflectionUpdate(input),
    movieId,
    userId,
  };
}

function toEpisodeReflectionData(userId: string, episodeId: string, input: WatchReflectionInput) {
  return {
    ...toReflectionUpdate(input),
    episodeId,
    userId,
  };
}

function toReflectionUpdate(input: WatchReflectionInput) {
  return {
    comment: input.comment,
    favoriteCharacter: input.favoriteCharacter,
    reaction: input.reaction,
  };
}

function toResponse(
  id: string,
  mediaType: ReflectionMediaType,
  rating: number,
  reflection: {
    comment: string | null;
    favoriteCharacter: string | null;
    reaction: string;
    updatedAt: Date;
  },
): WatchReflectionResponseDto {
  return {
    comment: reflection.comment,
    favoriteCharacter: reflection.favoriteCharacter,
    id,
    mediaType,
    rating,
    reaction: reflection.reaction as WatchReaction,
    updatedAt: reflection.updatedAt.toISOString(),
  };
}

function throwNotFound(code: string, message: string): never {
  throw new NotFoundException({
    code,
    details: null,
    message,
  });
}
