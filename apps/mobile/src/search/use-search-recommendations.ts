import { useCallback, useEffect, useState } from "react";

import { getRecommendations, type RecommendationsResponse } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { useLibraryRevision } from "../library/library-refresh";

export type SearchRecommendationsState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; recommendations: RecommendationsResponse | null }
  | { kind: "error"; message: string };

export function useSearchRecommendations() {
  const [recommendationsState, setRecommendationsState] = useState<SearchRecommendationsState>({ kind: "idle" });
  const libraryRevision = useLibraryRevision();

  const loadRecommendations = useCallback(async () => {
    setRecommendationsState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      if (!token) {
        setRecommendationsState({ kind: "ready", recommendations: null });
        return;
      }

      const recommendations = await getRecommendations(token);

      setRecommendationsState({ kind: "ready", recommendations });
    } catch (error) {
      setRecommendationsState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load recommendations",
      });
    }
  }, []);

  useEffect(() => {
    void loadRecommendations();
  }, [libraryRevision, loadRecommendations]);

  return {
    recommendations: recommendationsState.kind === "ready" ? recommendationsState.recommendations : null,
    recommendationsState,
    retryRecommendations: loadRecommendations,
  };
}
