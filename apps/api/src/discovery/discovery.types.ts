import type { CatalogSearchResultDto } from "../catalog/catalog.types";

export type PopularDiscoveryResponseDto = {
  country: string;
  items: CatalogSearchResultDto[];
  section: "popular_in_country";
};
