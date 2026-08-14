import { fetchJson, getAuthHeaders } from "./client";
import { isEpisodeWatchResponse, isMovieWatchResponse, isShowProgressResponse } from "./guards";
import type { EpisodeWatchResponse, MovieWatchResponse, ShowProgressResponse } from "./types";

export async function markEpisodeWatched(
  accessToken: string | null,
  episodeId: string,
): Promise<EpisodeWatchResponse> {
  return fetchJson(
    `/episodes/${episodeId}/watches`,
    isEpisodeWatchResponse,
    "Unexpected episode watch response",
    {
      body: JSON.stringify({ watchedAt: new Date().toISOString() }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function unmarkEpisodeWatched(
  accessToken: string | null,
  episodeId: string,
): Promise<EpisodeWatchResponse> {
  return fetchJson(
    `/episodes/${episodeId}/watches`,
    isEpisodeWatchResponse,
    "Unexpected episode unwatch response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}

export async function markShowWatched(
  accessToken: string | null,
  showId: string,
): Promise<ShowProgressResponse> {
  return fetchJson(
    `/shows/${showId}/watches`,
    isShowProgressResponse,
    "Unexpected show watch response",
    {
      body: JSON.stringify({ watchedAt: new Date().toISOString() }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function unmarkShowWatched(
  accessToken: string | null,
  showId: string,
): Promise<ShowProgressResponse> {
  return fetchJson(
    `/shows/${showId}/watches`,
    isShowProgressResponse,
    "Unexpected show unwatch response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}

export async function markMovieWatched(
  accessToken: string | null,
  movieId: string,
): Promise<MovieWatchResponse> {
  return fetchJson(
    `/movies/${movieId}/watches`,
    isMovieWatchResponse,
    "Unexpected movie watch response",
    {
      body: JSON.stringify({ watchedAt: new Date().toISOString() }),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
}

export async function unmarkMovieWatched(
  accessToken: string | null,
  movieId: string,
): Promise<MovieWatchResponse> {
  return fetchJson(
    `/movies/${movieId}/watches`,
    isMovieWatchResponse,
    "Unexpected movie unwatch response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}
