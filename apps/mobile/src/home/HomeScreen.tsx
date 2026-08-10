import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  getAuthRedirectUrl,
  isSupabaseConfigured,
  supabaseProjectUrl,
} from "../auth/supabase-auth";
import { useAuthSession, type AuthState } from "../auth/use-auth-session";
import { useHomeData } from "./use-home-data";

export default function HomeScreen() {
  const { home, refreshHome } = useHomeData();
  const {
    auth,
    authActionMessage,
    continueWithGoogle,
    isAuthActionRunning,
    signOut,
  } = useAuthSession(refreshHome);

  const statusLabel =
    home.kind === "ready" ? "API online" : home.kind === "offline" ? "API offline" : "Checking API";

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
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
          <Text style={styles.statusDetail}>{getAuthStatus(auth)}</Text>
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
            onPress={signOut}
          >
            <Text style={styles.secondaryButtonText}>
              {isAuthActionRunning ? "Signing out" : "Sign out"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={!isSupabaseConfigured || isAuthActionRunning}
            style={[styles.googleButton, !isSupabaseConfigured || isAuthActionRunning ? styles.disabledButton : null]}
            onPress={continueWithGoogle}
          >
            <Text style={styles.googleButtonText}>
              {isAuthActionRunning ? "Opening Google" : "Continue with Google"}
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.button} onPress={refreshHome}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function getAuthStatus(auth: AuthState) {
  if (auth.kind === "signedIn") {
    return `${auth.displayName ?? auth.email} is signed in`;
  }

  if (auth.kind === "signedOut") {
    return "No active Google session";
  }

  if (auth.kind === "loading") {
    return "Checking Supabase session";
  }

  return auth.kind === "unconfigured" ? "Missing Supabase config" : auth.message;
}

const styles = StyleSheet.create({
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
  content: {
    flexGrow: 1,
    gap: 20,
    justifyContent: "center",
    padding: 24,
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
  screen: {
    backgroundColor: "#f7f4ee",
    flex: 1,
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
  statusDetail: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 20,
  },
  statusLabel: {
    color: "#171412",
    fontSize: 18,
    fontWeight: "700",
  },
  statusPanel: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  subtitle: {
    color: "#4f4740",
    fontSize: 17,
    lineHeight: 24,
  },
  title: {
    color: "#171412",
    fontSize: 42,
    fontWeight: "800",
  },
});
