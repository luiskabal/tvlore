import { apiBaseUrl } from "../config/env";
import type { MediaType } from "./types";

export async function fetchJson<T>(
  path: string,
  guard: (value: unknown) => value is T,
  errorMessage: string,
  options?: RequestInit,
) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  const body: unknown = await response.json();

  if (!response.ok || !guard(body)) {
    throw new Error(errorMessage);
  }

  return body;
}

export function getAuthHeaders(accessToken: string | null) {
  if (!accessToken) {
    throw new Error("Sign in required");
  }

  return { Authorization: `Bearer ${accessToken}` };
}

export function getMediaPath(mediaType: MediaType, id: string) {
  return mediaType === "show" ? `shows/${id}` : `movies/${id}`;
}
