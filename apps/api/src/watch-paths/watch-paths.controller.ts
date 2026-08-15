import { Controller, Get, Headers, Param, Post } from "@nestjs/common";

import { WatchPathsService } from "./watch-paths.service";
import type { WatchPathDetailDto, WatchPathWatchlistResponseDto, WatchPathsResponseDto } from "./watch-paths.types";

@Controller("watch-paths")
export class WatchPathsController {
  constructor(private readonly watchPathsService: WatchPathsService) {}

  @Get()
  list(
    @Headers("authorization") authorizationHeader: string | undefined,
  ): Promise<WatchPathsResponseDto> {
    return this.watchPathsService.list(authorizationHeader);
  }

  @Get(":pathId")
  get(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("pathId") pathId: string | undefined,
  ): Promise<WatchPathDetailDto> {
    return this.watchPathsService.get(authorizationHeader, pathId);
  }

  @Post(":pathId/watchlist")
  saveToWatchlist(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("pathId") pathId: string | undefined,
  ): Promise<WatchPathWatchlistResponseDto> {
    return this.watchPathsService.saveToWatchlist(authorizationHeader, pathId);
  }
}
