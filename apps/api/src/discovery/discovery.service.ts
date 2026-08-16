import { Injectable } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import { TmdbClient } from "../catalog/tmdb-client";
import { UsersService } from "../users/users.service";
import type { PopularDiscoveryResponseDto } from "./discovery.types";

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
}
