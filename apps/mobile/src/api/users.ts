import { fetchCachedJson, fetchMutationJson, getAuthHeaders } from "./client";
import { isUserResponse } from "./guards";
import type { UserResponse } from "./types";

export async function getCurrentUser(accessToken: string | null): Promise<UserResponse> {
  return fetchCachedJson(
    "/users/me",
    isUserResponse,
    "Unexpected current user response",
    { headers: getAuthHeaders(accessToken) },
  );
}

export async function updateCurrentUser(
  accessToken: string | null,
  input: { availabilityCountry: string },
): Promise<UserResponse> {
  return fetchMutationJson(
    "/users/me",
    isUserResponse,
    "Unexpected user update response",
    {
      body: JSON.stringify(input),
      headers: {
        ...getAuthHeaders(accessToken),
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );
}
