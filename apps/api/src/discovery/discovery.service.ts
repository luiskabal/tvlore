import { Injectable } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import { TmdbClient } from "../catalog/tmdb-client";
import { UsersService } from "../users/users.service";
import { tvlorePicks } from "./discovery-picks";
import type { AvailableDiscoveryResponseDto, PopularDiscoveryResponseDto, TvlorePicksDiscoveryResponseDto } from "./discovery.types";

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly tmdbClient: TmdbClient,
    private readonly usersService: UsersService,
  ) {}

  async getPopular(authorizationHeader: string | undefined): Promise<PopularDiscoveryResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const popularItems = await this.tmdbClient.getPopularByCountry(user.availabilityCountry);
    const items = await this.catalogRepository.withExistingTvloreIds(popularItems);

    return {
      country: user.availabilityCountry,
      items,
      section: "popular_in_country",
    };
  }

  async getAvailable(authorizationHeader: string | undefined): Promise<AvailableDiscoveryResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const availableItems = await this.tmdbClient.getAvailableByCountry(user.availabilityCountry);
    const items = await this.catalogRepository.withExistingTvloreIds(availableItems);

    return {
      country: user.availabilityCountry,
      items,
      section: "available_in_country",
    };
  }

  async getPicks(authorizationHeader: string | undefined): Promise<TvlorePicksDiscoveryResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    return {
      items: await this.catalogRepository.withExistingTvloreIds(tvlorePicks),
      section: "tvlore_picks",
    };
  }
}
