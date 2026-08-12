import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import type { CatalogSearchResult } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import { styles } from "./search-styles";
import { getResultKey, type ResolveState, type SearchState } from "./use-catalog-search";

export function SearchResults({
  onOpenResult,
  resolveState,
  search,
}: {
  onOpenResult: (result: CatalogSearchResult) => void;
  resolveState: ResolveState;
  search: SearchState;
}) {
  if (search.kind === "loading") {
    return (
      <View style={styles.resultsSection}>
        <LoadingStrip label={`Searching ${search.query}`} />
        <SearchSkeleton />
      </View>
    );
  }

  if (search.kind === "error") {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusTitle}>Search failed</Text>
        <Text style={styles.mutedText}>{search.message}</Text>
      </View>
    );
  }

  if (search.kind !== "ready" && search.kind !== "refreshing") {
    return null;
  }

  const isRefreshing = search.kind === "refreshing";

  return (
    <View style={styles.resultsSection}>
      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>
          {search.results.length} results for {search.query}
        </Text>
        {isRefreshing ? <ActivityIndicator color="#1f7a5c" size="small" /> : null}
      </View>
      {isRefreshing ? <Text style={styles.mutedText}>Updating results</Text> : null}

      {search.results.length === 0 ? (
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>No results</Text>
          <Text style={styles.mutedText}>Try another title or filter.</Text>
        </View>
      ) : null}

      {search.results.map((result) => (
        <SearchResultRow
          key={getResultKey(result)}
          result={result}
          resolveState={resolveState}
          onResolve={onOpenResult}
        />
      ))}
    </View>
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
          <Text style={styles.resolveButtonText}>{isResolving ? "Opening" : "Open"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
