import type { RecentlyWatchedItem } from "../api/tvlore-api";

export function mergeChronologyItems(current: RecentlyWatchedItem[], next: RecentlyWatchedItem[]) {
  const seenKeys = new Set(current.map(getChronologyItemKey));
  const mergedItems = [...current];

  next.forEach((item) => {
    const key = getChronologyItemKey(item);

    if (seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    mergedItems.push(item);
  });

  return mergedItems;
}

export function getChronologyItemKey(item: RecentlyWatchedItem) {
  return `${item.mediaType}:${item.id}`;
}
