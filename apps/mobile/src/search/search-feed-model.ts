import type { CatalogSearchResult, MediaType, RecommendationItem } from "../api/tvlore-api";
import { getResultKey, type SearchFilter } from "./search-model";

type RecommendationSource = {
  available: CatalogSearchResult[];
  personalized: RecommendationItem[];
  picks: CatalogSearchResult[];
  popular: CatalogSearchResult[];
};

export type SearchInlineRecommendation = {
  catalogResult: CatalogSearchResult | null;
  id: string;
  label: string;
  mediaType: MediaType;
  overview: string;
  posterPath: string | null;
  title: string;
  tvloreId: string | null;
};

export type SearchFeedItem =
  | { kind: "result"; key: string; result: CatalogSearchResult }
  | { kind: "recommendation"; key: string; recommendation: SearchInlineRecommendation };

const recommendationSlots = [4, 10, 16];

export function getSearchFeedItems(
  results: CatalogSearchResult[],
  sources: RecommendationSource,
  filter: SearchFilter,
): SearchFeedItem[] {
  if (results.length === 0) {
    return [];
  }

  const resultIds = new Set(results.map(getResultKey));
  const resultTvloreIds = new Set(results.map((result) => result.tvloreId).filter(isString));
  const resultTitles = new Set(results.map((result) => getTitleKey(result.mediaType, result.title)));
  const recommendations = getInlineRecommendations(sources, filter, resultIds, resultTvloreIds, resultTitles);
  const items: SearchFeedItem[] = [];
  let recommendationIndex = 0;

  results.forEach((result, index) => {
    items.push({ kind: "result", key: getResultKey(result), result });

    if (recommendationSlots.includes(index + 1) && recommendations[recommendationIndex]) {
      const recommendation = recommendations[recommendationIndex];

      items.push({
        kind: "recommendation",
        key: `recommendation-${recommendation.label}-${recommendation.id}`,
        recommendation,
      });
      recommendationIndex += 1;
    }
  });

  return items;
}

function getInlineRecommendations(
  sources: RecommendationSource,
  filter: SearchFilter,
  resultIds: Set<string>,
  resultTvloreIds: Set<string>,
  resultTitles: Set<string>,
) {
  const seen = new Set<string>();
  const candidates = [
    ...sources.personalized.map((item) => fromPersonalizedRecommendation(item)),
    ...sources.picks.map((item) => fromCatalogRecommendation(item, "TVLore pick")),
    ...sources.popular.map((item) => fromCatalogRecommendation(item, "Popular in your country")),
    ...sources.available.map((item) => fromCatalogRecommendation(item, "Available to stream")),
  ];

  return candidates.filter((item) => {
    const key = item.catalogResult ? getResultKey(item.catalogResult) : `${item.mediaType}-${item.id}`;
    const titleKey = getTitleKey(item.mediaType, item.title);

    if (
      (filter !== "all" && item.mediaType !== filter)
      || resultIds.has(key)
      || Boolean(item.tvloreId && resultTvloreIds.has(item.tvloreId))
      || resultTitles.has(titleKey)
      || seen.has(key)
    ) {
      return false;
    }

    seen.add(key);
    return true;
  }).slice(0, recommendationSlots.length);
}

function fromPersonalizedRecommendation(item: RecommendationItem): SearchInlineRecommendation {
  return {
    catalogResult: null,
    id: item.id,
    label: "Recommended for you",
    mediaType: item.mediaType,
    overview: item.overview,
    posterPath: item.posterPath,
    title: item.title,
    tvloreId: item.id,
  };
}

function fromCatalogRecommendation(item: CatalogSearchResult, label: string): SearchInlineRecommendation {
  return {
    catalogResult: item,
    id: getResultKey(item),
    label,
    mediaType: item.mediaType,
    overview: item.overview,
    posterPath: item.posterPath,
    title: item.title,
    tvloreId: item.tvloreId,
  };
}

function getTitleKey(mediaType: MediaType, title: string) {
  return `${mediaType}-${title.trim().toLowerCase()}`;
}

function isString(value: string | null): value is string {
  return typeof value === "string";
}
