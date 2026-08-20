export type ShowProgressStatusDto = "completed" | "not_started" | "watching";

export type ShowProgressNextEpisodeDto = {
  episodeNumber: number;
  id: string;
  seasonNumber: number;
  title: string;
};

export type ShowProgressSeasonDto = {
  percentComplete: number;
  seasonNumber: number;
  totalEpisodeCount: number;
  watchedEpisodeCount: number;
};

export type ShowProgressResponseDto = {
  isComplete: boolean;
  nextEpisode: ShowProgressNextEpisodeDto | null;
  percentComplete: number;
  seasons: ShowProgressSeasonDto[];
  showId: string;
  status: ShowProgressStatusDto;
  totalEpisodeCount: number;
  watchedEpisodeCount: number;
};

export type ProgressEpisode = {
  episodeNumber: number;
  id: string;
  seasonNumber: number;
  title: string;
  watches: Array<{ watchedAt: Date }>;
};

export function calculatePercentComplete(watchedCount: number, totalCount: number) {
  return totalCount <= 0 ? 0 : Math.round((watchedCount / totalCount) * 100);
}

export function getShowProgressStatus(
  watchedEpisodeCount: number,
  totalEpisodeCount: number,
): ShowProgressStatusDto {
  if (totalEpisodeCount > 0 && watchedEpisodeCount === totalEpisodeCount) {
    return "completed";
  }

  return watchedEpisodeCount > 0 ? "watching" : "not_started";
}

export function toShowProgress(show: {
  id: string;
  seasons: Array<{
    episodes: ProgressEpisode[];
    seasonNumber: number;
  }>;
}): ShowProgressResponseDto {
  const eligibleSeasons = show.seasons.filter((season) => isRegularSeason(season.seasonNumber));
  const episodes = eligibleSeasons.flatMap((season) => season.episodes);
  const totalEpisodeCount = episodes.length;
  const watchedEpisodeCount = countWatched(episodes);

  return {
    isComplete: totalEpisodeCount > 0 && watchedEpisodeCount === totalEpisodeCount,
    nextEpisode: toNextEpisode(episodes.find((episode) => episode.watches.length === 0)),
    percentComplete: calculatePercentComplete(watchedEpisodeCount, totalEpisodeCount),
    seasons: eligibleSeasons.map((season) => {
      const seasonTotalEpisodeCount = season.episodes.length;
      const seasonWatchedEpisodeCount = countWatched(season.episodes);

      return {
        percentComplete: calculatePercentComplete(seasonWatchedEpisodeCount, seasonTotalEpisodeCount),
        seasonNumber: season.seasonNumber,
        totalEpisodeCount: seasonTotalEpisodeCount,
        watchedEpisodeCount: seasonWatchedEpisodeCount,
      };
    }),
    showId: show.id,
    status: getShowProgressStatus(watchedEpisodeCount, totalEpisodeCount),
    totalEpisodeCount,
    watchedEpisodeCount,
  };
}

function isRegularSeason(seasonNumber: number) {
  return seasonNumber > 0;
}

function countWatched(episodes: ProgressEpisode[]) {
  return episodes.filter((episode) => episode.watches.length > 0).length;
}

function toNextEpisode(episode: ProgressEpisode | undefined): ShowProgressNextEpisodeDto | null {
  return episode
    ? {
        episodeNumber: episode.episodeNumber,
        id: episode.id,
        seasonNumber: episode.seasonNumber,
        title: episode.title,
      }
    : null;
}
