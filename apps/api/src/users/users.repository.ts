import { Injectable } from "@nestjs/common";

import type { AuthenticatedUser } from "../auth/authenticated-user";
import { PrismaService } from "../prisma.service";
import { getDisplayName } from "./user-profile";
import type { UpdateUserInput, UserDto } from "./users.types";

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

    return {
      availabilityCountry: identity.user.availabilityCountry,
      createdAt: identity.user.createdAt.toISOString(),
      displayName: identity.user.displayName,
      id: identity.user.id,
    };
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<UserDto> {
    const user = await this.prismaService.getClient().user.update({
      data: input,
      where: { id: userId },
    });

    return {
      availabilityCountry: user.availabilityCountry,
      createdAt: user.createdAt.toISOString(),
      displayName: user.displayName,
      id: user.id,
    };
  }
}
