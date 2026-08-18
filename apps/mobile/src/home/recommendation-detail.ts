import type { RecommendationItem } from "../api/tvlore-api";

type RecommendationDetailInput = Pick<RecommendationItem, "genreNames" | "reason" | "streamingAvailable" | "tvloreScore">;

export function getRecommendationDetail(item: RecommendationDetailInput, preferredGenreNames: string[]) {
  const matchedGenre = item.genreNames.find((genreName) => preferredGenreNames.includes(genreName));

  if (item.reason === "tvlore_house_pick" && matchedGenre) {
    return `TVLore match: ${matchedGenre} and available to stream`;
  }

  if (matchedGenre) {
    return `Because you like ${matchedGenre}`;
  }

  const genres = item.genreNames.slice(0, 2).join(", ");
  const reason = getReasonText(item.reason);

  return genres ? `${genres} - ${reason}` : reason;
}

function getReasonText(reason: RecommendationItem["reason"]) {
  if (reason === "tvlore_house_pick") {
    return "TVLore house pick";
  }

  if (reason === "available_in_country") {
    return "Available to stream in your country";
  }

  if (reason === "based_on_movie_ratings") {
    return "Based on your movie ratings";
  }

  if (reason === "based_on_show_ratings") {
    return "Based on your show ratings";
  }

  return "From your TVLore catalog";
}
