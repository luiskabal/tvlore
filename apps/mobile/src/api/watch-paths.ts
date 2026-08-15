import { fetchCachedJson, getAuthHeaders } from "./client";
import { isWatchPathDetailResponse, isWatchPathsResponse } from "./guards";
import type { WatchPathDetailResponse, WatchPathsResponse } from "./types";

export async function getWatchPaths(accessToken: string | null): Promise<WatchPathsResponse> {
  return fetchCachedJson(
    "/watch-paths",
    isWatchPathsResponse,
    "Unexpected watch paths response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function getWatchPath(accessToken: string | null, pathId: string): Promise<WatchPathDetailResponse> {
  return fetchCachedJson(
    `/watch-paths/${pathId}`,
    isWatchPathDetailResponse,
    "Unexpected watch path response",
    { headers: getAuthHeaders(accessToken) },
  );
}
