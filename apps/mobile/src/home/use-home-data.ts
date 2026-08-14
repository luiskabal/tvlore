import { useCallback, useState } from "react";

import { getHomeData, type LibraryResponse, type RecommendationsResponse, type UserResponse } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";

export type HomeReadyState = {
  kind: "ready";
  library: LibraryResponse | null;
  recommendations: RecommendationsResponse | null;
  user: UserResponse | null;
};

export type HomeState =
  | { kind: "loading" }
  | HomeReadyState
  | { kind: "refreshing"; library: LibraryResponse | null; recommendations: RecommendationsResponse | null; user: UserResponse | null }
  | { kind: "offline"; message: string };

export function useHomeData(options: { includeRecommendations?: boolean } = {}) {
  const [home, setHome] = useState<HomeState>({ kind: "loading" });
  const includeRecommendations = options.includeRecommendations ?? true;

  const refreshHome = useCallback(async () => {
    setHome((current) => (
      current.kind === "ready" || current.kind === "refreshing"
        ? { ...current, kind: "refreshing" }
        : { kind: "loading" }
    ));

    try {
      const token = await getSupabaseAccessToken();
      const homeData = await getHomeData(token, { includeRecommendations });

      setHome({ kind: "ready", ...homeData });
    } catch (error) {
      setHome({
        kind: "offline",
        message: error instanceof Error ? error.message : "Unknown API error",
      });
    }
  }, [includeRecommendations]);

  return { home, refreshHome };
}
