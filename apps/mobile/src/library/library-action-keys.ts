import type { LibraryWatchlistItem, RecentlyWatchedItem } from "../api/tvlore-api";

export function getHistoryActionKey(item: RecentlyWatchedItem) {
  return `history:${item.mediaType}:${item.id}`;
}

export function getWatchlistActionKey(item: LibraryWatchlistItem) {
  return `watchlist:${item.mediaType}:${item.id}`;
}
