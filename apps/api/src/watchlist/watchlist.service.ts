import { Injectable } from "@nestjs/common";

import { parseTvloreId } from "../catalog/catalog-detail";
import { UsersService } from "../users/users.service";
import { WatchlistRepository } from "./watchlist.repository";
import type { WatchlistMutationResponseDto } from "./watchlist.types";

@Injectable()
export class WatchlistService {
  constructor(
    private readonly usersService: UsersService,
    private readonly watchlistRepository: WatchlistRepository,
  ) {}

  async addShow(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.watchlistRepository.addShow(user.id, parseTvloreId(showId, "showId"));
  }

  async removeShow(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.watchlistRepository.removeShow(user.id, parseTvloreId(showId, "showId"));
  }

  async addMovie(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.watchlistRepository.addMovie(user.id, parseTvloreId(movieId, "movieId"));
  }

  async removeMovie(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.watchlistRepository.removeMovie(user.id, parseTvloreId(movieId, "movieId"));
  }
}
