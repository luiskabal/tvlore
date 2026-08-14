import { useCallback, useState } from "react";

import { addToWatchlist, type RecommendationItem } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { notifyLibraryChanged } from "../library/library-refresh";

export type RecommendationActionState =
  | { kind: "idle" }
  | { actionKey: string; kind: "loading" }
  | { actionKey: string; kind: "error"; message: string };

export function useRecommendationActions() {
  const [recommendationAction, setRecommendationAction] = useState<RecommendationActionState>({ kind: "idle" });

  const saveRecommendation = useCallback(async (item: RecommendationItem) => {
    const actionKey = getRecommendationActionKey(item);

    setRecommendationAction({ actionKey, kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      await addToWatchlist(token, item.mediaType, item.id);
      notifyLibraryChanged();
      setRecommendationAction({ kind: "idle" });
    } catch (error) {
      setRecommendationAction({
        actionKey,
        kind: "error",
        message: error instanceof Error ? error.message : "Could not save recommendation",
      });
      throw error;
    }
  }, []);

  return { recommendationAction, saveRecommendation };
}

export function getRecommendationActionKey(item: Pick<RecommendationItem, "id" | "mediaType">) {
  return `recommendation:${item.mediaType}:${item.id}`;
}
