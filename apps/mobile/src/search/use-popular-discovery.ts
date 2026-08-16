import { useCallback, useEffect, useState } from "react";

import { getPopularDiscovery, type PopularDiscoveryResponse } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { prefetchCatalogDetails } from "../catalog/prefetch";
import { useLibraryRevision } from "../library/library-refresh";

export type PopularDiscoveryState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { discovery: PopularDiscoveryResponse | null; kind: "ready" }
  | { kind: "error"; message: string };

export function usePopularDiscovery() {
  const [popularState, setPopularState] = useState<PopularDiscoveryState>({ kind: "idle" });
  const libraryRevision = useLibraryRevision();

  const loadPopularDiscovery = useCallback(async () => {
    setPopularState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      if (!token) {
        setPopularState({ discovery: null, kind: "ready" });
        return;
      }

      const discovery = await getPopularDiscovery(token);

      setPopularState({ discovery, kind: "ready" });
      void prefetchCatalogDetails(
        discovery.items.map((item) => ({ id: item.tvloreId, mediaType: item.mediaType })),
        { accessToken: token },
      );
    } catch (error) {
      setPopularState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load popular titles",
      });
    }
  }, []);

  useEffect(() => {
    void loadPopularDiscovery();
  }, [libraryRevision, loadPopularDiscovery]);

  return {
    popular: popularState.kind === "ready" ? popularState.discovery : null,
    popularState,
    retryPopular: loadPopularDiscovery,
  };
}
