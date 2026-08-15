import { fetchJson, getAuthHeaders } from "./client";
import { isLibraryChronologyResponse } from "./guards";
import type { LibraryChronologyResponse } from "./types";

export async function getLibraryChronology(
  accessToken: string | null,
  options: { cursor?: string | null; limit?: number } = {},
): Promise<LibraryChronologyResponse> {
  const params = new URLSearchParams();

  if (options.limit) {
    params.set("limit", String(options.limit));
  }

  if (options.cursor) {
    params.set("cursor", options.cursor);
  }

  const query = params.toString();

  return fetchJson(
    `/library/chronology${query ? `?${query}` : ""}`,
    isLibraryChronologyResponse,
    "Unexpected library chronology response",
    { headers: getAuthHeaders(accessToken) },
  );
}
