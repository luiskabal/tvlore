import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";

export type UserDto = {
  id: string;
  displayName: string;
  createdAt: string;
};

const demoUser = {
  id: "00000000-0000-4000-8000-000000000001",
  displayName: "Demo User",
};

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(): Promise<UserDto> {
    const user = await this.prismaService.getClient().user.upsert({
      where: { id: demoUser.id },
      update: { displayName: demoUser.displayName },
      create: demoUser,
    });

    return {
      id: user.id,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
