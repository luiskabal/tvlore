import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { parseTvloreId } from "../catalog/catalog-detail";
import { UsersService } from "../users/users.service";
import { LibraryRepository } from "./library.repository";
import type { LibraryChronologyResponseDto, LibraryResponseDto, ShowProgressResponseDto } from "./library.types";

const defaultChronologyLimit = 20;
const maxChronologyLimit = 50;

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

  async getChronology(
    authorizationHeader: string | undefined,
    query: { cursor?: string; limit?: string },
  ): Promise<LibraryChronologyResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.libraryRepository.getChronology(user.id, parseChronologyQuery(query));
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

function parseChronologyQuery(query: { cursor?: string; limit?: string }) {
  return {
    cursor: parseCursor(query.cursor),
    limit: parseLimit(query.limit),
  };
}

function parseLimit(value: string | undefined) {
  if (!value) {
    return defaultChronologyLimit;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1 || limit > maxChronologyLimit) {
    throwValidation(`limit must be an integer between 1 and ${maxChronologyLimit}`);
  }

  return limit;
}

function parseCursor(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const cursor = new Date(value);

  if (Number.isNaN(cursor.getTime())) {
    throwValidation("cursor must be an ISO datetime");
  }

  return cursor;
}

function throwValidation(message: string): never {
  throw new BadRequestException({
    code: "VALIDATION_FAILED",
    message,
    details: null,
  });
}
