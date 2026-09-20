import { describe, expect, it } from "vitest";

import { extractSessionFromAuthCallbackUrl, isAuthCallbackUrl } from "./auth-callback";

describe("auth callback", () => {
  it("accepts the release triple-slash callback URL", () => {
    expect(isAuthCallbackUrl("tvlore:///auth/callback#access_token=a&refresh_token=b")).toBe(true);
  });

  it("accepts the legacy double-slash callback URL", () => {
    expect(isAuthCallbackUrl("tvlore://auth/callback#access_token=a&refresh_token=b")).toBe(true);
  });

  it("accepts the Expo Go callback URL shape", () => {
    expect(isAuthCallbackUrl("exp://192.168.1.29:8081/--/auth/callback#access_token=a&refresh_token=b")).toBe(true);
    expect(isAuthCallbackUrl("exps://exp.host/@luiskabal/tvlore/--/auth/callback#access_token=a&refresh_token=b")).toBe(true);
    expect(extractSessionFromAuthCallbackUrl("exp://192.168.1.29:8081/--/auth/callback#access_token=access&refresh_token=refresh"))
      .toEqual({ accessToken: "access", refreshToken: "refresh" });
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
    expect(extractSessionFromAuthCallbackUrl("exp+tvlore://expo-development-client/?url=http%3A%2F%2F192.168.1.29%3A8081")).toBeNull();
    expect(extractSessionFromAuthCallbackUrl("tvlore:///library#access_token=a&refresh_token=b")).toBeNull();
    expect(extractSessionFromAuthCallbackUrl("tvlore:///auth/callback#access_token=a")).toBeNull();
  });
});
