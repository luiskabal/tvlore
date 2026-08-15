export type RecommendationBasisDto = {
  averageMovieRating: number | null;
  averageShowRating: number | null;
  availabilityCountry: string;
  preferredGenreNames: string[];
  ratedTitleCount: number;
};

export type RecommendationItemDto = {
  genreNames: string[];
  id: string;
  mediaType: "movie" | "show";
  overview: string;
  posterPath: string | null;
  reason: "based_on_movie_ratings" | "based_on_show_ratings" | "from_catalog";
  streamingAvailable: boolean;
  title: string;
};

export type RecommendationsResponseDto = {
  basis: RecommendationBasisDto;
  items: RecommendationItemDto[];
};
