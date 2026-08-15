import { apiBaseUrl } from "../config/env";
import type { MediaType } from "./types";

const readCacheTtlMs = 5 * 60 * 1000;
const maxReadCacheEntries = 100;

type ReadCacheEntry = {
  expiresAt: number;
  value: unknown;
};

const readCache = new Map<string, ReadCacheEntry>();

export async function fetchJson<T>(
  path: string,
  guard: (value: unknown) => value is T,
  errorMessage: string,
  options?: RequestInit,
) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  const body: unknown = await response.json();

  if (!response.ok || !guard(body)) {
    throw new Error(errorMessage);
  }

  return body;
}

export async function fetchCachedJson<T>(
  path: string,
  guard: (value: unknown) => value is T,
  errorMessage: string,
  options?: RequestInit,
  ttlMs = readCacheTtlMs,
) {
  const cacheKey = getReadCacheKey(path, options?.headers);
  const now = Date.now();
  const cached = readCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  if (cached) {
    readCache.delete(cacheKey);
  }

  const body = await fetchJson(path, guard, errorMessage, options);

  pruneReadCache(now);
  if (readCache.size >= maxReadCacheEntries) {
    const oldestKey = readCache.keys().next().value;

    if (oldestKey) {
      readCache.delete(oldestKey);
    }
  }

  readCache.set(cacheKey, { expiresAt: now + ttlMs, value: body });

  return body;
}

export async function fetchMutationJson<T>(
  path: string,
  guard: (value: unknown) => value is T,
  errorMessage: string,
  options?: RequestInit,
) {
  const body = await fetchJson(path, guard, errorMessage, options);

  clearApiReadCache();

  return body;
}

export function clearApiReadCache() {
  readCache.clear();
}

export function getAuthHeaders(accessToken: string | null) {
  if (!accessToken) {
    throw new Error("Sign in required");
  }

  return { Authorization: `Bearer ${accessToken}` };
}

export function getMediaPath(mediaType: MediaType, id: string) {
  return mediaType === "show" ? `shows/${id}` : `movies/${id}`;
}

function getReadCacheKey(path: string, headers?: HeadersInit) {
  const authorization = getHeaderValue(headers, "authorization");

  return `${path}:auth=${authorization ? hashString(authorization) : "none"}`;
}

function getHeaderValue(headers: HeadersInit | undefined, headerName: string) {
  if (!headers) {
    return null;
  }

  const target = headerName.toLowerCase();

  if (Array.isArray(headers)) {
    return headers.find(([key]) => key.toLowerCase() === target)?.[1] ?? null;
  }

  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get(headerName);
  }

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) {
      return String(value);
    }
  }

  return null;
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function pruneReadCache(now: number) {
  for (const [key, entry] of readCache.entries()) {
    if (entry.expiresAt <= now) {
      readCache.delete(key);
    }
  }
}
