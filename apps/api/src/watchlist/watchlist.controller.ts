import { Controller, Delete, Headers, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";

import { WatchlistService } from "./watchlist.service";
import type { WatchlistMutationResponseDto } from "./watchlist.types";

@Controller("shows")
export class ShowWatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post(":showId/watchlist")
  @HttpCode(HttpStatus.OK)
  addToWatchlist(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    return this.watchlistService.addShow(authorizationHeader, showId);
  }

  @Delete(":showId/watchlist")
  @HttpCode(HttpStatus.OK)
  removeFromWatchlist(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    return this.watchlistService.removeShow(authorizationHeader, showId);
  }
}

@Controller("movies")
export class MovieWatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post(":movieId/watchlist")
  @HttpCode(HttpStatus.OK)
  addToWatchlist(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    return this.watchlistService.addMovie(authorizationHeader, movieId);
  }

  @Delete(":movieId/watchlist")
  @HttpCode(HttpStatus.OK)
  removeFromWatchlist(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
  ): Promise<WatchlistMutationResponseDto> {
    return this.watchlistService.removeMovie(authorizationHeader, movieId);
  }
}
