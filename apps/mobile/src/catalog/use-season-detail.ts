import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import {
  getShowSeasonDetail,
  markEpisodeWatched,
  unmarkEpisodeWatched,
  type EpisodeWatchResponse,
  type ShowEpisode,
  type ShowProgressResponse,
  type ShowSeasonDetailResponse,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { notifyLibraryChanged } from "../library/library-refresh";

export type SeasonDetailState =
  | { kind: "loading" }
  | { detail: ShowSeasonDetailResponse; kind: "ready"; showProgress: ShowProgressResponse | null }
  | { kind: "error"; message: string };

export type EpisodeWatchActionState =
  | { kind: "idle" }
  | { episodeId: string; kind: "loading" }
  | { episodeId: string; kind: "error"; message: string }
  | { kind: "bulk-loading"; watched: boolean }
  | { kind: "bulk-error"; message: string; watched: boolean };

export function useSeasonDetail(showId: string | null, seasonNumber: number | null) {
  const [state, setState] = useState<SeasonDetailState>({ kind: "loading" });
  const [watchAction, setWatchAction] = useState<EpisodeWatchActionState>({ kind: "idle" });
  const episodeRequestIds = useRef(new Map<string, number>());

  const refresh = useCallback(async () => {
    if (!showId || seasonNumber === null) {
      setState({ kind: "error", message: "Missing season route params" });
      return;
    }

    setState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const detail = await getShowSeasonDetail(token, showId, seasonNumber);
      setState({ detail, kind: "ready", showProgress: null });
      setWatchAction({ kind: "idle" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Season detail failed",
      });
    }
  }, [seasonNumber, showId]);

  const setEpisodeWatched = useCallback(async (episodeId: string, watched: boolean) => {
    const previousEpisode = state.kind === "ready"
      ? state.detail.episodes.find((episode) => episode.id === episodeId) ?? null
      : null;
    const requestId = (episodeRequestIds.current.get(episodeId) ?? 0) + 1;

    episodeRequestIds.current.set(episodeId, requestId);
    setWatchAction({ episodeId, kind: "loading" });
    setState((current) => updateEpisode(current, episodeId, {
      lastWatchedAt: watched ? new Date().toISOString() : null,
      watchCount: getOptimisticWatchCount(previousEpisode?.watchCount ?? 0, Boolean(previousEpisode?.watched), watched),
      watched,
    }));

    try {
      const token = await getSupabaseAccessToken();
      const response = watched
        ? await markEpisodeWatched(token, episodeId)
        : await unmarkEpisodeWatched(token, episodeId);

      if (episodeRequestIds.current.get(episodeId) !== requestId) {
        return;
      }

      setState((current) => updateEpisode(current, episodeId, {
        lastWatchedAt: response.lastWatchedAt,
        watchCount: response.watchCount,
        watched: response.watched,
      }, response.showProgress));
      notifyLibraryChanged();
      setWatchAction({ kind: "idle" });
    } catch (error) {
      if (episodeRequestIds.current.get(episodeId) !== requestId) {
        return;
      }

      rollbackEpisode(previousEpisode, setState);
      setWatchAction({
        episodeId,
        kind: "error",
        message: error instanceof Error ? error.message : "Episode watch update failed",
      });
    }
  }, [state]);

  const setSeasonWatched = useCallback(async (watched: boolean) => {
    if (state.kind !== "ready") {
      return;
    }

    const targetEpisodes = state.detail.episodes.filter((episode) => episode.watched !== watched);

    if (targetEpisodes.length === 0) {
      return;
    }

    setWatchAction({ kind: "bulk-loading", watched });

    try {
      const token = await getSupabaseAccessToken();
      const responses = new Map<string, EpisodeWatchResponse>();
      let showProgress: ShowProgressResponse | null = null;

      for (const episode of targetEpisodes) {
        const response = watched
          ? await markEpisodeWatched(token, episode.id)
          : await unmarkEpisodeWatched(token, episode.id);

        responses.set(episode.id, response);
        showProgress = response.showProgress;
      }

      setState((current) => {
        if (current.kind !== "ready") {
          return current;
        }

        return {
          detail: {
            ...current.detail,
            episodes: current.detail.episodes.map((episode) => {
              const response = responses.get(episode.id);

              return response
                ? {
                    ...episode,
                    lastWatchedAt: response.lastWatchedAt,
                    watchCount: response.watchCount,
                    watched: response.watched,
                  }
                : episode;
            }),
          },
          kind: "ready",
          showProgress,
        };
      });
      notifyLibraryChanged();
      setWatchAction({ kind: "idle" });
    } catch (error) {
      setWatchAction({
        kind: "bulk-error",
        message: error instanceof Error ? error.message : "Season watch update failed",
        watched,
      });
    }
  }, [state]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, setEpisodeWatched, setSeasonWatched, state, watchAction };
}

function updateEpisode(
  current: SeasonDetailState,
  episodeId: string,
  patch: Pick<ShowEpisode, "lastWatchedAt" | "watchCount" | "watched">,
  showProgress?: ShowProgressResponse | null,
): SeasonDetailState {
  if (current.kind !== "ready") {
    return current;
  }

  return {
    detail: {
      ...current.detail,
      episodes: current.detail.episodes.map((episode) => (
        episode.id === episodeId ? { ...episode, ...patch } : episode
      )),
    },
    kind: "ready",
    showProgress: showProgress === undefined ? current.showProgress : showProgress,
  };
}

function rollbackEpisode(
  previousEpisode: ShowEpisode | null,
  setState: Dispatch<SetStateAction<SeasonDetailState>>,
) {
  if (!previousEpisode) {
    return;
  }

  setState((current) => updateEpisode(current, previousEpisode.id, {
    lastWatchedAt: previousEpisode.lastWatchedAt,
    watchCount: previousEpisode.watchCount,
    watched: previousEpisode.watched,
  }, current.kind === "ready" ? current.showProgress : null));
}

function getOptimisticWatchCount(currentCount: number, currentWatched: boolean, nextWatched: boolean) {
  if (currentWatched === nextWatched) {
    return currentCount;
  }

  return Math.max(0, currentCount + (nextWatched ? 1 : -1));
}
