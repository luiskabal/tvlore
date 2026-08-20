import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import {
  getShowSeasonDetail,
  markEpisodeWatched,
  markSeasonWatched,
  unmarkEpisodeWatched,
  unmarkSeasonWatched,
  type ShowEpisode,
  type ShowProgressResponse,
  type ShowSeasonDetailResponse,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { notifyLibraryChanged } from "../library/library-refresh";

const seasonEpisodePageSize = 20;

export type SeasonDetailState =
  | { kind: "loading" }
  | {
      detail: ShowSeasonDetailResponse;
      episodeLoadError: string | null;
      isHydratingEpisodes: boolean;
      isLoadingMoreEpisodes: boolean;
      kind: "ready";
      showProgress: ShowProgressResponse | null;
    }
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
  const seasonRequestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!showId || seasonNumber === null) {
      setState({ kind: "error", message: "Missing season route params" });
      return;
    }

    const requestId = seasonRequestId.current + 1;
    seasonRequestId.current = requestId;
    setWatchAction({ kind: "idle" });
    setState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const shell = await getShowSeasonDetail(token, showId, seasonNumber, {
        episodeLimit: seasonEpisodePageSize,
        episodeOffset: 0,
        hydrate: false,
      });
      const needsHydration = shell.episodePage.storedCount < shell.episodePage.totalCount;

      if (seasonRequestId.current !== requestId) {
        return;
      }

      setState({
        detail: shell,
        episodeLoadError: null,
        isHydratingEpisodes: needsHydration,
        isLoadingMoreEpisodes: false,
        kind: "ready",
        showProgress: null,
      });

      if (needsHydration) {
        let hydrated: ShowSeasonDetailResponse;

        try {
          hydrated = await getShowSeasonDetail(token, showId, seasonNumber, {
            episodeLimit: seasonEpisodePageSize,
            episodeOffset: 0,
            hydrate: true,
          });
        } catch (error) {
          if (seasonRequestId.current !== requestId) {
            return;
          }

          setState((current) => current.kind === "ready"
            ? {
                ...current,
                episodeLoadError: error instanceof Error ? error.message : "Could not load episodes",
                isHydratingEpisodes: false,
              }
            : current);
          return;
        }

        if (seasonRequestId.current !== requestId) {
          return;
        }

        setState({
          detail: hydrated,
          episodeLoadError: null,
          isHydratingEpisodes: false,
          isLoadingMoreEpisodes: false,
          kind: "ready",
          showProgress: null,
        });
      }

      setWatchAction({ kind: "idle" });
    } catch (error) {
      if (seasonRequestId.current !== requestId) {
        return;
      }

      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Season detail failed",
      });
    }
  }, [seasonNumber, showId]);

  const loadMoreEpisodes = useCallback(async () => {
    if (state.kind !== "ready" || !showId || seasonNumber === null) {
      return;
    }

    if (state.isHydratingEpisodes || state.isLoadingMoreEpisodes || !state.detail.episodePage.hasMore) {
      return;
    }

    setState((current) => current.kind === "ready"
      ? { ...current, episodeLoadError: null, isLoadingMoreEpisodes: true }
      : current);

    try {
      const token = await getSupabaseAccessToken();
      const nextPage = await getShowSeasonDetail(token, showId, seasonNumber, {
        episodeLimit: seasonEpisodePageSize,
        episodeOffset: state.detail.episodes.length,
        hydrate: false,
      });

      setState((current) => current.kind === "ready"
        ? {
            ...current,
            detail: mergeEpisodePage(current.detail, nextPage),
            episodeLoadError: null,
            isLoadingMoreEpisodes: false,
          }
        : current);
    } catch (error) {
      setState((current) => current.kind === "ready"
        ? {
            ...current,
            episodeLoadError: error instanceof Error ? error.message : "Could not load more episodes",
            isLoadingMoreEpisodes: false,
          }
        : current);
    }
  }, [seasonNumber, showId, state]);

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
    if (state.kind !== "ready" || !showId || seasonNumber === null) {
      return;
    }

    const targetEpisodes = state.detail.episodes.filter((episode) => episode.watched !== watched);
    const totalEpisodeCount = state.detail.episodePage.totalCount;
    const watchedEpisodeCount = state.detail.episodePage.watchedCount;

    if (watched ? watchedEpisodeCount >= totalEpisodeCount : watchedEpisodeCount === 0) {
      return;
    }

    setWatchAction({ kind: "bulk-loading", watched });

    try {
      const token = await getSupabaseAccessToken();
      const showProgress = watched
        ? await markSeasonWatched(token, showId, seasonNumber)
        : await unmarkSeasonWatched(token, showId, seasonNumber);
      const targetEpisodeIds = new Set(targetEpisodes.map((episode) => episode.id));
      const watchedAt = watched ? new Date().toISOString() : null;

      setState((current) => {
        if (current.kind !== "ready") {
          return current;
        }

        return {
          ...current,
          detail: {
            ...current.detail,
            episodePage: {
              ...current.detail.episodePage,
              watchedCount: watched ? current.detail.episodePage.totalCount : 0,
            },
            episodes: current.detail.episodes.map((episode) => {
              return targetEpisodeIds.has(episode.id)
                ? {
                    ...episode,
                    lastWatchedAt: watchedAt,
                    watchCount: getOptimisticWatchCount(episode.watchCount, episode.watched, watched),
                    watched,
                  }
                : episode;
            }),
          },
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
  }, [seasonNumber, showId, state]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { loadMoreEpisodes, refresh, setEpisodeWatched, setSeasonWatched, state, watchAction };
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

  const previousEpisode = current.detail.episodes.find((episode) => episode.id === episodeId);

  return {
    ...current,
    detail: {
      ...current.detail,
      episodePage: {
        ...current.detail.episodePage,
        watchedCount: getNextSeasonWatchedCount(current.detail.episodePage.watchedCount, previousEpisode?.watched, patch.watched),
      },
      episodes: current.detail.episodes.map((episode) => (
        episode.id === episodeId ? { ...episode, ...patch } : episode
      )),
    },
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

function getNextSeasonWatchedCount(currentCount: number, currentWatched: boolean | undefined, nextWatched: boolean) {
  if (currentWatched === undefined || currentWatched === nextWatched) {
    return currentCount;
  }

  return Math.max(0, currentCount + (nextWatched ? 1 : -1));
}

function mergeEpisodePage(current: ShowSeasonDetailResponse, next: ShowSeasonDetailResponse): ShowSeasonDetailResponse {
  const episodesById = new Map(current.episodes.map((episode) => [episode.id, episode]));

  for (const episode of next.episodes) {
    episodesById.set(episode.id, episode);
  }

  const episodes = [...episodesById.values()].sort((left, right) => left.episodeNumber - right.episodeNumber);

  return {
    ...next,
    episodePage: {
      ...next.episodePage,
      returnedCount: episodes.length,
    },
    episodes,
  };
}
