import { useCallback, useEffect, useState } from "react";

import {
  getShowSeasonDetail,
  markEpisodeWatched,
  unmarkEpisodeWatched,
  type ShowProgressResponse,
  type ShowSeasonDetailResponse,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";

export type SeasonDetailState =
  | { kind: "loading" }
  | { detail: ShowSeasonDetailResponse; kind: "ready"; showProgress: ShowProgressResponse | null }
  | { kind: "error"; message: string };

export type EpisodeWatchActionState =
  | { kind: "idle" }
  | { episodeId: string; kind: "loading" }
  | { episodeId: string; kind: "error"; message: string };

export function useSeasonDetail(showId: string | null, seasonNumber: number | null) {
  const [state, setState] = useState<SeasonDetailState>({ kind: "loading" });
  const [watchAction, setWatchAction] = useState<EpisodeWatchActionState>({ kind: "idle" });

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
    setWatchAction({ episodeId, kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const response = watched
        ? await markEpisodeWatched(token, episodeId)
        : await unmarkEpisodeWatched(token, episodeId);

      setState((current) => {
        if (current.kind !== "ready") {
          return current;
        }

        return {
          detail: {
            ...current.detail,
            episodes: current.detail.episodes.map((episode) => (
              episode.id === episodeId
                ? {
                    ...episode,
                    lastWatchedAt: response.lastWatchedAt,
                    watchCount: response.watchCount,
                    watched: response.watched,
                  }
                : episode
            )),
          },
          kind: "ready",
          showProgress: response.showProgress,
        };
      });
      setWatchAction({ kind: "idle" });
    } catch (error) {
      setWatchAction({
        episodeId,
        kind: "error",
        message: error instanceof Error ? error.message : "Episode watch update failed",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, setEpisodeWatched, state, watchAction };
}
