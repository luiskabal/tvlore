import { router } from "expo-router";

import type { MediaType } from "../api/tvlore-api";

let pendingCatalogDetail: string | null = null;

export function openCatalogDetail(mediaType: MediaType, id: string) {
  const key = `${mediaType}:${id}`;
  const href = mediaType === "show"
    ? { pathname: "/shows/[id]" as const, params: { id } }
    : { pathname: "/movies/[id]" as const, params: { id } };

  if (pendingCatalogDetail) {
    router.replace(href);
  } else {
    router.push(href);
  }

  pendingCatalogDetail = key;
}

export function settleCatalogDetailNavigation(mediaType: MediaType, id: string) {
  if (pendingCatalogDetail === `${mediaType}:${id}`) {
    pendingCatalogDetail = null;
  }
}
