import type { ShowProgressResponseDto } from "../progress";

export type LibrarySummaryDto = {
  averageRating: number | null;
  ratedTitleCount: number;
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
  | LibraryWatchedEpisodeDto;

export type LibraryWatchedEpisodeDto = {
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

export type LibraryRatedTitleDto =
  | {
      id: string;
      mediaType: "show";
      posterPath: string | null;
      rating: number;
      title: string;
      updatedAt: string;
    }
  | {
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      rating: number;
      title: string;
      updatedAt: string;
    };

export type LibraryResponseDto = {
  continueWatching: LibraryContinueWatchingShowDto[];
  ratedTitles: LibraryRatedTitleDto[];
  recentlyWatched: LibraryRecentlyWatchedItemDto[];
  summary: LibrarySummaryDto;
  watchlist: LibraryWatchlistItemDto[];
  watchedEpisodes: LibraryWatchedEpisodeDto[];
};

export type { ShowProgressResponseDto };
