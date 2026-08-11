export type WatchInput = {
  watchedAt: Date;
};

export type ShowProgressDto = {
  percentComplete: number;
  showId: string;
  totalEpisodeCount: number;
  watchedEpisodeCount: number;
};

export type EpisodeWatchResponseDto = {
  episodeId: string;
  lastWatchedAt: string | null;
  showProgress: ShowProgressDto;
  watchCount: number;
  watched: boolean;
};

export type MovieWatchResponseDto = {
  lastWatchedAt: string | null;
  movieId: string;
  watchCount: number;
  watched: boolean;
};
