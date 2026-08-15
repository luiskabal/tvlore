import { fetchJson, getAuthHeaders } from "./client";
import { isLibraryResponse, isRecommendationsResponse } from "./guards";
import type { HomeData } from "./types";
import { getCurrentUser } from "./users";

export async function getHomeData(
  accessToken: string | null,
  options: { includeRecommendations?: boolean } = {},
): Promise<HomeData> {
  if (!accessToken) {
    return { library: null, recommendations: null, user: null };
  }

  const includeRecommendations = options.includeRecommendations ?? true;
  const authOptions = { headers: getAuthHeaders(accessToken) };
  const [user, library, recommendations] = await Promise.all([
    getCurrentUser(accessToken),
    fetchJson(
      "/library",
      isLibraryResponse,
      "Unexpected library response",
      authOptions,
    ),
    includeRecommendations
      ? fetchJson(
        "/recommendations",
        isRecommendationsResponse,
        "Unexpected recommendations response",
        authOptions,
      )
      : Promise.resolve(null),
  ]);

  return { library, recommendations, user };
}
