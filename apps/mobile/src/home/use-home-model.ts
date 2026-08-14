import { useEffect } from "react";

import { useAuthSession, type AuthState } from "../auth/use-auth-session";
import { useLibraryRevision } from "../library/library-refresh";
import { useHomeData, type HomeState } from "./use-home-data";

export function useHomeModel(options: { includeRecommendations?: boolean } = {}) {
  const { home, refreshHome } = useHomeData(options);
  const libraryRevision = useLibraryRevision();
  const authSession = useAuthSession(refreshHome);
  const homeData = home.kind === "ready" || home.kind === "refreshing" ? home : null;
  const backendStatus = getBackendStatus(home, authSession.auth);

  useEffect(() => {
    void refreshHome();
  }, [libraryRevision, refreshHome]);

  return {
    ...authSession,
    backendStatus,
    home,
    homeData,
    refreshHome,
  };
}

function getBackendStatus(home: HomeState, auth: AuthState) {
  if (home.kind === "offline") {
    return { detail: home.message, label: "API offline" };
  }

  if (auth.kind === "loading") {
    return { detail: "Waiting for Supabase session", label: "Backend pending" };
  }

  if (auth.kind === "signedOut") {
    return { detail: "Sign in to load your TVLore profile", label: "Backend idle" };
  }

  if (auth.kind === "unconfigured") {
    return { detail: "Configure Supabase to load backend data", label: "Backend idle" };
  }

  if (home.kind === "ready" || home.kind === "refreshing") {
    return home.user
      ? { detail: "Loaded your profile and library", label: "Backend ready" }
      : { detail: "Waiting for authenticated backend data", label: "Backend pending" };
  }

  return { detail: "Loading your TVLore profile", label: "Backend loading" };
}
