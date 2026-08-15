import { useCallback, useEffect, useRef, useState } from "react";

import { getLibraryChronology, type RecentlyWatchedItem } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { mergeChronologyItems } from "./chronology-items";
import { useLibraryRevision } from "./library-refresh";

const chronologyPageSize = 20;

export type LibraryChronologyState = {
  items: RecentlyWatchedItem[];
  kind: "idle" | "loading" | "ready" | "loadingMore" | "error";
  message?: string;
  nextCursor: string | null;
};

const initialState: LibraryChronologyState = {
  items: [],
  kind: "idle",
  nextCursor: null,
};

export function useLibraryChronology() {
  const [chronology, setChronology] = useState<LibraryChronologyState>(initialState);
  const hasLoadedRef = useRef(false);
  const libraryRevision = useLibraryRevision();

  const loadInitialChronology = useCallback(async () => {
    hasLoadedRef.current = true;
    setChronology((current) => ({
      items: current.items,
      kind: "loading",
      nextCursor: current.nextCursor,
    }));

    try {
      const token = await getSupabaseAccessToken();
      const response = await getLibraryChronology(token, { limit: chronologyPageSize });

      setChronology({
        items: response.items,
        kind: "ready",
        nextCursor: response.nextCursor,
      });
    } catch (error) {
      setChronology((current) => ({
        items: current.items,
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load chronology",
        nextCursor: current.nextCursor,
      }));
    }
  }, []);

  const loadMoreChronology = useCallback(async () => {
    if (!chronology.nextCursor || chronology.kind === "loading" || chronology.kind === "loadingMore") {
      return;
    }

    setChronology((current) => ({ ...current, kind: "loadingMore" }));

    try {
      const token = await getSupabaseAccessToken();
      const response = await getLibraryChronology(token, {
        cursor: chronology.nextCursor,
        limit: chronologyPageSize,
      });

      setChronology({
        items: mergeChronologyItems(chronology.items, response.items),
        kind: "ready",
        nextCursor: response.nextCursor,
      });
    } catch (error) {
      setChronology((current) => ({
        items: current.items,
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load more chronology",
        nextCursor: current.nextCursor,
      }));
    }
  }, [chronology]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    void loadInitialChronology();
  }, [libraryRevision, loadInitialChronology]);

  return { chronology, loadInitialChronology, loadMoreChronology };
}
