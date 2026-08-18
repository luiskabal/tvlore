import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import {
  getIsAppleSignInAvailable,
  isSupabaseConfigured,
  signInWithApple,
  signInWithGoogle,
  signOut as signOutFromSupabase,
  supabase,
} from "./supabase-auth";

export type AuthState =
  | { kind: "loading" }
  | { kind: "unconfigured" }
  | { kind: "signedOut" }
  | { avatarUrl: string | null; kind: "signedIn"; displayName: string | null; email: string; userId: string }
  | { kind: "error"; message: string };

export function useAuthSession(onSessionChange: () => void) {
  const [auth, setAuth] = useState<AuthState>(
    isSupabaseConfigured ? { kind: "loading" } : { kind: "unconfigured" },
  );
  const [authActionMessage, setAuthActionMessage] = useState<string | null>(null);
  const [isAuthActionRunning, setIsAuthActionRunning] = useState(false);
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuth({ kind: "unconfigured" });
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      setAuth(error ? { kind: "error", message: error.message } : getAuthStateFromSession(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setAuth(getAuthStateFromSession(session));
        onSessionChange();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [onSessionChange]);

  useEffect(() => {
    let isMounted = true;

    void getIsAppleSignInAvailable().then((isAvailable) => {
      if (isMounted) {
        setIsAppleSignInAvailable(isAvailable);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const continueWithApple = useCallback(async () => {
    if (isAuthActionRunning) {
      return;
    }

    setAuthActionMessage(null);
    setIsAuthActionRunning(true);

    try {
      const completed = await signInWithApple();

      if (!completed) {
        setAuthActionMessage("Apple sign-in was cancelled");
      }
    } catch (error) {
      setAuthActionMessage(error instanceof Error ? error.message : "Apple sign-in failed");
    } finally {
      setIsAuthActionRunning(false);
    }
  }, [isAuthActionRunning]);

  const continueWithGoogle = useCallback(async () => {
    if (isAuthActionRunning) {
      return;
    }

    setAuthActionMessage(null);
    setIsAuthActionRunning(true);

    try {
      const completed = await signInWithGoogle();

      if (!completed) {
        setAuthActionMessage("Google sign-in was cancelled");
      }
    } catch (error) {
      setAuthActionMessage(error instanceof Error ? error.message : "Google sign-in failed");
    } finally {
      setIsAuthActionRunning(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthActionMessage(null);
    setIsAuthActionRunning(true);

    try {
      await signOutFromSupabase();
    } catch (error) {
      setAuthActionMessage(error instanceof Error ? error.message : "Sign out failed");
    } finally {
      setIsAuthActionRunning(false);
    }
  }, []);

  return {
    auth,
    authActionMessage,
    continueWithApple,
    continueWithGoogle,
    isAppleSignInAvailable,
    isAuthActionRunning,
    signOut,
  };
}

function getStringMetadata(session: Session, key: string) {
  const value = session.user.user_metadata[key];

  return typeof value === "string" ? value : null;
}

function getAuthStateFromSession(session: Session | null): AuthState {
  if (!session) {
    return { kind: "signedOut" };
  }

  return {
    avatarUrl: getStringMetadata(session, "avatar_url") ?? getStringMetadata(session, "picture"),
    displayName: getStringMetadata(session, "name") ?? getStringMetadata(session, "full_name"),
    email: session.user.email ?? "No email",
    kind: "signedIn",
    userId: session.user.id,
  };
}
