import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { AppText, BackButton, Button, EmptyState, MediaRowSkeleton, PageHeader, Screen, ScreenScroll, ui } from "../ui";
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
    <Screen>
      <ScreenScroll>
        <BackButton onPress={() => router.back()} />
        <PageHeader
          subtitle="Curated shows and movies from the TVLore shelf."
          title="TVLore Picks"
        />

        {picksState.kind === "loading" || picksState.kind === "idle" ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((item) => (
              <MediaRowSkeleton key={item} lines={4} size="search" />
            ))}
          </View>
        ) : null}

        {picksState.kind === "error" ? (
          <EmptyState
            action={<Button icon="refresh" label="Retry" onPress={retryPicks} size="small" />}
            detail={picksState.message}
            icon="sparkles-outline"
            title="TVLore Picks unavailable"
          />
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
          <EmptyState
            detail="Curated titles are available after login."
            icon="lock-closed-outline"
            title="Sign in to see TVLore Picks"
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
