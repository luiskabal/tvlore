import type { CatalogExternalRefDto, MediaType } from "../catalog/catalog.types";

export type WatchPathSummaryDto = {
  description: string;
  id: string;
  itemCount: number;
  title: string;
};

export type WatchPathItemDto = {
  externalRef: CatalogExternalRefDto;
  id: string;
  mediaType: MediaType;
  note: string | null;
  posterPath: string | null;
  position: number;
  title: string;
  tvloreId: string | null;
  year: number | null;
};

export type WatchPathDetailDto = WatchPathSummaryDto & {
  items: WatchPathItemDto[];
};

export type WatchPathsResponseDto = {
  paths: WatchPathSummaryDto[];
};
