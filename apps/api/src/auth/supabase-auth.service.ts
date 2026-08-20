import { BadGatewayException, Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";

import { API_CONFIG, type ApiConfig } from "../config";
import type { AuthenticatedUser } from "./authenticated-user";
import { getBearerToken } from "./bearer-token";
import { toAuthenticatedUser } from "./supabase-user";

@Injectable()
export class SupabaseAuthService {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  isAccountDeletionConfigured(): boolean {
    return Boolean(this.config.supabaseServiceRoleKey);
  }

  async deleteUser(userId: string): Promise<void> {
    const serviceRoleKey = this.config.supabaseServiceRoleKey;

    if (!serviceRoleKey) {
      throw new ServiceUnavailableException({
        code: "ACCOUNT_DELETION_NOT_CONFIGURED",
        details: null,
        message: "Account deletion is not configured",
      });
    }

    const response = await fetch(`${this.config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      method: "DELETE",
    });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new BadGatewayException({
        code: "ACCOUNT_DELETION_FAILED",
        details: null,
        message: "Could not delete Supabase Auth user",
      });
    }
  }

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
