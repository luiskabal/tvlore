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
  inWatchlist: boolean;
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
  savedItemCount: number;
};

export type WatchPathsResponseDto = {
  paths: WatchPathSummaryDto[];
};

export type WatchPathWatchlistResponseDto = {
  id: string;
  itemCount: number;
  savedItemCount: number;
  title: string;
};
