import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { useRecommendationActions } from "../home/use-recommendation-actions";
import { SearchControls } from "./SearchControls";
import { SearchRecommendations } from "./SearchRecommendations";
import { SearchResults } from "./SearchResults";
import { styles } from "./search-styles";
import { canRunSearch, type SearchFilter } from "./search-model";
import { useCatalogSearch } from "./use-catalog-search";
import { useSearchRecommendations } from "./use-search-recommendations";

const searchDebounceMs = 600;

export default function SearchScreen() {
  const [query, setQuery] = useState("dark");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const { resolveResult, resolveState, runSearch, search } = useCatalogSearch();
  const { recommendationAction, saveRecommendation } = useRecommendationActions();
  const { recommendations, recommendationsState, retryRecommendations } = useSearchRecommendations();
  const skipNextDebouncedSearchRef = useRef(false);
  const canSearch = canRunSearch(query);
  const isSearching = search.kind === "loading" || search.kind === "refreshing";

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

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <SearchControls
          canSearch={canSearch}
          filter={filter}
          isSearching={isSearching}
          onQueryChange={setQuery}
          onSelectFilter={selectFilter}
          onSubmit={submitSearch}
          query={query}
        />

        <SearchResults
          onOpenResult={openResult}
          resolveState={resolveState}
          search={search}
        />

        <SearchRecommendations
          onOpenMovie={openMovie}
          onOpenShow={openShow}
          onRetry={retryRecommendations}
          onSaveToWatchlist={saveRecommendation}
          recommendationAction={recommendationAction}
          recommendations={recommendations}
          state={recommendationsState}
        />
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

function openMovie(id: string) {
  pushDetail("movie", id);
}

function openShow(id: string) {
  pushDetail("show", id);
}
