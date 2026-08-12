import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import { getResultKey, minSearchLength, type ResolveState, type SearchFilter, useCatalogSearch } from "./use-catalog-search";

const filters: { label: string; value: SearchFilter }[] = [
  { label: "All", value: "all" },
  { label: "Shows", value: "show" },
  { label: "Movies", value: "movie" },
];

const searchDebounceMs = 600;

export default function SearchScreen() {
  const [query, setQuery] = useState("dark");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const { resolveResult, resolveState, runSearch, search } = useCatalogSearch();
  const canSearch = query.trim().length >= minSearchLength;
  const results = search.kind === "ready" || search.kind === "refreshing" ? search.results : [];
  const isSearching = search.kind === "loading" || search.kind === "refreshing";
  const isInitialLoading = search.kind === "loading";
  const isRefreshing = search.kind === "refreshing";

  useEffect(() => {
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>Shows and movies</Text>
        </View>

        <View style={styles.searchPanel}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            placeholder="Dark, Severance, The Matrix"
            returnKeyType="search"
            style={styles.input}
            value={query}
          />

          <View style={styles.filterRow}>
            {filters.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.filterButton,
                  filter === item.value ? styles.activeFilterButton : null,
                  isSearching && filter !== item.value ? styles.pendingFilterButton : null,
                ]}
                onPress={() => setFilter(item.value)}
              >
                <Text style={[styles.filterText, filter === item.value ? styles.activeFilterText : null]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            disabled={!canSearch || isSearching}
            style={[styles.primaryButton, !canSearch || isSearching ? styles.disabledButton : null]}
            onPress={submitSearch}
          >
            <Text style={styles.primaryButtonText}>{isSearching ? "Searching" : "Search"}</Text>
          </Pressable>
        </View>

        {isInitialLoading ? (
          <View style={styles.resultsSection}>
            <LoadingStrip label={`Searching ${search.query}`} />
            <SearchSkeleton />
          </View>
        ) : null}

        {search.kind === "error" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusTitle}>Search failed</Text>
            <Text style={styles.mutedText}>{search.message}</Text>
          </View>
        ) : null}

        {search.kind === "ready" || search.kind === "refreshing" ? (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>
                {results.length} results for {search.query}
              </Text>
              {isRefreshing ? <ActivityIndicator color="#1f7a5c" size="small" /> : null}
            </View>
            {isRefreshing ? <Text style={styles.mutedText}>Updating results</Text> : null}

            {results.length === 0 ? (
              <View style={styles.statusPanel}>
                <Text style={styles.statusTitle}>No results</Text>
                <Text style={styles.mutedText}>Try another title or filter.</Text>
              </View>
            ) : null}

            {results.map((result) => (
              <SearchResultRow
                key={getResultKey(result)}
                result={result}
                resolveState={resolveState}
                onResolve={openResult}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingStrip({ label }: { label: string }) {
  return (
    <View style={styles.loadingStrip}>
      <ActivityIndicator color="#1f7a5c" size="small" />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function SearchSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonRow}>
          <View style={styles.skeletonPoster} />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonButton} />
          </View>
        </View>
      ))}
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

function SearchResultRow({
  onResolve,
  resolveState,
  result,
}: {
  onResolve: (result: CatalogSearchResult) => void;
  resolveState: ResolveState;
  result: CatalogSearchResult;
}) {
  const resultKey = getResultKey(result);
  const isResolving = resolveState.kind === "loading" && resolveState.resultKey === resultKey;
  const resolved = resolveState.kind === "resolved" && resolveState.resultKey === resultKey
    ? resolveState.item
    : null;
  const resolveError = resolveState.kind === "error" && resolveState.resultKey === resultKey
    ? resolveState.message
    : null;

  return (
    <View style={styles.resultRow}>
      {result.posterPath ? (
        <Image source={{ uri: getTmdbPosterUrl(result.posterPath) }} style={styles.poster} />
      ) : (
        <View style={styles.posterPlaceholder}>
          <Text style={styles.posterPlaceholderText}>{result.mediaType === "show" ? "TV" : "M"}</Text>
        </View>
      )}

      <View style={styles.resultBody}>
        <View style={styles.resultHeading}>
          <Text style={styles.resultTitle} numberOfLines={2}>{result.title}</Text>
          <Text style={styles.mediaPill}>{result.mediaType === "show" ? "Show" : "Movie"}</Text>
        </View>
        <Text style={styles.resultMeta}>{result.year ?? "Unknown year"}</Text>
        <Text style={styles.resultOverview} numberOfLines={3}>{result.overview || "No overview available."}</Text>

        {result.tvloreId ? <Text style={styles.tvloreText}>Already in TVLore</Text> : null}
        {resolved ? <Text style={styles.tvloreText}>Ready</Text> : null}
        {resolveError ? <Text style={styles.errorText}>{resolveError}</Text> : null}

        <Pressable
          disabled={isResolving}
          style={[styles.resolveButton, isResolving ? styles.disabledButton : null]}
          onPress={() => onResolve(result)}
        >
          <Text style={styles.resolveButtonText}>
            {isResolving ? "Opening" : "Open"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeFilterButton: {
    backgroundColor: "#171412",
    borderColor: "#171412",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backButtonText: {
    color: "#1f7a5c",
    fontSize: 16,
    fontWeight: "800",
  },
  loadingStrip: {
    alignItems: "center",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  loadingText: {
    color: "#5f564d",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    flexGrow: 1,
    gap: 20,
    padding: 24,
    paddingTop: 48,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: "#9c2f23",
    fontSize: 13,
    lineHeight: 18,
  },
  filterButton: {
    alignItems: "center",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterText: {
    color: "#171412",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    gap: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    color: "#171412",
    fontSize: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  mediaPill: {
    alignSelf: "flex-start",
    backgroundColor: "#e4f1ea",
    borderRadius: 8,
    color: "#1f7a5c",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mutedText: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 20,
  },
  poster: {
    backgroundColor: "#d8d0c5",
    borderRadius: 8,
    height: 112,
    width: 76,
  },
  pendingFilterButton: {
    opacity: 0.72,
  },
  posterPlaceholder: {
    alignItems: "center",
    backgroundColor: "#e8e2d8",
    borderRadius: 8,
    height: 112,
    justifyContent: "center",
    width: 76,
  },
  posterPlaceholderText: {
    color: "#5f564d",
    fontSize: 18,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#1f7a5c",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  resolveButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#171412",
    borderRadius: 8,
    minWidth: 108,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resolveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  resultBody: {
    flex: 1,
    gap: 7,
  },
  resultHeading: {
    gap: 6,
  },
  resultMeta: {
    color: "#7a7067",
    fontSize: 13,
    fontWeight: "700",
  },
  resultOverview: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 19,
  },
  resultRow: {
    backgroundColor: "#fffdfa",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 12,
  },
  resultTitle: {
    color: "#171412",
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
  },
  resultsSection: {
    gap: 12,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  screen: {
    backgroundColor: "#f7f4ee",
    flex: 1,
  },
  searchPanel: {
    gap: 12,
  },
  sectionTitle: {
    color: "#171412",
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
  },
  skeletonBody: {
    flex: 1,
    gap: 10,
  },
  skeletonButton: {
    backgroundColor: "#d8d0c5",
    borderRadius: 8,
    height: 34,
    width: 96,
  },
  skeletonLine: {
    backgroundColor: "#e2dbd1",
    borderRadius: 8,
    height: 14,
    width: "92%",
  },
  skeletonLineShort: {
    backgroundColor: "#e2dbd1",
    borderRadius: 8,
    height: 14,
    width: "62%",
  },
  skeletonList: {
    gap: 12,
  },
  skeletonPoster: {
    backgroundColor: "#d8d0c5",
    borderRadius: 8,
    height: 112,
    width: 76,
  },
  skeletonRow: {
    backgroundColor: "#fffdfa",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 12,
  },
  skeletonTitle: {
    backgroundColor: "#d8d0c5",
    borderRadius: 8,
    height: 20,
    width: "72%",
  },
  statusPanel: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  statusTitle: {
    color: "#171412",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#4f4740",
    fontSize: 17,
    lineHeight: 24,
  },
  title: {
    color: "#171412",
    fontSize: 42,
    fontWeight: "800",
  },
  tvloreText: {
    color: "#1f7a5c",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
});
