import type { CatalogSearchResultDto } from "../catalog/catalog.types";

export type TvlorePicksDiscoveryResponseDto = {
  items: CatalogSearchResultDto[];
  section: "tvlore_picks";
};

export type PopularDiscoveryResponseDto = {
  country: string;
  items: CatalogSearchResultDto[];
  section: "popular_in_country";
};
