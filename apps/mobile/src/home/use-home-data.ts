import { useCallback, useState } from "react";

import { getHomeData, type HealthResponse, type LibraryResponse, type UserResponse } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";

export type HomeState =
  | { kind: "loading" }
  | { health: HealthResponse; kind: "ready"; library: LibraryResponse | null; user: UserResponse | null }
  | { kind: "offline"; message: string };

export function useHomeData() {
  const [home, setHome] = useState<HomeState>({ kind: "loading" });

  const refreshHome = useCallback(async () => {
    setHome({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const homeData = await getHomeData(token);

      setHome({ kind: "ready", ...homeData });
    } catch (error) {
      setHome({
        kind: "offline",
        message: error instanceof Error ? error.message : "Unknown API error",
      });
    }
  }, []);

  return { home, refreshHome };
}
