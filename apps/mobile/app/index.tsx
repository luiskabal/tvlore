import type { Session } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import {
  getAuthRedirectUrl,
  getSupabaseAccessToken,
  isSupabaseConfigured,
  signInWithGoogle,
  signOut,
  supabase,
  supabaseProjectUrl,
} from "../lib/supabase";

type HealthResponse = {
  status: string;
  service: string;
  time: string;
};

type UserResponse = {
  id: string;
  displayName: string;
  createdAt: string;
};

type HomeState =
  | { kind: "loading" }
  | { kind: "ready"; health: HealthResponse; user: UserResponse | null }
  | { kind: "offline"; message: string };

type AuthState =
  | { kind: "loading" }
  | { kind: "unconfigured" }
  | { kind: "signedOut" }
  | { kind: "signedIn"; userId: string; email: string; displayName: string | null }
  | { kind: "error"; message: string };

function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_TVLORE_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (expoHost) {
    return `http://${expoHost}:3000`;
  }

  return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
}

const apiBaseUrl = getApiBaseUrl();

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

function getStringMetadata(session: Session, key: string) {
  const value = session.user.user_metadata[key];

  return typeof value === "string" ? value : null;
}

function getAuthStateFromSession(session: Session | null): AuthState {
  if (!session) {
    return { kind: "signedOut" };
  }

  return {
    kind: "signedIn",
    userId: session.user.id,
    email: session.user.email ?? "No email",
    displayName: getStringMetadata(session, "name") ?? getStringMetadata(session, "full_name"),
  };
}

export default function HomeScreen() {
  const [home, setHome] = useState<HomeState>({ kind: "loading" });
  const [auth, setAuth] = useState<AuthState>(
    isSupabaseConfigured ? { kind: "loading" } : { kind: "unconfigured" },
  );
  const [authActionMessage, setAuthActionMessage] = useState<string | null>(null);
  const [isAuthActionRunning, setIsAuthActionRunning] = useState(false);

  const refreshHome = useCallback(async () => {
    setHome({ kind: "loading" });

    try {
      const healthResponse = await fetch(`${apiBaseUrl}/health`);
      const healthBody: unknown = await healthResponse.json();

      if (!healthResponse.ok || !isHealthResponse(healthBody)) {
        throw new Error("Unexpected API response");
      }

      const token = await getSupabaseAccessToken();
      let user: UserResponse | null = null;

      if (token) {
        const userResponse = await fetch(`${apiBaseUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userBody: unknown = await userResponse.json();

        if (!userResponse.ok || !isUserResponse(userBody)) {
          throw new Error("Unexpected current user response");
        }

        user = userBody;
      }

      setHome({ kind: "ready", health: healthBody, user });
    } catch (error) {
      setHome({
        kind: "offline",
        message: error instanceof Error ? error.message : "Unknown API error",
      });
    }
  }, []);

  useEffect(() => {
    void refreshHome();
  }, [refreshHome]);

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
        void refreshHome();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshHome]);

  const handleGoogleSignIn = useCallback(async () => {
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

  const handleSignOut = useCallback(async () => {
    setAuthActionMessage(null);
    setIsAuthActionRunning(true);

    try {
      await signOut();
    } catch (error) {
      setAuthActionMessage(error instanceof Error ? error.message : "Sign out failed");
    } finally {
      setIsAuthActionRunning(false);
    }
  }, []);

  const statusLabel =
    home.kind === "ready" ? "API online" : home.kind === "offline" ? "API offline" : "Checking API";
  const authStatus =
    auth.kind === "signedIn"
      ? `${auth.displayName ?? auth.email} is signed in`
      : auth.kind === "signedOut"
        ? "No active Google session"
        : auth.kind === "loading"
          ? "Checking Supabase session"
          : auth.kind === "unconfigured"
            ? "Missing Supabase config"
            : auth.message;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>TVLore</Text>
        <Text style={styles.subtitle}>Track what you watch. Discover what you share.</Text>

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>
          <Text style={styles.statusDetail}>
            {home.kind === "ready"
              ? `${home.health.service} responded at ${new Date(home.health.time).toLocaleTimeString()}`
              : home.kind === "offline"
                ? home.message
                : "Waiting for the backend"}
          </Text>
        </View>

        {home.kind === "ready" && home.user ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>{home.user.displayName}</Text>
            <Text style={styles.statusDetail}>User ID: {home.user.id}</Text>
          </View>
        ) : null}

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>
            {isSupabaseConfigured ? "Supabase configured" : "Supabase missing config"}
          </Text>
          <Text style={styles.statusDetail}>{supabaseProjectUrl}</Text>
        </View>

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Google auth</Text>
          <Text style={styles.statusDetail}>{authStatus}</Text>
          <Text style={styles.statusDetail}>Redirect: {getAuthRedirectUrl()}</Text>
          {auth.kind === "signedIn" ? (
            <Text style={styles.statusDetail}>Supabase user ID: {auth.userId}</Text>
          ) : null}
          {authActionMessage ? <Text style={styles.errorText}>{authActionMessage}</Text> : null}
        </View>

        {auth.kind === "signedIn" ? (
          <Pressable
            disabled={isAuthActionRunning}
            style={[styles.secondaryButton, isAuthActionRunning ? styles.disabledButton : null]}
            onPress={handleSignOut}
          >
            <Text style={styles.secondaryButtonText}>
              {isAuthActionRunning ? "Signing out" : "Sign out"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={!isSupabaseConfigured || isAuthActionRunning}
            style={[styles.googleButton, !isSupabaseConfigured || isAuthActionRunning ? styles.disabledButton : null]}
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.googleButtonText}>
              {isAuthActionRunning ? "Opening Google" : "Continue with Google"}
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.button} onPress={refreshHome}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f4ee",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  title: {
    color: "#171412",
    fontSize: 42,
    fontWeight: "800",
  },
  subtitle: {
    color: "#4f4740",
    fontSize: 17,
    lineHeight: 24,
  },
  statusPanel: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statusLabel: {
    color: "#171412",
    fontSize: 18,
    fontWeight: "700",
  },
  statusDetail: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#1f7a5c",
    borderRadius: 8,
    minWidth: 120,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: "#9c2f23",
    fontSize: 14,
    lineHeight: 20,
  },
  googleButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 190,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  googleButtonText: {
    color: "#171412",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#171412",
    borderRadius: 8,
    minWidth: 120,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
