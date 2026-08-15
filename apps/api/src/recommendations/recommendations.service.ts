import { Injectable } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import { TmdbClient } from "../catalog/tmdb-client";
import { UsersService } from "../users/users.service";
import { RecommendationsRepository } from "./recommendations.repository";
import type { RecommendationItemDto, RecommendationsResponseDto } from "./recommendations.types";

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
      recommendations.items.map((item) => this.withStreamingAvailability(item, user.availabilityCountry)),
    );

    return {
      ...recommendations,
      items: rankStreamingWithinMediaSegments(items),
    };
  }

  private async withStreamingAvailability(
    item: RecommendationItemDto,
    country: string,
  ): Promise<RecommendationItemDto> {
    const providerId = item.mediaType === "show"
      ? await this.catalogRepository.findShowProviderId(item.id)
      : await this.catalogRepository.findMovieProviderId(item.id);

    if (!providerId) {
      return item;
    }

    try {
      const availability = await this.tmdbClient.getWatchProviders(item.mediaType, providerId, country);

      return {
        ...item,
        streamingAvailable: availability.providers.stream.length > 0,
      };
    } catch {
      return item;
    }
  }
}

function rankStreamingWithinMediaSegments(items: RecommendationItemDto[]) {
  const ranked: RecommendationItemDto[] = [];
  let index = 0;

  while (index < items.length) {
    const mediaType = items[index].mediaType;
    const start = index;

    while (index < items.length && items[index].mediaType === mediaType) {
      index += 1;
    }

    ranked.push(
      ...items
        .slice(start, index)
        .sort((left, right) => Number(right.streamingAvailable) - Number(left.streamingAvailable)),
    );
  }

  return ranked;
}
