import { Injectable } from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { RecommendationsRepository } from "./recommendations.repository";
import type { RecommendationsResponseDto } from "./recommendations.types";

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly recommendationsRepository: RecommendationsRepository,
    private readonly usersService: UsersService,
  ) {}

  async getRecommendations(authorizationHeader: string | undefined): Promise<RecommendationsResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.recommendationsRepository.getRecommendations(user.id);
  }
}
