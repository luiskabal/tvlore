import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { AppText, BackButton, Button, EmptyState, MediaRowSkeleton, PageHeader, Screen, ScreenScroll, ui } from "../ui";
import { SearchResultRow } from "./SearchResults";
import { styles } from "./search-styles";
import { useCatalogSearch } from "./use-catalog-search";
import { usePopularDiscovery } from "./use-popular-discovery";

export default function PopularDiscoveryScreen() {
  const { resolveResult, resolveState } = useCatalogSearch();
  const { popular, popularState, retryPopular } = usePopularDiscovery();

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
          subtitle={`Streaming-aware titles for ${popular?.country ?? "your saved country"}.`}
          title="Popular in your country"
        />

        {popularState.kind === "loading" || popularState.kind === "idle" ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((item) => (
              <MediaRowSkeleton key={item} lines={4} size="search" />
            ))}
          </View>
        ) : null}

        {popularState.kind === "error" ? (
          <EmptyState
            action={<Button icon="refresh" label="Retry" onPress={retryPopular} size="small" />}
            detail={popularState.message}
            icon="trending-up-outline"
            title="Popular titles unavailable"
          />
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
              <EmptyState
                detail="Try changing your availability country from Profile."
                icon="location-outline"
                title="No popular titles yet"
              />
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
          <EmptyState
            detail="Tvlore uses your saved country to shape this list."
            icon="lock-closed-outline"
            title="Sign in to see popular titles"
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
