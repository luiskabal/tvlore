export function getBearerToken(authorizationHeader: string | undefined) {
  const parts = authorizationHeader?.trim().split(/\s+/) ?? [];

  if (parts.length !== 2) {
    return null;
  }

  const [scheme, token] = parts;

  return scheme.toLowerCase() === "bearer" ? token : null;
}
