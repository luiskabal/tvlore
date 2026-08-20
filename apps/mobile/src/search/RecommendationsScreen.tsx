import { router } from "expo-router";
import { View } from "react-native";

import { RecommendationsPanel } from "../home/RecommendationsPanel";
import { AppText, BackButton, Button, EmptyState, MediaRowSkeleton, PageHeader, Screen, ScreenScroll } from "../ui";
import { styles } from "./search-styles";
import { useSearchRecommendations } from "./use-search-recommendations";

export default function RecommendationsScreen() {
  const { recommendations, recommendationsState, retryRecommendations } = useSearchRecommendations();

  return (
    <Screen>
      <ScreenScroll>
        <BackButton onPress={() => router.back()} />
        <PageHeader
          subtitle="Suggestions shaped by your ratings and saved country."
          title="Recommended picks"
        />

        {recommendationsState.kind === "loading" || recommendationsState.kind === "idle" ? (
          <View style={styles.recommendationsSkeleton}>
            <MediaRowSkeleton lines={2} />
            <MediaRowSkeleton lines={2} />
            <MediaRowSkeleton lines={2} />
          </View>
        ) : null}

        {recommendationsState.kind === "error" ? (
          <EmptyState
            action={<Button icon="refresh" label="Retry" onPress={retryRecommendations} size="small" />}
            detail={recommendationsState.message}
            icon="sparkles-outline"
            title="Recommendations unavailable"
          />
        ) : null}

        {recommendationsState.kind === "ready" && recommendations ? (
          <RecommendationsPanel
            onOpenMovie={openMovie}
            onOpenShow={openShow}
            recommendations={recommendations}
          />
        ) : null}

        {recommendationsState.kind === "ready" && !recommendations ? (
          <EmptyState
            detail="Tvlore needs your ratings and watch history before suggesting titles."
            icon="lock-closed-outline"
            title="Sign in to see recommendations"
          />
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

function openMovie(id: string) {
  router.push({ pathname: "/movies/[id]", params: { id } });
}

function openShow(id: string) {
  router.push({ pathname: "/shows/[id]", params: { id } });
}
