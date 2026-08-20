import { fetchCachedJson, fetchJson, fetchMutationJson, getAuthHeaders } from "./client";
import { isAccountDeletionStatusResponse, isDeleteUserResponse, isUserResponse } from "./guards";
import type { AccountDeletionStatusResponse, DeleteUserResponse, UserResponse } from "./types";

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

export async function deleteCurrentUser(accessToken: string | null): Promise<DeleteUserResponse> {
  return fetchMutationJson(
    "/users/me",
    isDeleteUserResponse,
    "Unexpected account deletion response",
    {
      headers: getAuthHeaders(accessToken),
      method: "DELETE",
    },
  );
}

export async function getAccountDeletionStatus(
  accessToken: string | null,
): Promise<AccountDeletionStatusResponse> {
  return fetchJson(
    "/users/me/account-deletion",
    isAccountDeletionStatusResponse,
    "Unexpected account deletion status response",
    { headers: getAuthHeaders(accessToken) },
  );
}
