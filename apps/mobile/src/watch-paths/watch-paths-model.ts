import type { CatalogSearchResult, CreateWatchPathInput, WatchPathItem } from "../api/tvlore-api";

export function getWatchPathItemKey(item: WatchPathItem) {
  return `${item.mediaType}:${item.externalRef.provider}:${item.externalRef.providerId}`;
}

export function toCatalogSearchResult(item: WatchPathItem): CatalogSearchResult {
  return {
    externalRef: item.externalRef,
    mediaType: item.mediaType,
    overview: item.note ?? "",
    posterPath: item.posterPath,
    title: item.title,
    tvloreId: item.tvloreId,
    year: item.year,
  };
}

export function parseWatchPathImport(title: string, description: string, rawItems: string): CreateWatchPathInput {
  const parsedTitle = title.trim();

  if (!parsedTitle) {
    throw new Error("Path title is required");
  }

  const items = rawItems
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseImportLine);

  if (items.length === 0) {
    throw new Error("Add at least one TMDB item");
  }

  return {
    description: description.trim() || "Personal watch path.",
    items,
    title: parsedTitle,
  };
}

function parseImportLine(line: string): CreateWatchPathInput["items"][number] {
  const [rawMediaType, rawProviderId, ...noteParts] = line.split(",").map((part) => part.trim());
  const mediaType = rawMediaType?.toLowerCase();
  const providerId = rawProviderId ?? "";

  if (mediaType !== "movie" && mediaType !== "show") {
    throw new Error(`Invalid media type in "${line}"`);
  }

  if (!/^[1-9]\d*$/.test(providerId)) {
    throw new Error(`Invalid TMDB id in "${line}"`);
  }

  const note = noteParts.join(",").trim();

  return {
    externalRef: { provider: "tmdb", providerId },
    mediaType,
    note: note || null,
  };
}
