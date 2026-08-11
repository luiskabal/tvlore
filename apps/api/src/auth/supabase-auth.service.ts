import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

import { API_CONFIG, type ApiConfig } from "../config";
import type { AuthenticatedUser } from "./authenticated-user";
import { getBearerToken } from "./bearer-token";
import { toAuthenticatedUser } from "./supabase-user";

@Injectable()
export class SupabaseAuthService {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  async getUserFromAuthorizationHeader(
    authorizationHeader: string | undefined,
  ): Promise<AuthenticatedUser> {
    const token = getBearerToken(authorizationHeader);

    if (!token) {
      throwUnauthorized();
    }

    const response = await fetch(`${this.config.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: this.config.supabasePublishableKey,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throwUnauthorized();
    }

    const authenticatedUser = toAuthenticatedUser(await response.json());

    if (!authenticatedUser) {
      throwUnauthorized();
    }

    return authenticatedUser;
  }
}

function throwUnauthorized(): never {
  throw new UnauthorizedException({
    code: "UNAUTHORIZED",
    message: "Valid bearer token required",
    details: null,
  });
}
