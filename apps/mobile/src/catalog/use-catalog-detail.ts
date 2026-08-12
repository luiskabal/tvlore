import { useCallback, useEffect, useState } from "react";

import { getCatalogDetail, type CatalogDetailResponse, type MediaType } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";

export type CatalogDetailState =
  | { kind: "loading" }
  | { detail: CatalogDetailResponse; kind: "ready" }
  | { kind: "error"; message: string };

export function useCatalogDetail(mediaType: MediaType, id: string | null) {
  const [state, setState] = useState<CatalogDetailState>({ kind: "loading" });

  const refresh = useCallback(async () => {
    if (!id) {
      setState({ kind: "error", message: "Missing catalog ID" });
      return;
    }

    setState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const detail = await getCatalogDetail(token, mediaType, id);
      setState({ detail, kind: "ready" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Detail failed",
      });
    }
  }, [id, mediaType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, state };
}
