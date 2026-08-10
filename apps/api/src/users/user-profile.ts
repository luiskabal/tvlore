import type { AuthenticatedUser } from "../auth/authenticated-user";

export function getDisplayName(user: AuthenticatedUser) {
  const name = getMetadataString(user.metadata, "name")
    ?? getMetadataString(user.metadata, "full_name")
    ?? getMetadataString(user.metadata, "user_name");

  if (name) {
    return name;
  }

  if (user.email) {
    return user.email;
  }

  return "TVLore User";
}

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}
