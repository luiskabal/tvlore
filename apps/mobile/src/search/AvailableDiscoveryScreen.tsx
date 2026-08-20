import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { AppText, BackButton, Button, EmptyState, MediaRowSkeleton, PageHeader, Screen, ScreenScroll, ui } from "../ui";
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
    <Screen>
      <ScreenScroll>
        <BackButton onPress={() => router.back()} />
        <PageHeader
          subtitle={`Highly rated titles available around ${available?.country ?? "your saved country"}.`}
          title="Available to stream"
        />

        {availableState.kind === "loading" || availableState.kind === "idle" ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((item) => (
              <MediaRowSkeleton key={item} lines={4} size="search" />
            ))}
          </View>
        ) : null}

        {availableState.kind === "error" ? (
          <EmptyState
            action={<Button icon="refresh" label="Retry" onPress={retryAvailable} size="small" />}
            detail={availableState.message}
            icon="tv-outline"
            title="Streamable titles unavailable"
          />
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
              <EmptyState
                detail="Try changing your availability country from Profile."
                icon="location-outline"
                title="No streamable titles yet"
              />
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
          <EmptyState
            detail="TVLore uses your saved country to shape this list."
            icon="lock-closed-outline"
            title="Sign in to see streamable titles"
          />
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

function pushDetail(mediaType: MediaType, id: string) {
  if (mediaType === "show") {
    router.push({ pathname: "/shows/[id]", params: { id } });
    return;
  }

  router.push({ pathname: "/movies/[id]", params: { id } });
}
