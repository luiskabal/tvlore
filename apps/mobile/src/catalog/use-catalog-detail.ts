import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

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
    const previousDetail = state.kind === "ready" && state.detail.mediaType === "movie" && state.detail.id === movieId
      ? state.detail
      : null;

    setWatchAction({ kind: "loading" });
    setState((current) => {
      if (current.kind !== "ready" || current.detail.mediaType !== "movie" || current.detail.id !== movieId) {
        return current;
      }

      return {
        detail: {
          ...current.detail,
          lastWatchedAt: watched ? new Date().toISOString() : null,
          watchCount: getOptimisticWatchCount(current.detail.watchCount, current.detail.watched, watched),
          watched,
        },
        kind: "ready",
      };
    });

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
      rollbackDetail(previousDetail, setState);
      setWatchAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Watch update failed",
      });
    }
  }, [state]);

  const setInWatchlist = useCallback(async (targetMediaType: MediaType, targetId: string, inWatchlist: boolean) => {
    const previousDetail = state.kind === "ready" && state.detail.id === targetId && state.detail.mediaType === targetMediaType
      ? state.detail
      : null;

    setWatchlistAction({ kind: "loading" });
    setState((current) => {
      if (current.kind !== "ready" || current.detail.id !== targetId || current.detail.mediaType !== targetMediaType) {
        return current;
      }

      return {
        detail: {
          ...current.detail,
          inWatchlist,
        },
        kind: "ready",
      };
    });

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
      rollbackDetail(previousDetail, setState);
      setWatchlistAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Watchlist update failed",
      });
    }
  }, [state]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, setInWatchlist, setMovieWatched, state, watchAction, watchlistAction };
}

function getOptimisticWatchCount(currentCount: number, currentWatched: boolean, nextWatched: boolean) {
  if (currentWatched === nextWatched) {
    return currentCount;
  }

  return Math.max(0, currentCount + (nextWatched ? 1 : -1));
}

function rollbackDetail(
  previousDetail: CatalogDetailResponse | null,
  setState: Dispatch<SetStateAction<CatalogDetailState>>,
) {
  if (!previousDetail) {
    return;
  }

  setState((current) => {
    if (current.kind !== "ready" || current.detail.id !== previousDetail.id || current.detail.mediaType !== previousDetail.mediaType) {
      return current;
    }

    return { detail: previousDetail, kind: "ready" };
  });
}
