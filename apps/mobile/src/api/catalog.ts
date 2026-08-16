import { fetchCachedJson, fetchJson, fetchMutationJson, getAuthHeaders } from "./client";
import {
  isCatalogResolveResponse,
  isCatalogSearchResponse,
  isMovieDetailResponse,
  isShowDetailResponse,
  isShowSeasonDetailResponse,
  isWatchProvidersResponse,
} from "./guards";
import type {
  CatalogDetailResponse,
  CatalogResolveResponse,
  CatalogSearchResponse,
  CatalogSearchResult,
  MediaType,
  ShowSeasonDetailResponse,
  WatchProvidersResponse,
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

  return fetchCachedJson(
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
    const show = await fetchCachedJson(
      `/shows/${id}`,
      isShowDetailResponse,
      "Unexpected show detail response",
      { headers: getAuthHeaders(accessToken) },
    );

    return { ...show, mediaType };
  }

  const movie = await fetchCachedJson(
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
  return fetchCachedJson(
    `/shows/${showId}/seasons/${seasonNumber}`,
    isShowSeasonDetailResponse,
    "Unexpected season detail response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function getWatchProviders(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
  country: string,
): Promise<WatchProvidersResponse> {
  const params = new URLSearchParams({ country });
  const path = mediaType === "show" ? `/shows/${id}/watch-providers` : `/movies/${id}/watch-providers`;

  return fetchCachedJson(
    `${path}?${params.toString()}`,
    isWatchProvidersResponse,
    "Unexpected watch providers response",
    { headers: getAuthHeaders(accessToken) },
  );
}
