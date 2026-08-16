import { useCallback, useRef, useState } from "react";

import {
  getCatalogDetail,
  resolveCatalogItem,
  searchCatalog,
  type CatalogResolveResponse,
  type CatalogSearchResult,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { getMediaTypes, getResultKey, minSearchLength, type SearchFilter } from "./search-model";

export { getResultKey, minSearchLength };
export type { SearchFilter };

export type SearchState =
  | { kind: "idle" }
  | { kind: "loading"; query: string }
  | { kind: "refreshing"; query: string; results: CatalogSearchResult[] }
  | { kind: "ready"; query: string; results: CatalogSearchResult[] }
  | { kind: "error"; message: string };

export type ResolveState =
  | { kind: "idle" }
  | { kind: "loading"; resultKey: string }
  | { item: CatalogResolveResponse; kind: "resolved"; resultKey: string; title: string }
  | { kind: "error"; message: string; resultKey: string };

type RunSearchOptions = {
  keepResults?: boolean;
};

const detailPrefetchLimit = 4;

export function useCatalogSearch() {
  const [search, setSearch] = useState<SearchState>({ kind: "idle" });
  const [resolveState, setResolveState] = useState<ResolveState>({ kind: "idle" });
  const requestIdRef = useRef(0);

  const runSearch = useCallback(async (rawQuery: string, filter: SearchFilter, options: RunSearchOptions = {}) => {
    const query = rawQuery.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const keepResults = options.keepResults ?? true;

    if (query.length < minSearchLength) {
      setSearch({ kind: "idle" });
      return;
    }

    setSearch((current) => {
      if (keepResults && (current.kind === "ready" || current.kind === "refreshing") && current.results.length > 0) {
        return { kind: "refreshing", query, results: current.results };
      }

      return { kind: "loading", query };
    });
    setResolveState({ kind: "idle" });

    try {
      const token = await getSupabaseAccessToken();
      const response = await searchCatalog(token, query, getMediaTypes(filter));

      if (requestIdRef.current !== requestId) {
        return;
      }

      setSearch({ kind: "ready", query: response.query, results: response.results });
      prefetchResolvedDetails(token, response.results);
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setSearch({
        kind: "error",
        message: error instanceof Error ? error.message : "Search failed",
      });
    }
  }, []);

  const resolveResult = useCallback(async (result: CatalogSearchResult) => {
    const resultKey = getResultKey(result);
    setResolveState({ kind: "loading", resultKey });

    try {
      const token = await getSupabaseAccessToken();
      const item = await resolveCatalogItem(token, result);
      void getCatalogDetail(token, item.mediaType, item.id).catch(() => undefined);
      setResolveState({ item, kind: "resolved", resultKey, title: result.title });
      return item;
    } catch (error) {
      setResolveState({
        kind: "error",
        message: error instanceof Error ? error.message : "Resolve failed",
        resultKey,
      });
      return null;
    }
  }, []);

  return { resolveResult, resolveState, runSearch, search };
}

function prefetchResolvedDetails(accessToken: string | null, results: CatalogSearchResult[]) {
  for (const result of results.slice(0, detailPrefetchLimit)) {
    if (!result.tvloreId) {
      continue;
    }

    void getCatalogDetail(accessToken, result.mediaType, result.tvloreId).catch(() => undefined);
  }
}
