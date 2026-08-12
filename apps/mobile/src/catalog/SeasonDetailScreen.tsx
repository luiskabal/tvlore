import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { SeasonContent } from "./SeasonContent";
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
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        {state.kind === "loading" ? (
          <View style={styles.centerPanel}>
            <ActivityIndicator color="#1f7a5c" />
            <Text style={styles.mutedText}>Loading season</Text>
          </View>
        ) : null}

        {state.kind === "error" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusTitle}>Could not open season</Text>
            <Text style={styles.mutedText}>{state.message}</Text>
            <Pressable style={styles.primaryButton} onPress={refresh}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <SeasonContent
            onSetEpisodeWatched={setEpisodeWatched}
            onSetSeasonWatched={setSeasonWatched}
            season={state.detail}
            showProgress={state.showProgress}
            watchAction={watchAction}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function parseSeasonNumber(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}
