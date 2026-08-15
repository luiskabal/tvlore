export type WatchlistMediaType = "movie" | "show";

export type WatchlistMutationResponseDto = {
  id: string;
  inWatchlist: boolean;
  mediaType: WatchlistMediaType;
};

export type WatchlistCatalogRef = {
  id: string;
  mediaType: WatchlistMediaType;
};
