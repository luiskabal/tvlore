import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { isSupabaseConfigured } from "../auth/supabase-auth";
import { AppTabBar } from "../navigation/AppTabBar";
import { LibraryOverview, LibraryOverviewSkeleton } from "../home/LibraryOverview";
import { styles } from "../home/home-styles";
import { useHomeModel } from "../home/use-home-model";

export default function LibraryScreen() {
  const {
    auth,
    authActionMessage,
    continueWithGoogle,
    home,
    homeData,
    isAuthActionRunning,
  } = useHomeModel();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>Pick up where you left off.</Text>
          </View>
          {auth.kind === "signedIn" ? (
            <Pressable style={styles.iconButton} onPress={() => router.push("/search")}>
              <Text style={styles.iconButtonText}>+</Text>
            </Pressable>
          ) : null}
        </View>

        {homeData?.user ? (
          <LibraryOverview
            library={homeData.library}
            onOpenMovie={openMovie}
            onOpenShowSeason={openShowSeason}
          />
        ) : home.kind === "loading" ? (
          <LibraryOverviewSkeleton />
        ) : (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>Build your TVLore</Text>
            <Text style={styles.statusDetail}>Sign in to track movies, shows, and episodes.</Text>
            {authActionMessage ? <Text style={styles.errorText}>{authActionMessage}</Text> : null}
            <Pressable
              disabled={!isSupabaseConfigured || isAuthActionRunning}
              style={[styles.googleButton, !isSupabaseConfigured || isAuthActionRunning ? styles.disabledButton : null]}
              onPress={continueWithGoogle}
            >
              <Text style={styles.googleButtonText}>
                {isAuthActionRunning ? "Opening Google" : "Continue with Google"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      <AppTabBar active="library" />
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
