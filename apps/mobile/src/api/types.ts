export type MediaType = "movie" | "show";

export type UserResponse = {
  availabilityCountry: string;
  createdAt: string;
  displayName: string;
  id: string;
};

export type LibraryResponse = {
  continueWatching: ContinueWatchingShow[];
  ratedTitles: LibraryRatedTitle[];
  recentlyWatched: RecentlyWatchedItem[];
  summary: {
    averageRating: number | null;
    ratedTitleCount: number;
    watchlistItemCount: number;
    watchedEpisodeCount: number;
    watchedMovieCount: number;
    watchedShowCount: number;
  };
  watchlist: LibraryWatchlistItem[];
  watchedEpisodes: WatchedEpisodeItem[];
};

export type LibraryChronologyResponse = {
  items: RecentlyWatchedItem[];
  nextCursor: string | null;
};

export type RecommendationsResponse = {
  basis: {
    averageMovieRating: number | null;
    averageShowRating: number | null;
    preferredGenreNames: string[];
    ratedTitleCount: number;
  };
  items: RecommendationItem[];
};

export type RecommendationItem = {
  genreNames: string[];
  id: string;
  mediaType: MediaType;
  overview: string;
  posterPath: string | null;
  reason: "based_on_movie_ratings" | "based_on_show_ratings" | "from_catalog";
  title: string;
};

export type ContinueWatchingShow = {
  id: string;
  mediaType: "show";
  nextEpisode: {
    episodeNumber: number;
    id: string;
    seasonNumber: number;
    title: string;
  };
  percentComplete: number;
  posterPath: string | null;
  title: string;
};

export type RecentlyWatchedItem =
  | {
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      title: string;
      watchedAt: string;
    }
  | WatchedEpisodeItem;

export type WatchedEpisodeItem = {
  episodeNumber: number;
  id: string;
  mediaType: "episode";
  seasonNumber: number;
  showId: string;
  showTitle: string;
  title: string;
  watchedAt: string;
};

export type LibraryWatchlistItem =
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

export type LibraryRatedTitle =
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

export type CatalogExternalRef = {
  provider: "tmdb";
  providerId: string;
};

export type CatalogSearchResult = {
  externalRef: CatalogExternalRef;
  mediaType: MediaType;
  overview: string;
  posterPath: string | null;
  title: string;
  tvloreId: string | null;
  year: number | null;
};

export type CatalogSearchResponse = {
  page: number;
  query: string;
  results: CatalogSearchResult[];
};

export type CatalogResolveResponse = {
  id: string;
  mediaType: MediaType;
};

export type WatchPathSummary = {
  description: string;
  id: string;
  itemCount: number;
  title: string;
};

export type WatchPathItem = {
  externalRef: CatalogExternalRef;
  id: string;
  inWatchlist: boolean;
  mediaType: MediaType;
  note: string | null;
  posterPath: string | null;
  position: number;
  title: string;
  tvloreId: string | null;
  year: number | null;
};

export type WatchPathDetailResponse = WatchPathSummary & {
  items: WatchPathItem[];
  savedItemCount: number;
};

export type WatchPathsResponse = {
  paths: WatchPathSummary[];
};

export type WatchPathWatchlistResponse = {
  id: string;
  itemCount: number;
  savedItemCount: number;
  title: string;
};

export type ShowSeasonSummary = {
  airDate: string | null;
  episodeCount: number;
  id: string;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  title: string;
};

export type ShowEpisode = {
  airDate: string | null;
  episodeNumber: number;
  id: string;
  lastWatchedAt: string | null;
  overview: string;
  runtimeMinutes: number | null;
  seasonNumber: number;
  stillPath: string | null;
  title: string;
  watchCount: number;
  watched: boolean;
};

export type ShowSeasonDetailResponse = ShowSeasonSummary & {
  episodes: ShowEpisode[];
  showId: string;
};

export type ShowDetailResponse = {
  backdropPath: string | null;
  firstAirDate: string | null;
  id: string;
  inWatchlist: boolean;
  mediaType: "show";
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  progress: ShowProgressResponse;
  rating: number | null;
  seasons: ShowSeasonSummary[];
  title: string;
};

export type MovieDetailResponse = {
  backdropPath: string | null;
  id: string;
  inWatchlist: boolean;
  lastWatchedAt: string | null;
  mediaType: "movie";
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  rating: number | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  title: string;
  watchCount: number;
  watched: boolean;
};

export type CatalogDetailResponse = MovieDetailResponse | ShowDetailResponse;

export type WatchProvider = {
  id: number;
  logoPath: string | null;
  name: string;
};

export type WatchProvidersResponse = {
  country: string;
  link: string | null;
  providers: {
    buy: WatchProvider[];
    free: WatchProvider[];
    rent: WatchProvider[];
    stream: WatchProvider[];
  };
};

export type ShowProgressResponse = {
  isComplete: boolean;
  nextEpisode: {
    episodeNumber: number;
    id: string;
    seasonNumber: number;
    title: string;
  } | null;
  percentComplete: number;
  seasons: Array<{
    percentComplete: number;
    seasonNumber: number;
    totalEpisodeCount: number;
    watchedEpisodeCount: number;
  }>;
  showId: string;
  status: "completed" | "not_started" | "watching";
  totalEpisodeCount: number;
  watchedEpisodeCount: number;
};

export type EpisodeWatchResponse = {
  episodeId: string;
  lastWatchedAt: string | null;
  showProgress: ShowProgressResponse;
  watchCount: number;
  watched: boolean;
};

export type MovieWatchResponse = {
  lastWatchedAt: string | null;
  movieId: string;
  watchCount: number;
  watched: boolean;
};

export type WatchlistMutationResponse = {
  id: string;
  inWatchlist: boolean;
  mediaType: MediaType;
};

export type PreferenceMutationResponse = {
  id: string;
  mediaType: MediaType;
  rating: number | null;
  updatedAt: string | null;
};

export type HomeData = {
  library: LibraryResponse | null;
  recommendations: RecommendationsResponse | null;
  user: UserResponse | null;
};
