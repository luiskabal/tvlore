import { useCallback, useEffect, useState } from "react";

import { getAvailableDiscovery, type AvailableDiscoveryResponse } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { prefetchCatalogDetails } from "../catalog/prefetch";
import { useLibraryRevision } from "../library/library-refresh";

export type AvailableDiscoveryState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { discovery: AvailableDiscoveryResponse | null; kind: "ready" }
  | { kind: "error"; message: string };

export function useAvailableDiscovery() {
  const [availableState, setAvailableState] = useState<AvailableDiscoveryState>({ kind: "idle" });
  const libraryRevision = useLibraryRevision();

  const loadAvailableDiscovery = useCallback(async () => {
    setAvailableState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      if (!token) {
        setAvailableState({ discovery: null, kind: "ready" });
        return;
      }

      const discovery = await getAvailableDiscovery(token);

      setAvailableState({ discovery, kind: "ready" });
      void prefetchCatalogDetails(
        discovery.items.map((item) => ({ id: item.tvloreId, mediaType: item.mediaType })),
        { accessToken: token },
      );
    } catch (error) {
      setAvailableState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load streamable titles",
      });
    }
  }, []);

  useEffect(() => {
    void loadAvailableDiscovery();
  }, [libraryRevision, loadAvailableDiscovery]);

  return {
    available: availableState.kind === "ready" ? availableState.discovery : null,
    availableState,
    retryAvailable: loadAvailableDiscovery,
  };
}
