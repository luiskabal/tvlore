import type { CatalogDetailResponse, MediaType } from "../api/tvlore-api";

export function updateCatalogDetailRating(
  detail: CatalogDetailResponse,
  mediaType: MediaType,
  id: string,
  rating: number | null,
) {
  if (detail.mediaType !== mediaType || detail.id !== id) {
    return detail;
  }

  return { ...detail, rating };
}
