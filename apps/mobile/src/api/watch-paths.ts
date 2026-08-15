import { fetchCachedJson, fetchMutationJson, getAuthHeaders } from "./client";
import { isWatchPathDetailResponse, isWatchPathsResponse, isWatchPathWatchlistResponse } from "./guards";
import type { WatchPathDetailResponse, WatchPathsResponse, WatchPathWatchlistResponse } from "./types";

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

export async function saveWatchPathToWatchlist(
  accessToken: string | null,
  pathId: string,
): Promise<WatchPathWatchlistResponse> {
  return fetchMutationJson(
    `/watch-paths/${pathId}/watchlist`,
    isWatchPathWatchlistResponse,
    "Unexpected watch path watchlist response",
    {
      headers: getAuthHeaders(accessToken),
      method: "POST",
    },
  );
}
