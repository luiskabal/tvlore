import { Controller, Get, Headers } from "@nestjs/common";

import { RecommendationsService } from "./recommendations.service";
import type { RecommendationsResponseDto } from "./recommendations.types";

@Controller("recommendations")
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  getRecommendations(
    @Headers("authorization") authorizationHeader: string | undefined,
  ): Promise<RecommendationsResponseDto> {
    return this.recommendationsService.getRecommendations(authorizationHeader);
  }
}
