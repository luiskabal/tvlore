import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, View, type ListRenderItemInfo } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { AppText, ui } from "../ui";
import { SearchControls } from "./SearchControls";
import { SearchAvailable } from "./SearchAvailable";
import { SearchPopular } from "./SearchPopular";
import { SearchPicks } from "./SearchPicks";
import { SearchRecommendations } from "./SearchRecommendations";
import {
  LoadingStrip,
  SearchInlineRecommendationRow,
  SearchResultRow,
  SearchSkeleton,
} from "./SearchResults";
import {
  getSearchFeedItems,
  type SearchFeedItem,
  type SearchInlineRecommendation,
} from "./search-feed-model";
import { styles } from "./search-styles";
import { canRunSearch, type SearchFilter } from "./search-model";
import { useAvailableDiscovery } from "./use-available-discovery";
import { useCatalogSearch, type SearchState } from "./use-catalog-search";
import { usePopularDiscovery } from "./use-popular-discovery";
import { useSearchRecommendations } from "./use-search-recommendations";
import { useTvlorePicks } from "./use-tvlore-picks";

const searchDebounceMs = 600;
type DiscoveryFeedItem = { key: "available" | "picks" | "popular" | "recommendations"; kind: "discovery" };
type FeedItem = DiscoveryFeedItem | SearchFeedItem;
const discoveryItems: DiscoveryFeedItem[] = [
  { key: "picks", kind: "discovery" },
  { key: "recommendations", kind: "discovery" },
  { key: "available", kind: "discovery" },
  { key: "popular", kind: "discovery" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const { loadMore, resolveResult, resolveState, runSearch, search } = useCatalogSearch();
  const { picks, picksState, retryPicks } = useTvlorePicks();
  const { recommendations, recommendationsState, retryRecommendations } = useSearchRecommendations();
  const { available, availableState, retryAvailable } = useAvailableDiscovery();
  const { popular, popularState, retryPopular } = usePopularDiscovery();
  const skipNextDebouncedSearchRef = useRef(false);
  const hasTypedQuery = query.trim().length > 0;
  const canSearch = canRunSearch(query);
  const isSearching = search.kind === "loading" || search.kind === "refreshing" || search.kind === "loadingMore";
  const searchResults = search.kind === "ready" || search.kind === "refreshing" || search.kind === "loadingMore"
    ? search.results
    : [];
  const feedItems = useMemo<FeedItem[]>(() => {
    if (!hasTypedQuery) {
      return discoveryItems;
    }

    if (!canSearch) {
      return [];
    }

    return getSearchFeedItems(searchResults, {
      available: available?.items ?? [],
      personalized: recommendations?.items ?? [],
      picks: picks?.items ?? [],
      popular: popular?.items ?? [],
    }, filter);
  }, [available, canSearch, filter, hasTypedQuery, picks, popular, recommendations, searchResults]);

  useEffect(() => {
    if (skipNextDebouncedSearchRef.current) {
      skipNextDebouncedSearchRef.current = false;
      return;
    }

    if (!canSearch) {
      void runSearch(query, filter);
      return;
    }

    const timeout = setTimeout(() => {
      void runSearch(query, filter);
    }, searchDebounceMs);

    return () => clearTimeout(timeout);
  }, [canSearch, filter, query, runSearch]);

  const submitSearch = () => {
    void runSearch(query, filter);
  };

  const selectFilter = (nextFilter: SearchFilter) => {
    if (nextFilter === filter) {
      return;
    }

    setFilter(nextFilter);

    if (canSearch) {
      skipNextDebouncedSearchRef.current = true;
      void runSearch(query, nextFilter, { keepResults: false });
    }
  };

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

  const openInlineRecommendation = async (recommendation: SearchInlineRecommendation) => {
    if (recommendation.catalogResult) {
      await openResult(recommendation.catalogResult);
      return;
    }

    if (recommendation.tvloreId) {
      pushDetail(recommendation.mediaType, recommendation.tvloreId);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<FeedItem>) => {
    if (item.kind === "result") {
      return (
        <SearchResultRow
          onResolve={openResult}
          resolveState={resolveState}
          result={item.result}
        />
      );
    }

    if (item.kind === "recommendation") {
      return (
        <SearchInlineRecommendationRow
          onOpen={openInlineRecommendation}
          recommendation={item.recommendation}
        />
      );
    }

    return renderDiscoveryItem(item);
  };

  const renderDiscoveryItem = (item: DiscoveryFeedItem) => {
    if (item.key === "picks") {
      return <SearchPicks onRetry={retryPicks} picks={picks} state={picksState} />;
    }

    if (item.key === "recommendations") {
      return <SearchRecommendations onRetry={retryRecommendations} recommendations={recommendations} state={recommendationsState} />;
    }

    if (item.key === "available") {
      return <SearchAvailable available={available} onRetry={retryAvailable} state={availableState} />;
    }

    return <SearchPopular onRetry={retryPopular} popular={popular} state={popularState} />;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <FlatList
        ListEmptyComponent={<SearchEmptyState canSearch={canSearch} hasTypedQuery={hasTypedQuery} search={search} />}
        ListFooterComponent={<SearchFooter search={search} />}
        ListHeaderComponent={(
          <View style={styles.searchStatus}>
            <SearchControls
              canSearch={canSearch}
              filter={filter}
              isSearching={isSearching}
              onQueryChange={setQuery}
              onSelectFilter={selectFilter}
              onSubmit={submitSearch}
              query={query}
            />
            <SearchHeader canSearch={canSearch} hasTypedQuery={hasTypedQuery} search={search} />
          </View>
        )}
        contentContainerStyle={styles.content}
        data={feedItems}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        onEndReached={() => {
          if (canSearch) {
            void loadMore(filter);
          }
        }}
        onEndReachedThreshold={0.6}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

function SearchHeader({
  canSearch,
  hasTypedQuery,
  search,
}: {
  canSearch: boolean;
  hasTypedQuery: boolean;
  search: SearchState;
}) {
  if (!hasTypedQuery) {
    return null;
  }

  if (!canSearch) {
    return <AppText tone="muted">Type at least 3 characters to search.</AppText>;
  }

  if (search.kind === "loading") {
    return <LoadingStrip label={`Searching ${search.query}`} />;
  }

  if (search.kind === "ready" || search.kind === "refreshing" || search.kind === "loadingMore") {
    return (
      <View style={styles.resultsHeader}>
        <AppText style={styles.sectionTitle} variant="section">
          {search.results.length} results for {search.query}
        </AppText>
        {search.kind === "refreshing" ? <ActivityIndicator color={ui.color.accent} size="small" /> : null}
      </View>
    );
  }

  return null;
}

function SearchEmptyState({
  canSearch,
  hasTypedQuery,
  search,
}: {
  canSearch: boolean;
  hasTypedQuery: boolean;
  search: SearchState;
}) {
  if (!hasTypedQuery || !canSearch) {
    return null;
  }

  if (search.kind === "loading") {
    return <SearchSkeleton />;
  }

  if (search.kind === "error") {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">Search failed</AppText>
        <AppText tone="muted">{search.message}</AppText>
      </View>
    );
  }

  if (search.kind === "ready" && search.results.length === 0) {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">No results</AppText>
        <AppText tone="muted">Try another title or filter.</AppText>
      </View>
    );
  }

  return null;
}

function SearchFooter({ search }: { search: SearchState }) {
  if (search.kind === "ready" && search.loadMoreError) {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">Could not load more</AppText>
        <AppText tone="muted">{search.loadMoreError}</AppText>
      </View>
    );
  }

  if (search.kind !== "loadingMore") {
    return null;
  }

  return (
    <View style={styles.loadingStrip}>
      <ActivityIndicator color={ui.color.accent} size="small" />
      <AppText tone="muted" variant="caption">Loading more results</AppText>
    </View>
  );
}

function pushDetail(mediaType: MediaType, id: string) {
  if (mediaType === "show") {
    router.push({ pathname: "/shows/[id]", params: { id } });
    return;
  }

  router.push({ pathname: "/movies/[id]", params: { id } });
}
