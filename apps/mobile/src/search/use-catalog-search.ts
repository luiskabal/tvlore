import { useCallback, useRef, useState } from "react";

import {
  resolveCatalogItem,
  searchCatalog,
  type CatalogResolveResponse,
  type CatalogSearchResult,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { prefetchCatalogDetails } from "../catalog/prefetch";
import { getMediaTypes, getResultKey, minSearchLength, type SearchFilter } from "./search-model";

export { getResultKey, minSearchLength };
export type { SearchFilter };

export type SearchState =
  | { kind: "idle" }
  | { kind: "loading"; query: string }
  | { kind: "loadingMore"; nextPage: number | null; query: string; results: CatalogSearchResult[] }
  | { kind: "refreshing"; nextPage: number | null; query: string; results: CatalogSearchResult[] }
  | { kind: "ready"; loadMoreError?: string; nextPage: number | null; query: string; results: CatalogSearchResult[] }
  | { kind: "error"; message: string };

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
        return { kind: "refreshing", nextPage: current.nextPage, query, results: current.results };
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

      setSearch({ kind: "ready", nextPage: response.nextPage, query: response.query, results: response.results });
      prefetchResolvedResults(response.results, token);
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

  const loadMore = useCallback(async (filter: SearchFilter) => {
    if (search.kind !== "ready" || !search.nextPage || search.results.length === 0) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const currentQuery = search.query;
    const currentResults = search.results;
    const nextPage = search.nextPage;

    setSearch({ kind: "loadingMore", nextPage, query: currentQuery, results: currentResults });

    try {
      const token = await getSupabaseAccessToken();
      const response = await searchCatalog(token, currentQuery, getMediaTypes(filter), nextPage);

      if (requestIdRef.current !== requestId) {
        return;
      }

      const results = mergeResults(currentResults, response.results);

      setSearch({ kind: "ready", nextPage: response.nextPage, query: response.query, results });
      prefetchResolvedResults(response.results, token);
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setSearch({
        kind: "ready",
        loadMoreError: error instanceof Error ? error.message : "Could not load more results",
        nextPage,
        query: currentQuery,
        results: currentResults,
      });
    }
  }, [search]);

  const resolveResult = useCallback(async (result: CatalogSearchResult) => {
    const resultKey = getResultKey(result);
    setResolveState({ kind: "loading", resultKey });

    try {
      const token = await getSupabaseAccessToken();
      const item = await resolveCatalogItem(token, result);
      void prefetchCatalogDetails([{ id: item.id, mediaType: item.mediaType }], { accessToken: token });
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

  return { loadMore, resolveResult, resolveState, runSearch, search };
}

function prefetchResolvedResults(results: CatalogSearchResult[], accessToken: string | null) {
  void prefetchCatalogDetails(
    results
      .filter((result): result is CatalogSearchResult & { tvloreId: string } => Boolean(result.tvloreId))
      .map((result) => ({ id: result.tvloreId, mediaType: result.mediaType })),
    { accessToken },
  );
}

function mergeResults(current: CatalogSearchResult[], incoming: CatalogSearchResult[]) {
  const keys = new Set(current.map(getResultKey));
  const merged = [...current];

  incoming.forEach((result) => {
    const key = getResultKey(result);

    if (!keys.has(key)) {
      keys.add(key);
      merged.push(result);
    }
  });

  return merged;
}
