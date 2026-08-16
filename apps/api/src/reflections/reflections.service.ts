import { Injectable } from "@nestjs/common";

import { parseTvloreId } from "../catalog/catalog-detail";
import { UsersService } from "../users/users.service";
import { parseWatchReflectionInput } from "./reflections-input";
import { ReflectionsRepository } from "./reflections.repository";
import type { WatchReflectionResponseDto } from "./reflections.types";

@Injectable()
export class ReflectionsService {
  constructor(
    private readonly reflectionsRepository: ReflectionsRepository,
    private readonly usersService: UsersService,
  ) {}

  async setShowReflection(
    authorizationHeader: string | undefined,
    showId: string | undefined,
    body: unknown,
  ): Promise<WatchReflectionResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.reflectionsRepository.setShowReflection(
      user.id,
      parseTvloreId(showId, "showId"),
      parseWatchReflectionInput(body),
    );
  }

  async setMovieReflection(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
    body: unknown,
  ): Promise<WatchReflectionResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.reflectionsRepository.setMovieReflection(
      user.id,
      parseTvloreId(movieId, "movieId"),
      parseWatchReflectionInput(body),
    );
  }

  async setEpisodeReflection(
    authorizationHeader: string | undefined,
    episodeId: string | undefined,
    body: unknown,
  ): Promise<WatchReflectionResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.reflectionsRepository.setEpisodeReflection(
      user.id,
      parseTvloreId(episodeId, "episodeId"),
      parseWatchReflectionInput(body),
    );
  }
}
