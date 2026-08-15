import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

import type { MediaType } from "../api/tvlore-api";
import { AppText, Button } from "../ui";
import { CatalogDetailContent, CatalogDetailSkeleton } from "./CatalogDetailContent";
import { styles } from "./catalog-detail-styles";
import { useCatalogDetail } from "./use-catalog-detail";

export default function CatalogDetailScreen({ mediaType }: { mediaType: MediaType }) {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const {
    preferenceAction,
    refresh,
    setInWatchlist,
    setMovieWatched,
    setRating,
    setShowWatched,
    state,
    watchAction,
    watchlistAction,
    watchProvidersState,
  } = useCatalogDetail(mediaType, id);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backButtonText}>Back</AppText>
        </Pressable>

        {state.kind === "loading" ? (
          <CatalogDetailSkeleton mediaType={mediaType} />
        ) : null}

        {state.kind === "error" ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Could not open title</AppText>
            <AppText tone="muted">{state.message}</AppText>
            <Button label="Retry" onPress={refresh} />
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <CatalogDetailContent
            detail={state.detail}
            onOpenShowSeason={openShowSeason}
            onSetInWatchlist={setInWatchlist}
            onSetMovieWatched={setMovieWatched}
            onSetRating={setRating}
            onSetShowWatched={setShowWatched}
            preferenceAction={preferenceAction}
            watchAction={watchAction}
            watchlistAction={watchlistAction}
            watchProvidersState={watchProvidersState}
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
