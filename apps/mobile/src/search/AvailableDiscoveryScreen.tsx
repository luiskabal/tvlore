import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { AppText, Button, Skeleton, ui } from "../ui";
import { SearchResultRow } from "./SearchResults";
import { styles } from "./search-styles";
import { useAvailableDiscovery } from "./use-available-discovery";
import { useCatalogSearch } from "./use-catalog-search";

export default function AvailableDiscoveryScreen() {
  const { resolveResult, resolveState } = useCatalogSearch();
  const { available, availableState, retryAvailable } = useAvailableDiscovery();

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
          <AppText style={styles.title}>Available to stream</AppText>
          <AppText style={styles.subtitle} tone="muted">
            Highly rated titles available around {available?.country ?? "your saved country"}.
          </AppText>
        </View>

        {availableState.kind === "loading" || availableState.kind === "idle" ? (
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

        {availableState.kind === "error" ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Streamable titles unavailable</AppText>
            <AppText tone="muted">{availableState.message}</AppText>
            <Button label="Retry" onPress={retryAvailable} size="small" />
          </View>
        ) : null}

        {availableState.kind === "ready" && available ? (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <AppText style={styles.sectionTitle} variant="section">
                {available.items.length} streamable titles in {available.country}
              </AppText>
              {resolveState.kind === "loading" ? <ActivityIndicator color={ui.color.accent} size="small" /> : null}
            </View>

            {available.items.length === 0 ? (
              <View style={styles.statusPanel}>
                <AppText variant="section">No streamable titles yet</AppText>
                <AppText tone="muted">Try changing your availability country from Profile.</AppText>
              </View>
            ) : null}

            {available.items.map((result) => (
              <SearchResultRow
                key={`${result.mediaType}-${result.externalRef.provider}-${result.externalRef.providerId}`}
                result={result}
                resolveState={resolveState}
                onResolve={openResult}
              />
            ))}
          </View>
        ) : null}

        {availableState.kind === "ready" && !available ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Sign in to see streamable titles</AppText>
            <AppText tone="muted">TVLore uses your saved country to shape this list.</AppText>
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
