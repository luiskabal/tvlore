import type { CatalogDetailResponse, ShowDetailResponse, ShowProgressResponse } from "../api/tvlore-api";

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
    return "Episodes will load in the background when you mark the show watched.";
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

export function getOptimisticShowProgress(show: ShowDetailResponse, watched: boolean): ShowProgressResponse {
  const progressBySeason = new Map(show.progress.seasons.map((season) => [season.seasonNumber, season]));
  const seasons = show.seasons
    .filter((season) => season.seasonNumber > 0)
    .map((season) => {
      const currentProgress = progressBySeason.get(season.seasonNumber);
      const totalEpisodeCount = Math.max(season.episodeCount, currentProgress?.totalEpisodeCount ?? 0);
      const watchedEpisodeCount = watched ? totalEpisodeCount : 0;

      return {
        percentComplete: watched && totalEpisodeCount > 0 ? 100 : 0,
        seasonNumber: season.seasonNumber,
        totalEpisodeCount,
        watchedEpisodeCount,
      };
    });
  const totalEpisodeCount = seasons.reduce((total, season) => total + season.totalEpisodeCount, 0);
  const watchedEpisodeCount = watched ? totalEpisodeCount : 0;

  return {
    isComplete: watched && totalEpisodeCount > 0,
    nextEpisode: null,
    percentComplete: watched && totalEpisodeCount > 0 ? 100 : 0,
    seasons,
    showId: show.id,
    status: watched && totalEpisodeCount > 0 ? "completed" : "not_started",
    totalEpisodeCount,
    watchedEpisodeCount,
  };
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
