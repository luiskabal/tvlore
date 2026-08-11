import { Injectable, NotFoundException } from "@nestjs/common";

import { parseTvloreId } from "../catalog/catalog-detail";
import { UsersService } from "../users/users.service";
import { LibraryRepository } from "./library.repository";
import type { LibraryResponseDto, ShowProgressResponseDto } from "./library.types";

@Injectable()
export class LibraryService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly usersService: UsersService,
  ) {}

  async getLibrary(authorizationHeader: string | undefined): Promise<LibraryResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.libraryRepository.getLibrary(user.id);
  }

  async getShowProgress(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<ShowProgressResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const progress = await this.libraryRepository.findShowProgress(user.id, parseTvloreId(showId, "showId"));

    if (!progress) {
      throw new NotFoundException({
        code: "SHOW_NOT_FOUND",
        message: "Show was not found",
        details: null,
      });
    }

    return progress;
  }
}
