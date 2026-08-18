import { Controller, Get, Headers } from "@nestjs/common";

import { DiscoveryService } from "./discovery.service";
import type { AvailableDiscoveryResponseDto, PopularDiscoveryResponseDto, TvlorePicksDiscoveryResponseDto } from "./discovery.types";

@Controller("discovery")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("popular")
  getPopular(
    @Headers("authorization") authorizationHeader: string | undefined,
  ): Promise<PopularDiscoveryResponseDto> {
    return this.discoveryService.getPopular(authorizationHeader);
  }

  @Get("available")
  getAvailable(
    @Headers("authorization") authorizationHeader: string | undefined,
  ): Promise<AvailableDiscoveryResponseDto> {
    return this.discoveryService.getAvailable(authorizationHeader);
  }

  @Get("picks")
  getPicks(
    @Headers("authorization") authorizationHeader: string | undefined,
  ): Promise<TvlorePicksDiscoveryResponseDto> {
    return this.discoveryService.getPicks(authorizationHeader);
  }
}
