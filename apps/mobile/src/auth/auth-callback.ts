export type AuthCallbackSession = {
  accessToken: string;
  refreshToken: string;
};

const authCallbackPath = "auth/callback";

export function isAuthCallbackUrl(url: string) {
  return getDeepLinkPath(url) === authCallbackPath;
}

export function extractSessionFromAuthCallbackUrl(url: string): AuthCallbackSession | null {
  if (!isAuthCallbackUrl(url)) {
    return null;
  }

  const parsedUrl = new URL(url);
  const hashParams = parsedUrl.hash.startsWith("#") ? parsedUrl.hash.slice(1) : "";
  const queryParams = parsedUrl.search.startsWith("?") ? parsedUrl.search.slice(1) : "";
  const params = new URLSearchParams(hashParams || queryParams);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

function getDeepLinkPath(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "tvlore:") {
      return null;
    }

    const hostname = parsedUrl.hostname.replace(/^\/+|\/+$/g, "");
    const pathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");

    return [hostname, pathname].filter(Boolean).join("/");
  } catch {
    return null;
  }
}
