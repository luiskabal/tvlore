import { fetchMutationJson, getAuthHeaders } from "./client";
import { isWatchReflectionResponse } from "./guards";
import type { MediaType, PreferenceMediaType, WatchReflectionInput, WatchReflectionResponse } from "./types";

export async function setWatchReflection(
  accessToken: string | null,
  mediaType: PreferenceMediaType,
  id: string,
  input: WatchReflectionInput,
): Promise<WatchReflectionResponse> {
  return fetchMutationJson(
    `/${getReflectionPath(mediaType, id)}/reflection`,
    isWatchReflectionResponse,
    "Unexpected reflection response",
    {
      body: JSON.stringify(input),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "PUT",
    },
  );
}

function getReflectionPath(mediaType: PreferenceMediaType, id: string) {
  if (mediaType === "episode") {
    return `episodes/${id}`;
  }

  return `${getMediaPath(mediaType)}/${id}`;
}

function getMediaPath(mediaType: MediaType) {
  return mediaType === "show" ? "shows" : "movies";
}
