import { Body, Controller, Delete, Get, Headers, Patch } from "@nestjs/common";

import { UsersService } from "./users.service";
import type { AccountDeletionStatusDto, DeleteUserResponseDto, UserDto } from "./users.types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@Headers("authorization") authorizationHeader: string | undefined): Promise<UserDto> {
    return this.usersService.getMe(authorizationHeader);
  }

  @Get("me/account-deletion")
  getAccountDeletionStatus(
    @Headers("authorization") authorizationHeader: string | undefined,
  ): Promise<AccountDeletionStatusDto> {
    return this.usersService.getAccountDeletionStatus(authorizationHeader);
  }

  @Delete("me")
  deleteMe(@Headers("authorization") authorizationHeader: string | undefined): Promise<DeleteUserResponseDto> {
    return this.usersService.deleteMe(authorizationHeader);
  }

  @Patch("me")
  updateMe(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body() body: unknown,
  ): Promise<UserDto> {
    return this.usersService.updateMe(authorizationHeader, body);
  }
}
