import { Injectable } from "@nestjs/common";

import type { AuthenticatedUser } from "../auth/authenticated-user";
import { PrismaService } from "../prisma.service";
import { getDisplayName } from "./user-profile";
import type { UpdateUserInput, UserDto } from "./users.types";
import type { User } from "../generated/prisma/client";

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertAuthenticatedUser(user: AuthenticatedUser): Promise<UserDto> {
    const displayName = getDisplayName(user);
    const identity = await this.prismaService.getClient().userIdentity.upsert({
      where: {
        provider_providerSubject: {
          provider: "supabase",
          providerSubject: user.id,
        },
      },
      update: {
        email: user.email,
        user: {
          update: { displayName },
        },
      },
      create: {
        provider: "supabase",
        providerSubject: user.id,
        email: user.email,
        user: {
          create: { displayName },
        },
      },
      include: { user: true },
    });

    return toUserDto(identity.user);
  }

  async findAuthenticatedUser(user: AuthenticatedUser): Promise<UserDto | null> {
    const identity = await this.prismaService.getClient().userIdentity.findUnique({
      include: { user: true },
      where: {
        provider_providerSubject: {
          provider: "supabase",
          providerSubject: user.id,
        },
      },
    });

    return identity ? toUserDto(identity.user) : null;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.prismaService.getClient().user.deleteMany({ where: { id: userId } });
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<UserDto> {
    const user = await this.prismaService.getClient().user.update({
      data: input,
      where: { id: userId },
    });

    return toUserDto(user);
  }
}

function toUserDto(user: User): UserDto {
  return {
    availabilityCountry: user.availabilityCountry,
    createdAt: user.createdAt.toISOString(),
    displayName: user.displayName,
    id: user.id,
  };
}
