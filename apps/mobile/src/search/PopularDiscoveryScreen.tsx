import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { AppText, Button, Skeleton, ui } from "../ui";
import { SearchResultRow } from "./SearchResults";
import { styles } from "./search-styles";
import { useCatalogSearch } from "./use-catalog-search";
import { usePopularDiscovery } from "./use-popular-discovery";

export default function PopularDiscoveryScreen() {
  const { resolveResult, resolveState } = useCatalogSearch();
  const { popular, popularState, retryPopular } = usePopularDiscovery();

  const openResult = async (result: CatalogSearchResult) => {
    if (result.tvloreId) {
      pushDetail(result.mediaType, result.tvloreId);
      return;
    }

    const item = await resolveResult(result);

    if (!item) {
      return;
    }

    pushDetail(item.mediaType, item.id);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <AppText tone="accent" variant="caption">Back</AppText>
          </Pressable>
          <AppText style={styles.title}>Popular in your country</AppText>
          <AppText style={styles.subtitle} tone="muted">
            Streaming-aware titles for {popular?.country ?? "your saved country"}.
          </AppText>
        </View>

        {popularState.kind === "loading" || popularState.kind === "idle" ? (
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

        {popularState.kind === "error" ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Popular titles unavailable</AppText>
            <AppText tone="muted">{popularState.message}</AppText>
            <Button label="Retry" onPress={retryPopular} size="small" />
          </View>
        ) : null}

        {popularState.kind === "ready" && popular ? (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <AppText style={styles.sectionTitle} variant="section">
                {popular.items.length} titles in {popular.country}
              </AppText>
              {resolveState.kind === "loading" ? <ActivityIndicator color={ui.color.accent} size="small" /> : null}
            </View>

            {popular.items.length === 0 ? (
              <View style={styles.statusPanel}>
                <AppText variant="section">No popular titles yet</AppText>
                <AppText tone="muted">Try changing your availability country from Profile.</AppText>
              </View>
            ) : null}

            {popular.items.map((result) => (
              <SearchResultRow
                key={`${result.mediaType}-${result.externalRef.provider}-${result.externalRef.providerId}`}
                result={result}
                resolveState={resolveState}
                onResolve={openResult}
              />
            ))}
          </View>
        ) : null}

        {popularState.kind === "ready" && !popular ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Sign in to see popular titles</AppText>
            <AppText tone="muted">Tvlore uses your saved country to shape this list.</AppText>
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
