import { apiBaseUrl } from "../config/env";

export type HealthResponse = {
  service: string;
  status: string;
  time: string;
};

export type UserResponse = {
  createdAt: string;
  displayName: string;
  id: string;
};

export type LibraryResponse = {
  continueWatching: ContinueWatchingShow[];
  recentlyWatched: RecentlyWatchedItem[];
  summary: {
    watchedEpisodeCount: number;
    watchedMovieCount: number;
    watchedShowCount: number;
  };
};

export type ContinueWatchingShow = {
  id: string;
  mediaType: "show";
  nextEpisode: {
    episodeNumber: number;
    id: string;
    seasonNumber: number;
    title: string;
  };
  percentComplete: number;
  posterPath: string | null;
  title: string;
};

export type RecentlyWatchedItem =
  | {
      id: string;
      mediaType: "movie";
      posterPath: string | null;
      title: string;
      watchedAt: string;
    }
  | {
      episodeNumber: number;
      id: string;
      mediaType: "episode";
      seasonNumber: number;
      showId: string;
      showTitle: string;
      title: string;
      watchedAt: string;
    };

export type HomeData = {
  health: HealthResponse;
  library: LibraryResponse | null;
  user: UserResponse | null;
};

export async function getHomeData(accessToken: string | null): Promise<HomeData> {
  const health = await fetchJson("/health", isHealthResponse, "Unexpected API response");
  const user = accessToken
    ? await fetchJson(
        "/users/me",
        isUserResponse,
        "Unexpected current user response",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
    : null;
  const library = accessToken
    ? await fetchJson(
        "/library",
        isLibraryResponse,
        "Unexpected library response",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
    : null;

  return { health, library, user };
}

async function fetchJson<T>(
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

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.status === "string" &&
    typeof candidate.service === "string" &&
    typeof candidate.time === "string"
  );
}

function isUserResponse(value: unknown): value is UserResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.displayName === "string" &&
    typeof candidate.createdAt === "string"
  );
}

function isLibraryResponse(value: unknown): value is LibraryResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.summary) &&
    typeof value.summary.watchedEpisodeCount === "number" &&
    typeof value.summary.watchedMovieCount === "number" &&
    typeof value.summary.watchedShowCount === "number" &&
    Array.isArray(value.continueWatching) &&
    value.continueWatching.every(isContinueWatchingShow) &&
    Array.isArray(value.recentlyWatched) &&
    value.recentlyWatched.every(isRecentlyWatchedItem)
  );
}

function isContinueWatchingShow(value: unknown): value is ContinueWatchingShow {
  if (!isRecord(value) || !isRecord(value.nextEpisode)) {
    return false;
  }

  return (
    value.mediaType === "show" &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    isNullableString(value.posterPath) &&
    typeof value.percentComplete === "number" &&
    typeof value.nextEpisode.id === "string" &&
    typeof value.nextEpisode.title === "string" &&
    typeof value.nextEpisode.seasonNumber === "number" &&
    typeof value.nextEpisode.episodeNumber === "number"
  );
}

function isRecentlyWatchedItem(value: unknown): value is RecentlyWatchedItem {
  if (!isRecord(value)) {
    return false;
  }

  if (value.mediaType === "movie") {
    return (
      typeof value.id === "string" &&
      typeof value.title === "string" &&
      isNullableString(value.posterPath) &&
      typeof value.watchedAt === "string"
    );
  }

  return (
    value.mediaType === "episode" &&
    typeof value.id === "string" &&
    typeof value.showId === "string" &&
    typeof value.showTitle === "string" &&
    typeof value.title === "string" &&
    typeof value.seasonNumber === "number" &&
    typeof value.episodeNumber === "number" &&
    typeof value.watchedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNullableString(value: unknown) {
  return value === null || typeof value === "string";
}
