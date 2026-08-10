import { Controller, Get } from "@nestjs/common";

import { UserDto, UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(): Promise<UserDto> {
    return this.usersService.getMe();
  }
}
