import { BadGatewayException, ServiceUnavailableException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiConfig } from "../../config";
import { SupabaseAuthService } from "../supabase-auth.service";

const config: ApiConfig = {
  databaseUrl: "postgresql://postgres:postgres@localhost:5432/postgres",
  port: 3000,
  rateLimit: {
    api: {
      maxRequests: 180,
      windowMs: 60000,
    },
    provider: {
      maxRequests: 40,
      windowMs: 60000,
    },
  },
  supabasePublishableKey: "publishable",
  supabaseServiceRoleKey: "service-role",
  supabaseUrl: "https://supabase.test",
  tmdbAccessToken: "tmdb",
};

describe("SupabaseAuthService", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("deletes Supabase auth users with the service role key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);

    vi.stubGlobal("fetch", fetchMock);

    await new SupabaseAuthService(config).deleteUser("user/id");

    expect(fetchMock).toHaveBeenCalledWith("https://supabase.test/auth/v1/admin/users/user%2Fid", {
      headers: {
        apikey: "service-role",
        Authorization: "Bearer service-role",
      },
      method: "DELETE",
    });
  });

  it("treats an already deleted Supabase auth user as deleted", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response));

    await expect(new SupabaseAuthService(config).deleteUser("missing-user")).resolves.toBeUndefined();
  });

  it("fails account deletion when the service role key is not configured", async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    await expect(new SupabaseAuthService({ ...config, supabaseServiceRoleKey: null }).deleteUser("user-id"))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails account deletion when Supabase rejects the admin request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response));

    await expect(new SupabaseAuthService(config).deleteUser("user-id"))
      .rejects.toBeInstanceOf(BadGatewayException);
  });
});
