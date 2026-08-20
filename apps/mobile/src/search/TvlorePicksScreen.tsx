import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { AppText, Button, Skeleton, ui } from "../ui";
import { SearchResultRow } from "./SearchResults";
import { styles } from "./search-styles";
import { useCatalogSearch } from "./use-catalog-search";
import { useTvlorePicks } from "./use-tvlore-picks";

export default function TvlorePicksScreen() {
  const { resolveResult, resolveState } = useCatalogSearch();
  const { picks, picksState, retryPicks } = useTvlorePicks();

  const openResult = async (result: CatalogSearchResult) => {
    const item = await resolveResult(result);

    if (item) {
      pushDetail(item.mediaType, item.id);
      return;
    }

    if (result.tvloreId) {
      pushDetail(result.mediaType, result.tvloreId);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <AppText tone="accent" variant="caption">Back</AppText>
          </Pressable>
          <AppText style={styles.title}>TVLore Picks</AppText>
          <AppText style={styles.subtitle} tone="muted">
            Curated shows and movies from the TVLore shelf.
          </AppText>
        </View>

        {picksState.kind === "loading" || picksState.kind === "idle" ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((item) => (
              <View key={item} style={styles.skeletonRow}>
                <Skeleton height={112} width={76} />
                <View style={styles.skeletonBody}>
                  <Skeleton height={22} width="70%" />
                  <Skeleton height={24} radius={999} width={64} />
                  <Skeleton height={15} width="88%" />
                  <Skeleton height={15} width="74%" />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {picksState.kind === "error" ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">TVLore Picks unavailable</AppText>
            <AppText tone="muted">{picksState.message}</AppText>
            <Button label="Retry" onPress={retryPicks} size="small" />
          </View>
        ) : null}

        {picksState.kind === "ready" && picks ? (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <AppText style={styles.sectionTitle} variant="section">
                {picks.items.length} curated titles
              </AppText>
              {resolveState.kind === "loading" ? <ActivityIndicator color={ui.color.accent} size="small" /> : null}
            </View>

            {picks.items.map((result) => (
              <SearchResultRow
                key={`${result.mediaType}-${result.externalRef.provider}-${result.externalRef.providerId}`}
                result={result}
                resolveState={resolveState}
                onResolve={openResult}
              />
            ))}
          </View>
        ) : null}

        {picksState.kind === "ready" && !picks ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Sign in to see TVLore Picks</AppText>
            <AppText tone="muted">Curated titles are available after login.</AppText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function pushDetail(mediaType: MediaType, id: string) {
  if (mediaType === "show") {
    router.push({ pathname: "/shows/[id]", params: { id } });
    return;
  }

  router.push({ pathname: "/movies/[id]", params: { id } });
}
