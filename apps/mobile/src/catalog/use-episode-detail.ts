import { useCallback, useEffect, useRef, useState } from "react";

import {
  getEpisodeDetail,
  markEpisodeWatched,
  unmarkEpisodeWatched,
  type EpisodeDetailResponse,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { notifyLibraryChanged } from "../library/library-refresh";

export type EpisodeDetailState =
  | { kind: "loading" }
  | { detail: EpisodeDetailResponse; kind: "ready" }
  | { kind: "error"; message: string };

export type EpisodeDetailWatchActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export function useEpisodeDetail(episodeId: string | null) {
  const [state, setState] = useState<EpisodeDetailState>({ kind: "loading" });
  const [watchAction, setWatchAction] = useState<EpisodeDetailWatchActionState>({ kind: "idle" });
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!episodeId) {
      setState({ kind: "error", message: "Missing episode route params" });
      return;
    }

    setState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      setState({ detail: await getEpisodeDetail(token, episodeId), kind: "ready" });
      setWatchAction({ kind: "idle" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Episode detail failed",
      });
    }
  }, [episodeId]);

  const setWatched = useCallback(async (watched: boolean) => {
    if (state.kind !== "ready") {
      return;
    }

    const previousDetail = state.detail;
    const nextRequestId = requestId.current + 1;

    requestId.current = nextRequestId;
    setWatchAction({ kind: "loading" });
    setState({
      detail: {
        ...previousDetail,
        lastWatchedAt: watched ? new Date().toISOString() : null,
        watchCount: getOptimisticWatchCount(previousDetail.watchCount, previousDetail.watched, watched),
        watched,
      },
      kind: "ready",
    });

    try {
      const token = await getSupabaseAccessToken();
      const response = watched
        ? await markEpisodeWatched(token, previousDetail.id)
        : await unmarkEpisodeWatched(token, previousDetail.id);

      if (requestId.current !== nextRequestId) {
        return;
      }

      setState({
        detail: {
          ...previousDetail,
          lastWatchedAt: response.lastWatchedAt,
          watchCount: response.watchCount,
          watched: response.watched,
        },
        kind: "ready",
      });
      notifyLibraryChanged();
      setWatchAction({ kind: "idle" });
    } catch (error) {
      if (requestId.current !== nextRequestId) {
        return;
      }

      setState({ detail: previousDetail, kind: "ready" });
      setWatchAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Episode watch update failed",
      });
    }
  }, [state]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, setWatched, state, watchAction };
}

function getOptimisticWatchCount(currentCount: number, currentWatched: boolean, nextWatched: boolean) {
  if (currentWatched === nextWatched) {
    return currentCount;
  }

  return Math.max(0, currentCount + (nextWatched ? 1 : -1));
}
