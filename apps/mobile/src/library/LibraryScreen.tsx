import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { isSupabaseConfigured } from "../auth/supabase-auth";
import { LibraryOverview, LibraryOverviewSkeleton } from "../home/LibraryOverview";
import { styles } from "../home/home-styles";
import { useHomeModel } from "../home/use-home-model";
import { useLibraryChronology } from "./use-library-chronology";
import { useLibraryActions } from "./use-library-actions";
import { useLibraryLookahead } from "./use-library-lookahead";

export default function LibraryScreen() {
  const { libraryAction, removeRecentlyWatchedItem, removeWatchlistItem } = useLibraryActions();
  const { chronology, loadInitialChronology, loadMoreChronology } = useLibraryChronology();
  const {
    auth,
    authActionMessage,
    continueWithGoogle,
    home,
    homeData,
    isAuthActionRunning,
  } = useHomeModel({ includeRecommendations: false });
  const isSignedIn = auth.kind === "signedIn";

  useLibraryLookahead(homeData?.library ?? null, isSignedIn);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      {homeData?.user ? (
        <View style={styles.fixedContent}>
          <LibraryHeader showSearchButton={isSignedIn} />
          <LibraryOverview
            chronology={chronology}
            library={homeData.library}
            libraryAction={libraryAction}
            onChronologyVisible={loadInitialChronology}
            onLoadMoreChronology={loadMoreChronology}
            onOpenMovie={openMovie}
            onOpenEpisode={openEpisode}
            onOpenShow={openShow}
            onOpenShowSeason={openShowSeason}
            onRemoveRecentlyWatchedItem={removeRecentlyWatchedItem}
            onRemoveWatchlistItem={removeWatchlistItem}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <LibraryHeader showSearchButton={isSignedIn} />

          {home.kind === "loading" ? (
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
      )}
    </SafeAreaView>
  );
}

function LibraryHeader({ showSearchButton }: { showSearchButton: boolean }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>Pick up where you left off.</Text>
      </View>
      {showSearchButton ? (
        <Pressable style={styles.iconButton} onPress={() => router.push("/search")}>
          <Text style={styles.iconButtonText}>+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function openMovie(id: string) {
  router.push({ pathname: "/movies/[id]", params: { id } });
}

function openEpisode(id: string) {
  router.push({ pathname: "/episodes/[id]", params: { id } });
}

function openShow(id: string) {
  router.push({ pathname: "/shows/[id]", params: { id } });
}

function openShowSeason(showId: string, seasonNumber: number) {
  router.push({
    pathname: "/shows/[id]/seasons/[seasonNumber]",
    params: { id: showId, seasonNumber: String(seasonNumber) },
  });
}
