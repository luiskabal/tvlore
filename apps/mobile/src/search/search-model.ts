import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";

export type SearchFilter = "all" | MediaType;

export const minSearchLength = 3;

export function canRunSearch(rawQuery: string) {
  return rawQuery.trim().length >= minSearchLength;
}

export function getMediaTypes(filter: SearchFilter): MediaType[] {
  return filter === "all" ? ["show", "movie"] : [filter];
}

export function getResultKey(result: Pick<CatalogSearchResult, "externalRef" | "mediaType">) {
  return `${result.mediaType}-${result.externalRef.provider}-${result.externalRef.providerId}`;
}
