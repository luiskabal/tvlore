import { Controller, Get, Headers, Param } from "@nestjs/common";

import { WatchPathsService } from "./watch-paths.service";
import type { WatchPathDetailDto, WatchPathsResponseDto } from "./watch-paths.types";

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
}
