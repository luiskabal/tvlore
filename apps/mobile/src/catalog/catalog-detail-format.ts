import type { CatalogDetailResponse, ShowDetailResponse } from "../api/tvlore-api";

export function getMetadata(detail: CatalogDetailResponse) {
  if (detail.mediaType === "show") {
    return detail.firstAirDate ? new Date(detail.firstAirDate).getFullYear().toString() : "Unknown year";
  }

  const year = detail.releaseDate ? new Date(detail.releaseDate).getFullYear().toString() : "Unknown year";
  return detail.runtimeMinutes ? `${year} - ${detail.runtimeMinutes} min` : year;
}

export function formatPublicRating(publicRating: number | null, isRevealed: boolean) {
  if (publicRating === null) {
    return "--";
  }

  if (!isRevealed) {
    return "Spoiler";
  }

  return `${publicRating.toFixed(1)}/10`;
}

export function getStatusLine(show: ShowDetailResponse) {
  return `${show.seasons.length} seasons available`;
}

export function getShowProgressLine(show: ShowDetailResponse) {
  if (show.progress.totalEpisodeCount === 0) {
    return "Choose a season to load episodes and start tracking.";
  }

  const countText = `${show.progress.watchedEpisodeCount}/${show.progress.totalEpisodeCount} episodes`;

  if (show.progress.status === "completed") {
    return `Completed - ${countText}`;
  }

  if (show.progress.status === "watching") {
    return `Watching - ${countText} watched (${show.progress.percentComplete}%)`;
  }

  return `Not started - ${countText}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatCount(value: number, label: string) {
  return `${value} ${value === 1 ? label : `${label}s`}`;
}

export function getProviderInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
