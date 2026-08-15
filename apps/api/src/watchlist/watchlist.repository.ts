import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import type { WatchlistCatalogRef, WatchlistMutationResponseDto } from "./watchlist.types";

@Injectable()
export class WatchlistRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findSavedCatalogKeys(userId: string, refs: WatchlistCatalogRef[]): Promise<Set<string>> {
    if (refs.length === 0) {
      return new Set();
    }

    const showIds = refs.filter((ref) => ref.mediaType === "show").map((ref) => ref.id);
    const movieIds = refs.filter((ref) => ref.mediaType === "movie").map((ref) => ref.id);
    const client = this.prismaService.getClient();
    const [showItems, movieItems] = await Promise.all([
      client.showWatchlistItem.findMany({
        select: { showId: true },
        where: { showId: { in: showIds }, userId },
      }),
      client.movieWatchlistItem.findMany({
        select: { movieId: true },
        where: { movieId: { in: movieIds }, userId },
      }),
    ]);

    return new Set([
      ...showItems.map((item) => getCatalogKey("show", item.showId)),
      ...movieItems.map((item) => getCatalogKey("movie", item.movieId)),
    ]);
  }

  async addShow(userId: string, showId: string): Promise<WatchlistMutationResponseDto> {
    const client = this.prismaService.getClient();
    const show = await client.show.findUnique({ select: { id: true }, where: { id: showId } });

    if (!show) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    await client.showWatchlistItem.upsert({
      create: { showId, userId },
      update: {},
      where: { userId_showId: { showId, userId } },
    });

    return { id: showId, inWatchlist: true, mediaType: "show" };
  }

  async removeShow(userId: string, showId: string): Promise<WatchlistMutationResponseDto> {
    const client = this.prismaService.getClient();
    const show = await client.show.findUnique({ select: { id: true }, where: { id: showId } });

    if (!show) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    await client.showWatchlistItem.deleteMany({ where: { showId, userId } });

    return { id: showId, inWatchlist: false, mediaType: "show" };
  }

  async addMovie(userId: string, movieId: string): Promise<WatchlistMutationResponseDto> {
    const client = this.prismaService.getClient();
    const movie = await client.movie.findUnique({ select: { id: true }, where: { id: movieId } });

    if (!movie) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    await client.movieWatchlistItem.upsert({
      create: { movieId, userId },
      update: {},
      where: { userId_movieId: { movieId, userId } },
    });

    return { id: movieId, inWatchlist: true, mediaType: "movie" };
  }

  async removeMovie(userId: string, movieId: string): Promise<WatchlistMutationResponseDto> {
    const client = this.prismaService.getClient();
    const movie = await client.movie.findUnique({ select: { id: true }, where: { id: movieId } });

    if (!movie) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    await client.movieWatchlistItem.deleteMany({ where: { movieId, userId } });

    return { id: movieId, inWatchlist: false, mediaType: "movie" };
  }
}

export function getCatalogKey(mediaType: WatchlistCatalogRef["mediaType"], id: string) {
  return `${mediaType}:${id}`;
}

function throwNotFound(code: string, message: string): never {
  throw new NotFoundException({
    code,
    details: null,
    message,
  });
}
