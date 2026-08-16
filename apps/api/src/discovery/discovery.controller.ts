import { Controller, Get, Headers } from "@nestjs/common";

import { DiscoveryService } from "./discovery.service";
import type { PopularDiscoveryResponseDto } from "./discovery.types";

@Controller("discovery")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("popular")
  getPopular(
    @Headers("authorization") authorizationHeader: string | undefined,
  ): Promise<PopularDiscoveryResponseDto> {
    return this.discoveryService.getPopular(authorizationHeader);
  }
}
