import { useCallback, useEffect, useState } from "react";

import {
  addToWatchlist,
  getCatalogDetail,
  markMovieWatched,
  removeFromWatchlist,
  unmarkMovieWatched,
  type CatalogDetailResponse,
  type MediaType,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { notifyLibraryChanged } from "../library/library-refresh";

export type CatalogDetailState =
  | { kind: "loading" }
  | { detail: CatalogDetailResponse; kind: "ready" }
  | { kind: "error"; message: string };

export type WatchActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export type WatchlistActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export function useCatalogDetail(mediaType: MediaType, id: string | null) {
  const [state, setState] = useState<CatalogDetailState>({ kind: "loading" });
  const [watchAction, setWatchAction] = useState<WatchActionState>({ kind: "idle" });
  const [watchlistAction, setWatchlistAction] = useState<WatchlistActionState>({ kind: "idle" });

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
      setWatchAction({ kind: "idle" });
      setWatchlistAction({ kind: "idle" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Detail failed",
      });
    }
  }, [id, mediaType]);

  const setMovieWatched = useCallback(async (movieId: string, watched: boolean) => {
    setWatchAction({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const response = watched
        ? await markMovieWatched(token, movieId)
        : await unmarkMovieWatched(token, movieId);

      setState((current) => {
        if (current.kind !== "ready" || current.detail.mediaType !== "movie" || current.detail.id !== movieId) {
          return current;
        }

        return {
          detail: {
            ...current.detail,
            lastWatchedAt: response.lastWatchedAt,
            watchCount: response.watchCount,
            watched: response.watched,
          },
          kind: "ready",
        };
      });
      notifyLibraryChanged();
      setWatchAction({ kind: "idle" });
    } catch (error) {
      setWatchAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Watch update failed",
      });
    }
  }, []);

  const setInWatchlist = useCallback(async (targetMediaType: MediaType, targetId: string, inWatchlist: boolean) => {
    setWatchlistAction({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const response = inWatchlist
        ? await addToWatchlist(token, targetMediaType, targetId)
        : await removeFromWatchlist(token, targetMediaType, targetId);

      setState((current) => {
        if (
          current.kind !== "ready" ||
          current.detail.id !== response.id ||
          current.detail.mediaType !== response.mediaType
        ) {
          return current;
        }

        return {
          detail: {
            ...current.detail,
            inWatchlist: response.inWatchlist,
          },
          kind: "ready",
        };
      });
      notifyLibraryChanged();
      setWatchlistAction({ kind: "idle" });
    } catch (error) {
      setWatchlistAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Watchlist update failed",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, setInWatchlist, setMovieWatched, state, watchAction, watchlistAction };
}
