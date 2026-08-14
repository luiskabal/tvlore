import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import type { MediaType } from "../api/tvlore-api";
import { CatalogDetailContent, CatalogDetailSkeleton } from "./CatalogDetailContent";
import { styles } from "./catalog-detail-styles";
import { useCatalogDetail } from "./use-catalog-detail";

export default function CatalogDetailScreen({ mediaType }: { mediaType: MediaType }) {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const { refresh, setMovieWatched, state, watchAction } = useCatalogDetail(mediaType, id);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        {state.kind === "loading" ? (
          <CatalogDetailSkeleton mediaType={mediaType} />
        ) : null}

        {state.kind === "error" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusTitle}>Could not open title</Text>
            <Text style={styles.mutedText}>{state.message}</Text>
            <Pressable style={styles.primaryButton} onPress={refresh}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <CatalogDetailContent
            detail={state.detail}
            onOpenShowSeason={openShowSeason}
            onSetMovieWatched={setMovieWatched}
            watchAction={watchAction}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function openShowSeason(showId: string, seasonNumber: number) {
  router.push({
    pathname: "/shows/[id]/seasons/[seasonNumber]",
    params: { id: showId, seasonNumber: seasonNumber.toString() },
  });
}
