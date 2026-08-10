import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { createClient, type SupabaseClient, type User as SupabaseUser } from "@supabase/supabase-js";

import { API_CONFIG, type ApiConfig } from "../config";
import { PrismaService } from "../prisma.service";

export type UserDto = {
  id: string;
  displayName: string;
  createdAt: string;
};

@Injectable()
export class UsersService {
  private readonly supabase: SupabaseClient;

  constructor(
    @Inject(API_CONFIG) config: ApiConfig,
    private readonly prismaService: PrismaService,
  ) {
    this.supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async getMe(authorizationHeader: string | undefined): Promise<UserDto> {
    const supabaseUser = await this.getSupabaseUser(authorizationHeader);
    const displayName = getDisplayName(supabaseUser);
    const prisma = this.prismaService.getClient();
    const identity = await prisma.userIdentity.upsert({
      where: {
        provider_providerSubject: {
          provider: "supabase",
          providerSubject: supabaseUser.id,
        },
      },
      update: {
        email: supabaseUser.email ?? null,
        user: {
          update: { displayName },
        },
      },
      create: {
        provider: "supabase",
        providerSubject: supabaseUser.id,
        email: supabaseUser.email ?? null,
        user: {
          create: { displayName },
        },
      },
      include: { user: true },
    });

    return {
      id: identity.user.id,
      displayName: identity.user.displayName,
      createdAt: identity.user.createdAt.toISOString(),
    };
  }

  private async getSupabaseUser(authorizationHeader: string | undefined) {
    const token = getBearerToken(authorizationHeader);

    if (!token) {
      throwUnauthorized();
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throwUnauthorized();
    }

    return data.user;
  }
}

function getBearerToken(authorizationHeader: string | undefined) {
  const [scheme, token] = authorizationHeader?.split(" ") ?? [];

  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

function getDisplayName(user: SupabaseUser) {
  const metadata = user.user_metadata;
  const name = metadata.name ?? metadata.full_name ?? metadata.user_name;

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  if (user.email) {
    return user.email;
  }

  return "TVLore User";
}

function throwUnauthorized(): never {
  throw new UnauthorizedException({
    code: "UNAUTHORIZED",
    message: "Valid bearer token required",
    details: null,
  });
}
