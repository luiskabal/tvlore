import { Controller, Get, Headers } from "@nestjs/common";

import { UsersService } from "./users.service";
import type { UserDto } from "./users.types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@Headers("authorization") authorizationHeader: string | undefined): Promise<UserDto> {
    return this.usersService.getMe(authorizationHeader);
  }
}
