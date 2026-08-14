import { fetchJson, getAuthHeaders, getMediaPath } from "./client";
import { isWatchlistMutationResponse } from "./guards";
import type { MediaType, WatchlistMutationResponse } from "./types";

export async function addToWatchlist(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<WatchlistMutationResponse> {
  return fetchJson(
    `/${getMediaPath(mediaType, id)}/watchlist`,
    isWatchlistMutationResponse,
    "Unexpected watchlist response",
    {
      headers: getAuthHeaders(accessToken),
      method: "POST",
    },
  );
}

export async function removeFromWatchlist(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<WatchlistMutationResponse> {
  return fetchJson(
    `/${getMediaPath(mediaType, id)}/watchlist`,
    isWatchlistMutationResponse,
    "Unexpected watchlist response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}
