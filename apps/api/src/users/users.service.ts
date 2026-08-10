import { Injectable } from "@nestjs/common";

import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { UsersRepository } from "./users.repository";
import type { UserDto } from "./users.types";

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getMe(authorizationHeader: string | undefined): Promise<UserDto> {
    const authenticatedUser = await this.supabaseAuthService.getUserFromAuthorizationHeader(authorizationHeader);

    return this.usersRepository.upsertAuthenticatedUser(authenticatedUser);
  }
}
