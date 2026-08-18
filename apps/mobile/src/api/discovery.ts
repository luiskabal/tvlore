import { fetchCachedJson, getAuthHeaders } from "./client";
import { isAvailableDiscoveryResponse, isPopularDiscoveryResponse, isTvlorePicksDiscoveryResponse } from "./guards";
import type { AvailableDiscoveryResponse, PopularDiscoveryResponse, TvlorePicksDiscoveryResponse } from "./types";

export async function getPopularDiscovery(accessToken: string | null): Promise<PopularDiscoveryResponse> {
  return fetchCachedJson(
    "/discovery/popular",
    isPopularDiscoveryResponse,
    "Unexpected popular discovery response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function getAvailableDiscovery(accessToken: string | null): Promise<AvailableDiscoveryResponse> {
  return fetchCachedJson(
    "/discovery/available",
    isAvailableDiscoveryResponse,
    "Unexpected available discovery response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function getTvlorePicksDiscovery(accessToken: string | null): Promise<TvlorePicksDiscoveryResponse> {
  return fetchCachedJson(
    "/discovery/picks",
    isTvlorePicksDiscoveryResponse,
    "Unexpected TVLore picks response",
    { headers: getAuthHeaders(accessToken) },
  );
}
