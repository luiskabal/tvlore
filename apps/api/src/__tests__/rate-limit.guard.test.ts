import { HttpException, HttpStatus, type ExecutionContext } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiConfig } from "../config";
import { RateLimitGuard } from "../rate-limit.guard";

const config: ApiConfig = {
  databaseUrl: "postgresql://postgres:postgres@localhost:5432/postgres",
  port: 3000,
  rateLimit: {
    api: {
      maxRequests: 2,
      windowMs: 1000,
    },
    provider: {
      maxRequests: 1,
      windowMs: 1000,
    },
  },
  supabasePublishableKey: "publishable",
  supabaseServiceRoleKey: "service-role",
  supabaseUrl: "https://supabase.test",
  tmdbAccessToken: "tmdb",
};

describe("RateLimitGuard", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("skips root and health routes", () => {
    const guard = new RateLimitGuard(config);

    expect(guard.canActivate(contextFor({ path: "/" }))).toBe(true);
    expect(guard.canActivate(contextFor({ path: "/health" }))).toBe(true);
    expect(guard.canActivate(contextFor({ path: "/health/db" }))).toBe(true);
  });

  it("limits general API routes by client key", () => {
    const guard = new RateLimitGuard(config);
    const firstRequest = contextFor({
      headers: { "x-forwarded-for": "10.0.0.1" },
      path: "/library",
    });
    const secondRequest = contextFor({
      headers: { "x-forwarded-for": "10.0.0.1" },
      path: "/users/me",
    });
    const thirdRequest = contextFor({
      headers: { "x-forwarded-for": "10.0.0.1" },
      path: "/library",
    });

    expect(guard.canActivate(firstRequest)).toBe(true);
    expect(guard.canActivate(secondRequest)).toBe(true);
    expect(() => guard.canActivate(thirdRequest)).toThrow(HttpException);
  });

  it("uses the stricter provider limit for catalog-provider routes", () => {
    const guard = new RateLimitGuard(config);
    const firstRequest = contextFor({
      headers: { authorization: "Bearer token-a" },
      path: "/search",
    });
    const secondRequest = contextFor({
      headers: { authorization: "Bearer token-a" },
      path: "/catalog/resolve",
    });

    expect(guard.canActivate(firstRequest)).toBe(true);
    expect(() => guard.canActivate(secondRequest)).toThrow(HttpException);
  });

  it("resets the bucket after the configured window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);

    const guard = new RateLimitGuard(config);
    const request = {
      headers: { authorization: "Bearer token-a" },
      path: "/search",
    };

    expect(guard.canActivate(contextFor(request))).toBe(true);
    expect(() => guard.canActivate(contextFor(request))).toThrow(HttpException);

    vi.setSystemTime(2100);

    expect(guard.canActivate(contextFor(request))).toBe(true);
  });

  it("returns a 429 status when the limit is reached", () => {
    const guard = new RateLimitGuard(config);
    const request = {
      headers: { authorization: "Bearer token-a" },
      path: "/search",
    };

    guard.canActivate(contextFor(request));

    try {
      guard.canActivate(contextFor(request));
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      return;
    }

    throw new Error("Expected the request to be rate limited");
  });

  it("sets rate limit headers", () => {
    const guard = new RateLimitGuard(config);
    const response = createResponse();

    guard.canActivate(contextFor({
      headers: { authorization: "Bearer token-a" },
      path: "/search",
    }, response));

    expect(response.header).toHaveBeenCalledWith("x-ratelimit-limit", "1");
    expect(response.header).toHaveBeenCalledWith("x-ratelimit-remaining", "0");
    expect(response.header).toHaveBeenCalledWith("x-ratelimit-reset", expect.any(String));
    expect(response.header).toHaveBeenCalledWith("retry-after", expect.any(String));
  });
});

function contextFor(
  request: {
    headers?: Record<string, string | string[] | undefined>;
    method?: string;
    path: string;
  },
  response = createResponse(),
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: request.headers ?? {},
        method: request.method ?? "GET",
        path: request.path,
      }),
      getResponse: () => response,
      getNext: vi.fn(),
    }),
  } as unknown as ExecutionContext;
}

function createResponse() {
  return {
    header: vi.fn(),
  };
}
