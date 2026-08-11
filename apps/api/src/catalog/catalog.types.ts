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

export type CatalogResolveInput = {
  mediaType: MediaType;
  provider: "tmdb";
  providerId: string;
};

export type CatalogResolvedItem = {
  backdropPath: string | null;
  externalRef: CatalogExternalRefDto;
  firstAirDate: string | null;
  mediaType: MediaType;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  title: string;
};

export type CatalogResolveResponseDto = {
  id: string;
  mediaType: MediaType;
};
