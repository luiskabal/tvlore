import { fetchJson, getAuthHeaders, getMediaPath } from "./client";
import { isPreferenceMutationResponse } from "./guards";
import type { MediaType, PreferenceMutationResponse } from "./types";

export async function setPreferenceRating(
  accessToken: string | null,
  mediaType: MediaType,
  id: string,
  rating: number,
): Promise<PreferenceMutationResponse> {
  return fetchJson(
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
  return fetchJson(
    `/${getMediaPath(mediaType, id)}/preference`,
    isPreferenceMutationResponse,
    "Unexpected preference response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}
