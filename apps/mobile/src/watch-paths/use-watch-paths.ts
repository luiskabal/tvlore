import { useCallback, useEffect, useState } from "react";

import { getWatchPath, getWatchPaths, type WatchPathDetailResponse, type WatchPathSummary } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";

export type WatchPathsState =
  | { kind: "loading" }
  | { kind: "ready"; paths: WatchPathSummary[] }
  | { kind: "error"; message: string };

export type WatchPathState =
  | { kind: "loading" }
  | { kind: "ready"; path: WatchPathDetailResponse }
  | { kind: "error"; message: string };

export function useWatchPaths() {
  const [state, setState] = useState<WatchPathsState>({ kind: "loading" });

  const refresh = useCallback(async () => {
    setState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const response = await getWatchPaths(token);
      setState({ kind: "ready", paths: response.paths });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load watch paths",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, state };
}

export function useWatchPath(pathId: string | null) {
  const [state, setState] = useState<WatchPathState>({ kind: "loading" });

  const refresh = useCallback(async () => {
    if (!pathId) {
      setState({ kind: "error", message: "Missing watch path ID" });
      return;
    }

    setState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const path = await getWatchPath(token, pathId);
      setState({ kind: "ready", path });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not load watch path",
      });
    }
  }, [pathId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { refresh, state };
}
