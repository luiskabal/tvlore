import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

import { AppText, Button } from "../ui";
import { SeasonContent, SeasonDetailSkeleton } from "./SeasonContent";
import { styles } from "./season-detail-styles";
import { useSeasonDetail } from "./use-season-detail";

export default function SeasonDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; seasonNumber?: string | string[] }>();
  const showId = typeof params.id === "string" ? params.id : null;
  const seasonNumber = typeof params.seasonNumber === "string" ? parseSeasonNumber(params.seasonNumber) : null;
  const { refresh, setEpisodeWatched, setSeasonWatched, state, watchAction } = useSeasonDetail(showId, seasonNumber);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backButtonText}>Back</AppText>
        </Pressable>

        {state.kind === "loading" ? (
          <SeasonDetailSkeleton />
        ) : null}

        {state.kind === "error" ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Could not open season</AppText>
            <AppText tone="muted">{state.message}</AppText>
            <Button label="Retry" onPress={refresh} />
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <SeasonContent
            onSetEpisodeWatched={setEpisodeWatched}
            onSetSeasonWatched={setSeasonWatched}
            onOpenEpisode={openEpisode}
            onOpenShow={openShow}
            season={state.detail}
            showProgress={state.showProgress}
            watchAction={watchAction}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function openEpisode(episodeId: string) {
  router.push({
    pathname: "/episodes/[id]",
    params: { id: episodeId },
  });
}

function openShow(showId: string) {
  router.push({
    pathname: "/shows/[id]",
    params: { id: showId },
  });
}

function parseSeasonNumber(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}
