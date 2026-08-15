import type { RecommendationItem } from "../api/tvlore-api";

type RecommendationDetailInput = Pick<RecommendationItem, "genreNames" | "reason">;

export function getRecommendationDetail(item: RecommendationDetailInput, preferredGenreNames: string[]) {
  const matchedGenre = item.genreNames.find((genreName) => preferredGenreNames.includes(genreName));

  if (matchedGenre) {
    return `Because you like ${matchedGenre}`;
  }

  const genres = item.genreNames.slice(0, 2).join(", ");
  const reason = getReasonText(item.reason);

  return genres ? `${genres} - ${reason}` : reason;
}

function getReasonText(reason: RecommendationItem["reason"]) {
  if (reason === "based_on_movie_ratings") {
    return "Based on your movie ratings";
  }

  if (reason === "based_on_show_ratings") {
    return "Based on your show ratings";
  }

  return "From your TVLore catalog";
}
