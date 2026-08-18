import { useCallback, useEffect, useState } from "react";

import { getTvlorePicksDiscovery, type TvlorePicksDiscoveryResponse } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { prefetchCatalogDetails } from "../catalog/prefetch";
import { useLibraryRevision } from "../library/library-refresh";

export type TvlorePicksState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; picks: TvlorePicksDiscoveryResponse | null }
  | { kind: "error"; message: string };

export function useTvlorePicks() {
  const [picksState, setPicksState] = useState<TvlorePicksState>({ kind: "idle" });
  const libraryRevision = useLibraryRevision();

  const loadPicks = useCallback(async () => {
    setPicksState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      if (!token) {
        setPicksState({ kind: "ready", picks: null });
        return;
      }

      const picks = await getTvlorePicksDiscovery(token);

      setPicksState({ kind: "ready", picks });
      void prefetchCatalogDetails(
        picks.items.map((item) => ({ id: item.tvloreId, mediaType: item.mediaType })),
        { accessToken: token },
      );
    } catch (error) {
      setPicksState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load TVLore picks",
      });
    }
  }, []);

  useEffect(() => {
    void loadPicks();
  }, [libraryRevision, loadPicks]);

  return {
    picks: picksState.kind === "ready" ? picksState.picks : null,
    picksState,
    retryPicks: loadPicks,
  };
}
