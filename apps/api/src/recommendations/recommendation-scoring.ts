import type {
  RecommendationBasisDto,
  RecommendationCandidateDto,
  RecommendationItemDto,
  RecommendationReasonDto,
} from "./recommendations.types";

type ScoringCandidate = RecommendationCandidateDto & {
  originalRank: number;
  streamingAvailable: boolean;
};

export function rankTvloreRecommendations(
  items: ScoringCandidate[],
  basis: RecommendationBasisDto,
): RecommendationItemDto[] {
  return items
    .map((item) => ({
      ...item,
      reason: getRecommendationReason(item, basis),
      tvloreScore: getTvloreScore(item, basis),
    }))
    .sort((left, right) => right.tvloreScore - left.tvloreScore || left.originalRank - right.originalRank)
    .map(({ originalRank: _originalRank, ...item }) => item);
}

function getTvloreScore(item: ScoringCandidate, basis: RecommendationBasisDto) {
  const matchingGenreCount = getMatchingGenreNames(item, basis).length;
  const rating = item.mediaType === "movie" ? basis.averageMovieRating : basis.averageShowRating;
  const score =
    35
    + Math.min(matchingGenreCount, 2) * 18
    + getRatingStrengthScore(rating)
    + getMediaAffinityScore(item.mediaType, basis)
    + (item.streamingAvailable ? 15 : 0);

  return Math.min(100, Math.max(0, Math.round(score)));
}

function getRecommendationReason(
  item: ScoringCandidate,
  basis: RecommendationBasisDto,
): RecommendationReasonDto {
  if (item.streamingAvailable && getMatchingGenreNames(item, basis).length > 0) {
    return "tvlore_house_pick";
  }

  if (item.streamingAvailable) {
    return "available_in_country";
  }

  return item.reason;
}

function getMatchingGenreNames(item: RecommendationCandidateDto, basis: RecommendationBasisDto) {
  const preferredGenres = new Set(basis.preferredGenreNames);

  return item.genreNames.filter((genreName) => preferredGenres.has(genreName));
}

function getRatingStrengthScore(rating: number | null) {
  if (rating === null) {
    return 0;
  }

  if (rating >= 4.5) {
    return 14;
  }

  if (rating >= 4) {
    return 10;
  }

  if (rating >= 3.5) {
    return 5;
  }

  return 0;
}

function getMediaAffinityScore(mediaType: "movie" | "show", basis: RecommendationBasisDto) {
  const current = mediaType === "movie" ? basis.averageMovieRating : basis.averageShowRating;
  const other = mediaType === "movie" ? basis.averageShowRating : basis.averageMovieRating;

  if (current === null) {
    return 0;
  }

  if (other === null || current >= other) {
    return 10;
  }

  return 4;
}
