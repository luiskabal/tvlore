import type { CatalogSearchResultDto } from "../catalog/catalog.types";

export type TvlorePicksDiscoveryResponseDto = {
  items: CatalogSearchResultDto[];
  section: "tvlore_picks";
};

export type AvailableDiscoveryResponseDto = {
  country: string;
  items: CatalogSearchResultDto[];
  section: "available_in_country";
};

export type PopularDiscoveryResponseDto = {
  country: string;
  items: CatalogSearchResultDto[];
  section: "popular_in_country";
};
