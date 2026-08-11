import type { AuthenticatedUser } from "./authenticated-user";

export function toAuthenticatedUser(value: unknown): AuthenticatedUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const user = value as Record<string, unknown>;

  if (typeof user.id !== "string") {
    return null;
  }

  return {
    email: typeof user.email === "string" ? user.email : null,
    id: user.id,
    metadata: getMetadata(user.user_metadata),
  };
}

function getMetadata(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}
