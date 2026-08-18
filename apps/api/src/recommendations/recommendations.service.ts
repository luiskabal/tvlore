import { Injectable } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import { TmdbClient } from "../catalog/tmdb-client";
import { UsersService } from "../users/users.service";
import { rankTvloreRecommendations } from "./recommendation-scoring";
import { RecommendationsRepository } from "./recommendations.repository";
import type { RecommendationCandidateDto, RecommendationsResponseDto } from "./recommendations.types";

type RankedRecommendationItem = RecommendationCandidateDto & {
  originalRank: number;
  streamingAvailable: boolean;
};

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly recommendationsRepository: RecommendationsRepository,
    private readonly tmdbClient: TmdbClient,
    private readonly usersService: UsersService,
  ) {}

  async getRecommendations(authorizationHeader: string | undefined): Promise<RecommendationsResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const recommendations = await this.recommendationsRepository.getRecommendations(user.id, user.availabilityCountry);
    const items = await Promise.all(
      recommendations.items.map((item, originalRank) => this.withStreamingAvailability(
        item,
        user.availabilityCountry,
        originalRank,
      )),
    );

    return {
      ...recommendations,
      items: rankTvloreRecommendations(items, recommendations.basis),
    };
  }

  private async withStreamingAvailability(
    item: RecommendationCandidateDto,
    country: string,
    originalRank: number,
  ): Promise<RankedRecommendationItem> {
    const providerId = item.mediaType === "show"
      ? await this.catalogRepository.findShowProviderId(item.id)
      : await this.catalogRepository.findMovieProviderId(item.id);

    if (!providerId) {
      return { ...item, originalRank, streamingAvailable: false };
    }

    try {
      const availability = await this.tmdbClient.getWatchProviders(item.mediaType, providerId, country);

      return {
        ...item,
        originalRank,
        streamingAvailable: availability.providers.stream.length > 0,
      };
    } catch {
      return { ...item, originalRank, streamingAvailable: false };
    }
  }
}
