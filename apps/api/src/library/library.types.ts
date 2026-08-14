export type LibrarySummaryDto = {
  watchlistItemCount: number;
  watchedEpisodeCount: number;
  watchedMovieCount: number;
  watchedShowCount: number;
};

export type LibraryNextEpisodeDto = {
  episodeNumber: number;
  id: string;
  seasonNumber: number;
  title: string;
};

export type LibraryContinueWatchingShowDto = {
  id: string;
  mediaType: "show";
  nextEpisode: LibraryNextEpisodeDto;
  percentComplete: number;
  posterPath: string | null;
  title: string;
};

export type LibraryRecentlyWatchedItemDto =
  | {
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      title: string;
      watchedAt: string;
    }
  | {
      episodeNumber: number;
      id: string;
      mediaType: "episode";
      seasonNumber: number;
      showId: string;
      showTitle: string;
      title: string;
      watchedAt: string;
    };

export type LibraryWatchlistItemDto =
  | {
      createdAt: string;
      id: string;
      mediaType: "show";
      posterPath: string | null;
      title: string;
    }
  | {
      createdAt: string;
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      title: string;
    };

export type LibraryResponseDto = {
  continueWatching: LibraryContinueWatchingShowDto[];
  recentlyWatched: LibraryRecentlyWatchedItemDto[];
  summary: LibrarySummaryDto;
  watchlist: LibraryWatchlistItemDto[];
};

export type ShowProgressSeasonDto = {
  percentComplete: number;
  seasonNumber: number;
  totalEpisodeCount: number;
  watchedEpisodeCount: number;
};

export type ShowProgressResponseDto = {
  isComplete: boolean;
  nextEpisode: LibraryNextEpisodeDto | null;
  percentComplete: number;
  seasons: ShowProgressSeasonDto[];
  showId: string;
  totalEpisodeCount: number;
  watchedEpisodeCount: number;
};
