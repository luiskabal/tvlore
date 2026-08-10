import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private client: PrismaClient | undefined;

  async ping() {
    await this.getClient().$queryRaw`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.client?.$disconnect();
  }

  private getClient() {
    if (this.client) {
      return this.client;
    }

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    this.client = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });

    return this.client;
  }
}
