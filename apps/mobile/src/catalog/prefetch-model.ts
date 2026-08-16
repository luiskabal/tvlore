import type { MediaType } from "../api/types";

export const lookaheadPrefetchLimit = 4;

export type CatalogDetailLookaheadRef = {
  id: string | null;
  mediaType: MediaType;
};

export type ShowSeasonLookaheadRef = {
  seasonNumber: number | null;
  showId: string | null;
};

export type EpisodeDetailLookaheadRef = {
  episodeId: string | null;
};

export function getUniqueCatalogDetailRefs(
  refs: readonly CatalogDetailLookaheadRef[],
  limit = lookaheadPrefetchLimit,
) {
  const seen = new Set<string>();
  const items: Array<{ id: string; mediaType: MediaType }> = [];

  for (const ref of refs) {
    if (!ref.id || items.length >= limit) {
      continue;
    }

    const key = `${ref.mediaType}:${ref.id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push({ id: ref.id, mediaType: ref.mediaType });
  }

  return items;
}

export function getUniqueEpisodeDetailRefs(
  refs: readonly EpisodeDetailLookaheadRef[],
  limit = lookaheadPrefetchLimit,
) {
  const seen = new Set<string>();
  const items: Array<{ episodeId: string }> = [];

  for (const ref of refs) {
    if (!ref.episodeId || items.length >= limit) {
      continue;
    }

    if (seen.has(ref.episodeId)) {
      continue;
    }

    seen.add(ref.episodeId);
    items.push({ episodeId: ref.episodeId });
  }

  return items;
}

export function getUniqueShowSeasonRefs(
  refs: readonly ShowSeasonLookaheadRef[],
  limit = lookaheadPrefetchLimit,
) {
  const seen = new Set<string>();
  const items: Array<{ seasonNumber: number; showId: string }> = [];

  for (const ref of refs) {
    if (!ref.showId || ref.seasonNumber === null || items.length >= limit) {
      continue;
    }

    const key = `${ref.showId}:${ref.seasonNumber}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push({ seasonNumber: ref.seasonNumber, showId: ref.showId });
  }

  return items;
}
