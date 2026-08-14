import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { isSupabaseConfigured } from "../auth/supabase-auth";
import { HoloProfileCard } from "../home/HoloProfileCard";
import { LibraryOverviewSkeleton } from "../home/LibraryOverview";
import { RecommendationsPanel } from "../home/RecommendationsPanel";
import { styles } from "../home/home-styles";
import { useHomeModel } from "../home/use-home-model";
import { useRecommendationActions } from "../home/use-recommendation-actions";

export default function ProfileScreen() {
  const { recommendationAction, saveRecommendation } = useRecommendationActions();
  const {
    auth,
    authActionMessage,
    backendStatus,
    continueWithGoogle,
    home,
    homeData,
    isAuthActionRunning,
    signOut,
  } = useHomeModel();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your watching identity.</Text>
        </View>

        {homeData?.user && homeData.library ? (
          <HoloProfileCard
            avatarUrl={auth.kind === "signedIn" ? auth.avatarUrl : null}
            library={homeData.library}
            userName={homeData.user.displayName}
          />
        ) : home.kind === "loading" ? (
          <LibraryOverviewSkeleton />
        ) : (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>Sign in with Google</Text>
            <Text style={styles.statusDetail}>Create your TVLore profile and keep it synced.</Text>
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

        {homeData?.user ? (
          <RecommendationsPanel
            onOpenMovie={openMovie}
            onOpenShow={openShow}
            onSaveToWatchlist={saveRecommendation}
            recommendationAction={recommendationAction}
            recommendations={homeData.recommendations}
          />
        ) : null}

        {auth.kind === "signedIn" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>Account</Text>
            <Text style={styles.statusDetail}>{auth.displayName ?? auth.email}</Text>
            <Text style={styles.statusDetail}>{backendStatus.detail}</Text>
          </View>
        ) : null}

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
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function openMovie(id: string) {
  router.push({ pathname: "/movies/[id]", params: { id } });
}

function openShow(id: string) {
  router.push({ pathname: "/shows/[id]", params: { id } });
}
