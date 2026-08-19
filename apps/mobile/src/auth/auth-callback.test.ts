import { describe, expect, it } from "vitest";

import { extractSessionFromAuthCallbackUrl, isAuthCallbackUrl } from "./auth-callback";

describe("auth callback", () => {
  it("accepts the release triple-slash callback URL", () => {
    expect(isAuthCallbackUrl("tvlore:///auth/callback#access_token=a&refresh_token=b")).toBe(true);
  });

  it("accepts the legacy double-slash callback URL", () => {
    expect(isAuthCallbackUrl("tvlore://auth/callback#access_token=a&refresh_token=b")).toBe(true);
  });

  it("extracts Supabase session tokens from callback fragments", () => {
    expect(extractSessionFromAuthCallbackUrl("tvlore:///auth/callback#access_token=access&refresh_token=refresh"))
      .toEqual({ accessToken: "access", refreshToken: "refresh" });
  });

  it("extracts Supabase session tokens from callback query params", () => {
    expect(extractSessionFromAuthCallbackUrl("tvlore:///auth/callback?access_token=access&refresh_token=refresh"))
      .toEqual({ accessToken: "access", refreshToken: "refresh" });
  });

  it("rejects non-callback URLs and callbacks without a full session", () => {
    expect(extractSessionFromAuthCallbackUrl("https://auth/callback#access_token=a&refresh_token=b")).toBeNull();
    expect(extractSessionFromAuthCallbackUrl("tvlore:///library#access_token=a&refresh_token=b")).toBeNull();
    expect(extractSessionFromAuthCallbackUrl("tvlore:///auth/callback#access_token=a")).toBeNull();
  });
});
