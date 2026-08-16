import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearEpisodePreferenceRating,
  getCatalogCast,
  getEpisodeDetail,
  markEpisodeWatched,
  setEpisodePreferenceRating,
  setWatchReflection,
  unmarkEpisodeWatched,
  type EpisodeDetailResponse,
  type WatchReflectionInput,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { notifyLibraryChanged } from "../library/library-refresh";
import type { PostWatchCastState } from "./post-watch-check-in-model";

export type EpisodeDetailState =
  | { kind: "loading" }
  | { detail: EpisodeDetailResponse; kind: "ready" }
  | { kind: "error"; message: string };

export type EpisodeDetailWatchActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export type EpisodeDetailPreferenceActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export type EpisodeDetailReflectionActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export function useEpisodeDetail(episodeId: string | null) {
  const [state, setState] = useState<EpisodeDetailState>({ kind: "loading" });
  const [watchAction, setWatchAction] = useState<EpisodeDetailWatchActionState>({ kind: "idle" });
  const [preferenceAction, setPreferenceAction] = useState<EpisodeDetailPreferenceActionState>({ kind: "idle" });
  const [reflectionAction, setReflectionAction] = useState<EpisodeDetailReflectionActionState>({ kind: "idle" });
  const [castState, setCastState] = useState<PostWatchCastState>({ kind: "idle" });
  const ratingRequestId = useRef(0);
  const reflectionRequestId = useRef(0);
  const castRequestId = useRef(0);
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
      setPreferenceAction({ kind: "idle" });
      setReflectionAction({ kind: "idle" });
      setWatchAction({ kind: "idle" });
      setCastState({ kind: "idle" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Episode detail failed",
      });
    }
  }, [episodeId]);

  const setWatched = useCallback(async (watched: boolean) => {
    if (state.kind !== "ready") {
      return false;
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
        return false;
      }

      setState((current) => updateDetail(current, {
        lastWatchedAt: response.lastWatchedAt,
        watchCount: response.watchCount,
        watched: response.watched,
      }));
      notifyLibraryChanged();
      setWatchAction({ kind: "idle" });
      return true;
    } catch (error) {
      if (requestId.current !== nextRequestId) {
        return false;
      }

      setState((current) => updateDetail(current, {
        lastWatchedAt: previousDetail.lastWatchedAt,
        watchCount: previousDetail.watchCount,
        watched: previousDetail.watched,
      }));
      setWatchAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Episode watch update failed",
      });
      return false;
    }
  }, [state]);

  const setRating = useCallback(async (rating: number | null) => {
    if (state.kind !== "ready") {
      return false;
    }

    const previousDetail = state.detail;
    const nextRequestId = ratingRequestId.current + 1;

    ratingRequestId.current = nextRequestId;
    setPreferenceAction({ kind: "loading" });
    setState({
      detail: {
        ...previousDetail,
        rating,
      },
      kind: "ready",
    });

    try {
      const token = await getSupabaseAccessToken();
      const response = rating === null
        ? await clearEpisodePreferenceRating(token, previousDetail.id)
        : await setEpisodePreferenceRating(token, previousDetail.id, rating);

      if (ratingRequestId.current !== nextRequestId) {
        return false;
      }

      setState((current) => updateDetail(current, { rating: response.rating }));
      notifyLibraryChanged();
      setPreferenceAction({ kind: "idle" });

      return true;
    } catch (error) {
      if (ratingRequestId.current !== nextRequestId) {
        return false;
      }

      setState((current) => updateDetail(current, { rating: previousDetail.rating }));
      setPreferenceAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Episode rating update failed",
      });

      return false;
    }
  }, [state]);

  const setReflection = useCallback(async (input: WatchReflectionInput) => {
    if (state.kind !== "ready") {
      return false;
    }

    const previousDetail = state.detail;
    const nextRequestId = reflectionRequestId.current + 1;

    reflectionRequestId.current = nextRequestId;
    setReflectionAction({ kind: "loading" });
    setState({
      detail: {
        ...previousDetail,
        rating: input.rating,
        reflection: {
          comment: input.comment,
          favoriteCharacter: input.favoriteCharacter,
          reaction: input.reaction,
          updatedAt: new Date().toISOString(),
        },
      },
      kind: "ready",
    });

    try {
      const token = await getSupabaseAccessToken();
      const response = await setWatchReflection(token, "episode", previousDetail.id, input);

      if (reflectionRequestId.current !== nextRequestId) {
        return false;
      }

      setState((current) => updateDetail(current, {
        rating: response.rating,
        reflection: {
          comment: response.comment,
          favoriteCharacter: response.favoriteCharacter,
          reaction: response.reaction,
          updatedAt: response.updatedAt,
        },
      }));
      notifyLibraryChanged();
      setReflectionAction({ kind: "idle" });

      return true;
    } catch (error) {
      if (reflectionRequestId.current !== nextRequestId) {
        return false;
      }

      setState((current) => updateDetail(current, {
        rating: previousDetail.rating,
        reflection: previousDetail.reflection,
      }));
      setReflectionAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Episode check-in update failed",
      });

      return false;
    }
  }, [state]);

  const loadCast = useCallback(async () => {
    if (state.kind !== "ready") {
      return;
    }

    const previousDetail = state.detail;
    const nextRequestId = castRequestId.current + 1;

    castRequestId.current = nextRequestId;
    setCastState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const response = await getCatalogCast(token, "episode", previousDetail.id);

      if (castRequestId.current !== nextRequestId) {
        return;
      }

      setCastState({ items: response.items, kind: "ready" });
    } catch (error) {
      if (castRequestId.current !== nextRequestId) {
        return;
      }

      setCastState({
        kind: "error",
        message: error instanceof Error ? error.message : "Episode cast unavailable",
      });
    }
  }, [state]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { castState, loadCast, preferenceAction, reflectionAction, refresh, setRating, setReflection, setWatched, state, watchAction };
}

function getOptimisticWatchCount(currentCount: number, currentWatched: boolean, nextWatched: boolean) {
  if (currentWatched === nextWatched) {
    return currentCount;
  }

  return Math.max(0, currentCount + (nextWatched ? 1 : -1));
}

function updateDetail(
  current: EpisodeDetailState,
  patch: Partial<Pick<EpisodeDetailResponse, "lastWatchedAt" | "rating" | "reflection" | "watchCount" | "watched">>,
): EpisodeDetailState {
  if (current.kind !== "ready") {
    return current;
  }

  return {
    detail: {
      ...current.detail,
      ...patch,
    },
    kind: "ready",
  };
}
