import type { ShowProgressResponseDto } from "../progress";

export type WatchInput = {
  watchedAt: Date;
};

export type EpisodeWatchResponseDto = {
  episodeId: string;
  lastWatchedAt: string | null;
  showProgress: ShowProgressResponseDto;
  watchCount: number;
  watched: boolean;
};

export type MovieWatchResponseDto = {
  lastWatchedAt: string | null;
  movieId: string;
  watchCount: number;
  watched: boolean;
};

export type ShowWatchResponseDto = ShowProgressResponseDto;

export type SeasonWatchResponseDto = ShowProgressResponseDto;
