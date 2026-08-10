import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { API_CONFIG, type ApiConfig } from "./config";
import { PrismaClient } from "./generated/prisma/client";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private client: PrismaClient | undefined;

  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  async ping() {
    await this.getClient().$queryRaw`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.client?.$disconnect();
  }

  getClient() {
    if (this.client) {
      return this.client;
    }

    this.client = new PrismaClient({
      adapter: new PrismaPg({ connectionString: this.config.databaseUrl }),
    });

    return this.client;
  }
}
