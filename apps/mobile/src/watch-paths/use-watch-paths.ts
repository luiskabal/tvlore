import { useCallback, useEffect, useState } from "react";

import {
  createWatchPath,
  getWatchPath,
  getWatchPaths,
  importTmdbCollectionWatchPath,
  type CreateWatchPathInput,
  type ImportTmdbCollectionInput,
  type WatchPathDetailResponse,
  type WatchPathSummary,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { prefetchCatalogDetails } from "../catalog/prefetch";

export type WatchPathsState =
  | { kind: "loading" }
  | { kind: "ready"; paths: WatchPathSummary[] }
  | { kind: "error"; message: string };

export type WatchPathState =
  | { kind: "loading" }
  | { kind: "ready"; path: WatchPathDetailResponse }
  | { kind: "error"; message: string };

export type CreateWatchPathState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

const pathPrefetchLimit = 2;

export function useWatchPaths() {
  const [state, setState] = useState<WatchPathsState>({ kind: "loading" });
  const [createState, setCreateState] = useState<CreateWatchPathState>({ kind: "idle" });

  const refresh = useCallback(async () => {
    setState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const response = await getWatchPaths(token);
      setState({ kind: "ready", paths: response.paths });
      void prefetchWatchPathDetails(token, response.paths);
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

  const createPath = useCallback(async (input: CreateWatchPathInput) => {
    setCreateState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const path = await createWatchPath(token, input);
      setState((current) => current.kind === "ready"
        ? { kind: "ready", paths: [toSummary(path), ...current.paths.filter((item) => item.id !== path.id)] }
        : current);
      setCreateState({ kind: "idle" });

      return path;
    } catch (error) {
      setCreateState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not create watch path",
      });

      return null;
    }
  }, []);

  const importTmdbCollectionPath = useCallback(async (input: ImportTmdbCollectionInput) => {
    setCreateState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const path = await importTmdbCollectionWatchPath(token, input);
      setState((current) => current.kind === "ready"
        ? { kind: "ready", paths: [toSummary(path), ...current.paths.filter((item) => item.id !== path.id)] }
        : current);
      setCreateState({ kind: "idle" });

      return path;
    } catch (error) {
      setCreateState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not import TMDB collection",
      });

      return null;
    }
  }, []);

  const resetCreateState = useCallback(() => {
    setCreateState({ kind: "idle" });
  }, []);

  return { createPath, createState, importTmdbCollectionPath, refresh, resetCreateState, state };
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
      void prefetchCatalogDetails(
        path.items.map((item) => ({ id: item.tvloreId, mediaType: item.mediaType })),
        { accessToken: token },
      );
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

async function prefetchWatchPathDetails(accessToken: string | null, paths: WatchPathSummary[]) {
  if (!accessToken) {
    return;
  }

  await Promise.allSettled(
    paths.slice(0, pathPrefetchLimit).map((path) => getWatchPath(accessToken, path.id)),
  );
}

function toSummary(path: WatchPathDetailResponse): WatchPathSummary {
  return {
    description: path.description,
    id: path.id,
    itemCount: path.itemCount,
    source: path.source,
    title: path.title,
  };
}
