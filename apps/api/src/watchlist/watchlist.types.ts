export type WatchlistMediaType = "movie" | "show";

export type WatchlistMutationResponseDto = {
  id: string;
  inWatchlist: boolean;
  mediaType: WatchlistMediaType;
};
