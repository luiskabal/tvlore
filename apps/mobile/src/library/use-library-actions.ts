import { useCallback, useState } from "react";

import {
  removeFromWatchlist,
  unmarkEpisodeWatched,
  unmarkMovieWatched,
  type LibraryWatchlistItem,
  type RecentlyWatchedItem,
} from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { getHistoryActionKey, getWatchlistActionKey } from "./library-action-keys";
import { notifyLibraryChanged } from "./library-refresh";

export { getHistoryActionKey, getWatchlistActionKey } from "./library-action-keys";

export type LibraryActionState =
  | { kind: "idle" }
  | { actionKey: string; kind: "loading" }
  | { actionKey: string; kind: "error"; message: string };

export function useLibraryActions() {
  const [libraryAction, setLibraryAction] = useState<LibraryActionState>({ kind: "idle" });

  const removeWatchlistItem = useCallback(async (item: LibraryWatchlistItem) => {
    const actionKey = getWatchlistActionKey(item);
    setLibraryAction({ actionKey, kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      await removeFromWatchlist(token, item.mediaType, item.id);
      notifyLibraryChanged();
      setLibraryAction({ kind: "idle" });
    } catch (error) {
      setLibraryAction({
        actionKey,
        kind: "error",
        message: error instanceof Error ? error.message : "Could not update watchlist",
      });
    }
  }, []);

  const removeRecentlyWatchedItem = useCallback(async (item: RecentlyWatchedItem) => {
    const actionKey = getHistoryActionKey(item);
    setLibraryAction({ actionKey, kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      if (item.mediaType === "movie") {
        await unmarkMovieWatched(token, item.id);
      } else {
        await unmarkEpisodeWatched(token, item.id);
      }

      notifyLibraryChanged();
      setLibraryAction({ kind: "idle" });
    } catch (error) {
      setLibraryAction({
        actionKey,
        kind: "error",
        message: error instanceof Error ? error.message : "Could not update watch history",
      });
    }
  }, []);

  return { libraryAction, removeRecentlyWatchedItem, removeWatchlistItem };
}
