export type RecommendationBasisDto = {
  averageMovieRating: number | null;
  averageShowRating: number | null;
  availabilityCountry: string;
  preferredGenreNames: string[];
  ratedTitleCount: number;
};

export type RecommendationReasonDto =
  | "available_in_country"
  | "based_on_movie_ratings"
  | "based_on_show_ratings"
  | "from_catalog"
  | "tvlore_house_pick";

export type RecommendationCandidateDto = {
  genreNames: string[];
  id: string;
  mediaType: "movie" | "show";
  overview: string;
  posterPath: string | null;
  reason: RecommendationReasonDto;
  title: string;
};

export type RecommendationItemDto = RecommendationCandidateDto & {
  streamingAvailable: boolean;
  tvloreScore: number;
};

export type RecommendationCandidatesResponseDto = {
  basis: RecommendationBasisDto;
  items: RecommendationCandidateDto[];
};

export type RecommendationsResponseDto = {
  basis: RecommendationBasisDto;
  items: RecommendationItemDto[];
};
