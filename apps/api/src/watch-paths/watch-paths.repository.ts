import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import type { HydratedWatchPathItemInput, WatchPathDetailDto, WatchPathSummaryDto } from "./watch-paths.types";
import type { WatchPathDefinition } from "./watch-paths.data";

@Injectable()
export class WatchPathsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listUserSummaries(userId: string): Promise<WatchPathSummaryDto[]> {
    const paths = await this.prismaService.getClient().userWatchPath.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
      where: { userId },
    });

    return paths.map((path) => ({
      description: path.description,
      id: path.id,
      itemCount: path._count.items,
      source: "user",
      title: path.title,
    }));
  }

  async findUserPath(userId: string, pathId: string): Promise<WatchPathDefinition | null> {
    const path = await this.prismaService.getClient().userWatchPath.findFirst({
      include: {
        items: { orderBy: { position: "asc" } },
      },
      where: { id: pathId, userId },
    });

    return path ? toWatchPathDefinition(path) : null;
  }

  async createUserPath(
    userId: string,
    input: { description: string; items: HydratedWatchPathItemInput[]; title: string },
  ): Promise<WatchPathDefinition> {
    const path = await this.prismaService.getClient().userWatchPath.create({
      data: {
        description: input.description,
        items: {
          create: input.items.map((item, index) => ({
            mediaType: item.mediaType,
            note: item.note,
            position: index + 1,
            posterPath: item.posterPath,
            provider: item.externalRef.provider,
            providerId: item.externalRef.providerId,
            title: item.title,
            year: item.year,
          })),
        },
        title: input.title,
        userId,
      },
      include: {
        items: { orderBy: { position: "asc" } },
      },
    });

    return toWatchPathDefinition(path);
  }
}

function toWatchPathDefinition(path: {
  description: string;
  id: string;
  items: Array<{
    mediaType: string;
    note: string | null;
    posterPath: string | null;
    provider: string;
    providerId: string;
    title: string;
    year: number | null;
  }>;
  title: string;
}): WatchPathDefinition {
  return {
    description: path.description,
    id: path.id,
    items: path.items.map((item) => ({
      externalRef: { provider: "tmdb", providerId: item.providerId },
      mediaType: item.mediaType === "show" ? "show" : "movie",
      note: item.note,
      posterPath: item.posterPath,
      title: item.title,
      year: item.year,
    })),
    source: "user",
    title: path.title,
  };
}
