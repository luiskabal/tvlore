import { Controller, Get, Headers, Param } from "@nestjs/common";

import { LibraryService } from "./library.service";
import type { LibraryResponseDto, ShowProgressResponseDto } from "./library.types";

@Controller("library")
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  getLibrary(@Headers("authorization") authorizationHeader: string | undefined): Promise<LibraryResponseDto> {
    return this.libraryService.getLibrary(authorizationHeader);
  }
}

@Controller("shows")
export class ShowProgressController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get(":showId/progress")
  getShowProgress(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
  ): Promise<ShowProgressResponseDto> {
    return this.libraryService.getShowProgress(authorizationHeader, showId);
  }
}
