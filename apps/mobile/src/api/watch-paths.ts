import { fetchCachedJson, fetchMutationJson, getAuthHeaders } from "./client";
import { isWatchPathDetailResponse, isWatchPathsResponse, isWatchPathWatchlistResponse } from "./guards";
import type {
  CreateWatchPathInput,
  ImportTmdbCollectionInput,
  WatchPathDetailResponse,
  WatchPathsResponse,
  WatchPathWatchlistResponse,
} from "./types";

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

export async function createWatchPath(
  accessToken: string | null,
  input: CreateWatchPathInput,
): Promise<WatchPathDetailResponse> {
  return fetchMutationJson(
    "/watch-paths",
    isWatchPathDetailResponse,
    "Unexpected create watch path response",
    {
      body: JSON.stringify(input),
      headers: {
        ...getAuthHeaders(accessToken),
        "content-type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function importTmdbCollectionWatchPath(
  accessToken: string | null,
  input: ImportTmdbCollectionInput,
): Promise<WatchPathDetailResponse> {
  return fetchMutationJson(
    "/watch-paths/imports/tmdb-collection",
    isWatchPathDetailResponse,
    "Unexpected TMDB collection import response",
    {
      body: JSON.stringify(input),
      headers: {
        ...getAuthHeaders(accessToken),
        "content-type": "application/json",
      },
      method: "POST",
    },
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
