export type MediaType = "movie" | "show";

export type CatalogSearchInput = {
  mediaTypes: MediaType[];
  page: number;
  query: string;
};

export type CatalogExternalRefDto = {
  provider: "tmdb";
  providerId: string;
};

export type CatalogSearchResultDto = {
  externalRef: CatalogExternalRefDto;
  mediaType: MediaType;
  overview: string;
  posterPath: string | null;
  title: string;
  tvloreId: string | null;
  year: number | null;
};

export type CatalogSearchResponseDto = {
  page: number;
  query: string;
  results: CatalogSearchResultDto[];
};
