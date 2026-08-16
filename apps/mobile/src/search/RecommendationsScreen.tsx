import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

import { RecommendationsPanel } from "../home/RecommendationsPanel";
import { AppText, Button, Skeleton } from "../ui";
import { styles } from "./search-styles";
import { useSearchRecommendations } from "./use-search-recommendations";

export default function RecommendationsScreen() {
  const { recommendations, recommendationsState, retryRecommendations } = useSearchRecommendations();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <AppText tone="accent" variant="caption">Back</AppText>
          </Pressable>
          <AppText style={styles.title}>Recommended picks</AppText>
          <AppText style={styles.subtitle} tone="muted">Suggestions shaped by your ratings and saved country.</AppText>
        </View>

        {recommendationsState.kind === "loading" || recommendationsState.kind === "idle" ? (
          <View style={styles.recommendationsSkeleton}>
            <Skeleton height={86} />
            <Skeleton height={86} />
            <Skeleton height={86} />
          </View>
        ) : null}

        {recommendationsState.kind === "error" ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Recommendations unavailable</AppText>
            <AppText tone="muted">{recommendationsState.message}</AppText>
            <Button label="Retry" onPress={retryRecommendations} size="small" />
          </View>
        ) : null}

        {recommendationsState.kind === "ready" && recommendations ? (
          <RecommendationsPanel
            onOpenMovie={openMovie}
            onOpenShow={openShow}
            recommendations={recommendations}
          />
        ) : null}

        {recommendationsState.kind === "ready" && !recommendations ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Sign in to see recommendations</AppText>
            <AppText tone="muted">Tvlore needs your ratings and watch history before suggesting titles.</AppText>
          </View>
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
