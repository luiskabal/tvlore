import type { CatalogSearchResult, WatchPathItem } from "../api/tvlore-api";

export function getWatchPathItemKey(item: WatchPathItem) {
  return `${item.mediaType}:${item.externalRef.provider}:${item.externalRef.providerId}`;
}

export function toCatalogSearchResult(item: WatchPathItem): CatalogSearchResult {
  return {
    externalRef: item.externalRef,
    mediaType: item.mediaType,
    overview: item.note ?? "",
    posterPath: null,
    title: item.title,
    tvloreId: item.tvloreId,
    year: item.year,
  };
}
