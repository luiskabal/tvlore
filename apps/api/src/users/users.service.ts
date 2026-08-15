import { BadRequestException, Injectable } from "@nestjs/common";

import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { UsersRepository } from "./users.repository";
import type { UpdateUserInput, UserDto } from "./users.types";

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

  async updateMe(authorizationHeader: string | undefined, value: unknown): Promise<UserDto> {
    const input = parseUpdateUserInput(value);
    const authenticatedUser = await this.supabaseAuthService.getUserFromAuthorizationHeader(authorizationHeader);
    const user = await this.usersRepository.upsertAuthenticatedUser(authenticatedUser);

    return this.usersRepository.updateUser(user.id, input);
  }
}

function parseUpdateUserInput(value: unknown): UpdateUserInput {
  if (!isRecord(value)) {
    throwValidation("request body is required");
  }

  const availabilityCountry = value.availabilityCountry === undefined
    ? undefined
    : parseCountry(value.availabilityCountry);

  if (!availabilityCountry) {
    throwValidation("availabilityCountry is required");
  }

  return { availabilityCountry };
}

function parseCountry(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const country = value.trim().toUpperCase();

  return /^[A-Z]{2}$/.test(country) ? country : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function throwValidation(message: string): never {
  throw new BadRequestException({
    code: "VALIDATION_FAILED",
    details: null,
    message,
  });
}
