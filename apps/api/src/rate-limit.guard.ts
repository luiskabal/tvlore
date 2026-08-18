import { createHash } from "node:crypto";
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";

import { getBearerToken } from "./auth/bearer-token";
import { API_CONFIG, type ApiConfig, type RateLimitConfig } from "./config";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitRequest = {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  method?: string;
  originalUrl?: string;
  path?: string;
  socket?: {
    remoteAddress?: string;
  };
  url?: string;
};

type RateLimitResponse = {
  header(name: string, value: string): void;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  // ponytail: in-memory per Vercel instance; use shared Redis if multi-instance precision matters.
  private readonly buckets = new Map<string, Bucket>();
  private requestCount = 0;

  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<RateLimitRequest>();
    const response = http.getResponse<RateLimitResponse>();
    const path = getRequestPath(request);
    const method = (request.method ?? "GET").toUpperCase();

    if (method === "OPTIONS" || isPublicHealthPath(path)) {
      return true;
    }

    const profile = isProviderCostRoute(method, path) ? this.config.rateLimit.provider : this.config.rateLimit.api;
    const key = `${isProviderCostRoute(method, path) ? "provider" : "api"}:${getClientKey(request)}`;
    const now = Date.now();
    const bucket = this.getBucket(key, profile, now);

    this.cleanupExpiredBuckets(now);

    if (bucket.count >= profile.maxRequests) {
      setRateLimitHeaders(response, profile, bucket, 0);
      throw new HttpException({
        code: "RATE_LIMITED",
        details: {
          retryAfterSeconds: getRetryAfterSeconds(bucket.resetAt, now),
        },
        message: "Too many requests, try again later",
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
    setRateLimitHeaders(response, profile, bucket, profile.maxRequests - bucket.count);

    return true;
  }

  private getBucket(key: string, profile: RateLimitConfig, now: number) {
    const existingBucket = this.buckets.get(key);

    if (!existingBucket || existingBucket.resetAt <= now) {
      const newBucket = {
        count: 0,
        resetAt: now + profile.windowMs,
      };

      this.buckets.set(key, newBucket);

      return newBucket;
    }

    return existingBucket;
  }

  private cleanupExpiredBuckets(now: number) {
    this.requestCount += 1;

    if (this.requestCount % 500 !== 0) {
      return;
    }

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}

function getRequestPath(request: RateLimitRequest) {
  return (request.path ?? request.url ?? request.originalUrl ?? "/").split("?")[0] ?? "/";
}

function isPublicHealthPath(path: string) {
  return path === "/" || path === "/health" || path.startsWith("/health/");
}

function isProviderCostRoute(method: string, path: string) {
  return path === "/search"
    || path === "/catalog/resolve"
    || path === "/recommendations"
    || path === "/discovery/popular"
    || path === "/discovery/available"
    || path.endsWith("/cast")
    || path.includes("/watch-providers")
    || (method === "GET" && /^\/shows\/[^/]+\/seasons\/[^/]+$/.test(path))
    || (method === "POST" && path === "/watch-paths")
    || (method === "POST" && path === "/watch-paths/imports/tmdb-collection")
    || (method === "POST" && /^\/watch-paths\/[^/]+\/watchlist$/.test(path));
}

function getClientKey(request: RateLimitRequest) {
  const token = getBearerToken(toSingleHeader(request.headers.authorization));

  if (token) {
    return `token:${createHash("sha256").update(token).digest("hex").slice(0, 32)}`;
  }

  return `ip:${getClientIp(request)}`;
}

function getClientIp(request: RateLimitRequest) {
  const forwardedFor = toSingleHeader(request.headers["x-forwarded-for"]);
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return firstForwardedIp || request.ip || request.socket?.remoteAddress || "unknown";
}

function toSingleHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function setRateLimitHeaders(
  response: RateLimitResponse,
  profile: RateLimitConfig,
  bucket: Bucket,
  remaining: number,
) {
  const now = Date.now();
  const retryAfterSeconds = getRetryAfterSeconds(bucket.resetAt, now);

  response.header("x-ratelimit-limit", String(profile.maxRequests));
  response.header("x-ratelimit-remaining", String(Math.max(0, remaining)));
  response.header("x-ratelimit-reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (remaining === 0) {
    response.header("retry-after", String(retryAfterSeconds));
  }
}

function getRetryAfterSeconds(resetAt: number, now: number) {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}
