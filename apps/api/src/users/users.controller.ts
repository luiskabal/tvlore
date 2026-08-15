import { Body, Controller, Get, Headers, Patch } from "@nestjs/common";

import { UsersService } from "./users.service";
import type { UserDto } from "./users.types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@Headers("authorization") authorizationHeader: string | undefined): Promise<UserDto> {
    return this.usersService.getMe(authorizationHeader);
  }

  @Patch("me")
  updateMe(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body() body: unknown,
  ): Promise<UserDto> {
    return this.usersService.updateMe(authorizationHeader, body);
  }
}
