import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { API_CONFIG, type ApiConfig } from "../config";
import type { AuthenticatedUser } from "./authenticated-user";
import { getBearerToken } from "./bearer-token";

@Injectable()
export class SupabaseAuthService {
  private readonly supabase: SupabaseClient;

  constructor(@Inject(API_CONFIG) config: ApiConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async getUserFromAuthorizationHeader(
    authorizationHeader: string | undefined,
  ): Promise<AuthenticatedUser> {
    const token = getBearerToken(authorizationHeader);

    if (!token) {
      throwUnauthorized();
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throwUnauthorized();
    }

    return {
      email: data.user.email ?? null,
      id: data.user.id,
      metadata: data.user.user_metadata,
    };
  }
}

function throwUnauthorized(): never {
  throw new UnauthorizedException({
    code: "UNAUTHORIZED",
    message: "Valid bearer token required",
    details: null,
  });
}
