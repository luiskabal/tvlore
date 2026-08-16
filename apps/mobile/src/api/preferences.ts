import { fetchMutationJson, getAuthHeaders, getMediaPath } from "./client";
import { isPreferenceMutationResponse } from "./guards";
import type { MediaType, PreferenceMutationResponse } from "./types";

export async function setPreferenceRating(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
  rating: number,
): Promise<PreferenceMutationResponse> {
  return fetchMutationJson(
    `/${getMediaPath(mediaType, id)}/preference`,
    isPreferenceMutationResponse,
    "Unexpected preference response",
    {
      body: JSON.stringify({ rating }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "PUT",
    },
  );
}

export async function clearPreferenceRating(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
): Promise<PreferenceMutationResponse> {
  return fetchMutationJson(
    `/${getMediaPath(mediaType, id)}/preference`,
    isPreferenceMutationResponse,
    "Unexpected preference response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}

export async function setEpisodePreferenceRating(
  accessToken: string | null,
  episodeId: string,
  rating: number,
): Promise<PreferenceMutationResponse> {
  return fetchMutationJson(
    `/episodes/${episodeId}/preference`,
    isPreferenceMutationResponse,
    "Unexpected preference response",
    {
      body: JSON.stringify({ rating }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "PUT",
    },
  );
}

export async function clearEpisodePreferenceRating(
  accessToken: string | null,
  episodeId: string,
): Promise<PreferenceMutationResponse> {
  return fetchMutationJson(
    `/episodes/${episodeId}/preference`,
    isPreferenceMutationResponse,
    "Unexpected preference response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}
