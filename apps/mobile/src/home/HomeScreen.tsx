import { router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import {
  getAuthRedirectUrl,
  isSupabaseConfigured,
  supabaseProjectUrl,
} from "../auth/supabase-auth";
import { useAuthSession, type AuthState } from "../auth/use-auth-session";
import { useLibraryRevision } from "../library/library-refresh";
import { LibraryOverview, LibraryOverviewSkeleton } from "./LibraryOverview";
import { styles } from "./home-styles";
import { useHomeData } from "./use-home-data";

export default function HomeScreen() {
  const { home, refreshHome } = useHomeData();
  const libraryRevision = useLibraryRevision();
  const pathname = usePathname();
  const {
    auth,
    authActionMessage,
    continueWithGoogle,
    isAuthActionRunning,
    signOut,
  } = useAuthSession(refreshHome);

  const homeData = home.kind === "ready" || home.kind === "refreshing" ? home : null;
  const statusLabel =
    homeData ? "API online" : home.kind === "offline" ? "API offline" : "Checking API";

  useEffect(() => {
    if (pathname === "/" || libraryRevision > 0) {
      void refreshHome();
    }
  }, [libraryRevision, pathname, refreshHome]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>TVLore</Text>
        <Text style={styles.subtitle}>Track what you watch. Discover what you share.</Text>

        {homeData?.user ? (
          <LibraryOverview
            avatarUrl={auth.kind === "signedIn" ? auth.avatarUrl : null}
            library={homeData.library}
            onOpenMovie={openMovie}
            onOpenShowSeason={openShowSeason}
            userName={homeData.user.displayName}
          />
        ) : home.kind === "loading" ? <LibraryOverviewSkeleton /> : null}

        {auth.kind === "signedIn" ? (
          <Pressable style={styles.button} onPress={() => router.push("/search")}>
            <Text style={styles.buttonText}>Search catalog</Text>
          </Pressable>
        ) : null}

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

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>
          <Text style={styles.statusDetail}>
            {homeData
              ? `${homeData.health.service} responded at ${new Date(homeData.health.time).toLocaleTimeString()}`
              : home.kind === "offline"
                ? home.message
                : "Waiting for the backend"}
          </Text>
          <Text style={styles.statusDetail}>
            {isSupabaseConfigured ? `Supabase: ${supabaseProjectUrl}` : "Supabase missing config"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function openMovie(id: string) {
  router.push({ pathname: "/movies/[id]", params: { id } });
}

function openShowSeason(showId: string, seasonNumber: number) {
  router.push({
    pathname: "/shows/[id]/seasons/[seasonNumber]",
    params: { id: showId, seasonNumber: String(seasonNumber) },
  });
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
