import { fetchCachedJson, getAuthHeaders } from "./client";
import { isRecommendationsResponse } from "./guards";
import type { RecommendationsResponse } from "./types";

export async function getRecommendations(accessToken: string | null): Promise<RecommendationsResponse> {
  return fetchCachedJson(
    "/recommendations",
    isRecommendationsResponse,
    "Unexpected recommendations response",
    { headers: getAuthHeaders(accessToken) },
  );
}
