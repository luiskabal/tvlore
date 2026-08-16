import { fetchCachedJson, getAuthHeaders } from "./client";
import { isPopularDiscoveryResponse } from "./guards";
import type { PopularDiscoveryResponse } from "./types";

export async function getPopularDiscovery(accessToken: string | null): Promise<PopularDiscoveryResponse> {
  return fetchCachedJson(
    "/discovery/popular",
    isPopularDiscoveryResponse,
    "Unexpected popular discovery response",
    { headers: getAuthHeaders(accessToken) },
  );
}
