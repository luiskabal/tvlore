import { useCallback, useRef, useState } from "react";

import {
  resolveCatalogItem,
  searchCatalog,
  type CatalogResolveResponse,
  type CatalogSearchResult,
  type MediaType,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";

export type SearchFilter = "all" | MediaType;

export type SearchState =
  | { kind: "idle" }
  | { kind: "loading"; query: string }
  | { kind: "refreshing"; query: string; results: CatalogSearchResult[] }
  | { kind: "ready"; query: string; results: CatalogSearchResult[] }
  | { kind: "error"; message: string };

export const minSearchLength = 3;

export type ResolveState =
  | { kind: "idle" }
  | { kind: "loading"; resultKey: string }
  | { item: CatalogResolveResponse; kind: "resolved"; resultKey: string; title: string }
  | { kind: "error"; message: string; resultKey: string };

type RunSearchOptions = {
  keepResults?: boolean;
};

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

export function getResultKey(result: CatalogSearchResult) {
  return `${result.mediaType}-${result.externalRef.provider}-${result.externalRef.providerId}`;
}

function getMediaTypes(filter: SearchFilter): MediaType[] {
  return filter === "all" ? ["show", "movie"] : [filter];
}
