import { fetchJson, getAuthHeaders } from "./client";
import {
  isCatalogResolveResponse,
  isCatalogSearchResponse,
  isMovieDetailResponse,
  isShowDetailResponse,
  isShowSeasonDetailResponse,
} from "./guards";
import type {
  CatalogDetailResponse,
  CatalogResolveResponse,
  CatalogSearchResponse,
  CatalogSearchResult,
  MediaType,
  ShowSeasonDetailResponse,
} from "./types";

export async function searchCatalog(
  accessToken: string | null,
  query: string,
  mediaTypes: MediaType[],
): Promise<CatalogSearchResponse> {
  const params = new URLSearchParams({
    page: "1",
    query,
    types: mediaTypes.join(","),
  });

  return fetchJson(
    `/search?${params.toString()}`,
    isCatalogSearchResponse,
    "Unexpected search response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function resolveCatalogItem(
  accessToken: string | null,
  result: CatalogSearchResult,
): Promise<CatalogResolveResponse> {
  return fetchJson(
    "/catalog/resolve",
    isCatalogResolveResponse,
    "Unexpected resolve response",
    {
      body: JSON.stringify({
        mediaType: result.mediaType,
        provider: result.externalRef.provider,
        providerId: result.externalRef.providerId,
      }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function getCatalogDetail(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<CatalogDetailResponse> {
  if (mediaType === "show") {
    const show = await fetchJson(
      `/shows/${id}`,
      isShowDetailResponse,
      "Unexpected show detail response",
      { headers: getAuthHeaders(accessToken) },
    );

    return { ...show, mediaType };
  }

  const movie = await fetchJson(
    `/movies/${id}`,
    isMovieDetailResponse,
    "Unexpected movie detail response",
    { headers: getAuthHeaders(accessToken) },
  );

  return { ...movie, mediaType };
}

export async function getShowSeasonDetail(
  accessToken: string | null,
  showId: string,
  seasonNumber: number,
): Promise<ShowSeasonDetailResponse> {
  return fetchJson(
    `/shows/${showId}/seasons/${seasonNumber}`,
    isShowSeasonDetailResponse,
    "Unexpected season detail response",
    { headers: getAuthHeaders(accessToken) },
  );
}
