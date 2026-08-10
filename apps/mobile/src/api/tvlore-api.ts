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

export type HomeData = {
  health: HealthResponse;
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

  return { health, user };
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
