import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, View } from "react-native";

import type { CatalogSearchResult, MediaType } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import { AppText, Badge, PosterImage, Skeleton, ui } from "../ui";
import type { SearchInlineRecommendation } from "./search-feed-model";
import { styles } from "./search-styles";
import { getResultKey, type ResolveState, type SearchState } from "./use-catalog-search";

type IconName = ComponentProps<typeof Ionicons>["name"];

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
        <AppText variant="section">Search failed</AppText>
        <AppText tone="muted">{search.message}</AppText>
      </View>
    );
  }

  if (search.kind !== "ready" && search.kind !== "refreshing" && search.kind !== "loadingMore") {
    return null;
  }

  const isRefreshing = search.kind === "refreshing" || search.kind === "loadingMore";

  return (
    <View style={styles.resultsSection}>
      <View style={styles.resultsHeader}>
        <AppText style={styles.sectionTitle} variant="section">
          {search.results.length} results for {search.query}
        </AppText>
        {isRefreshing ? <ActivityIndicator color={ui.color.accent} size="small" /> : null}
      </View>
      {isRefreshing ? <AppText tone="muted">Updating results</AppText> : null}

      {search.results.length === 0 ? (
        <View style={styles.statusPanel}>
          <AppText variant="section">No results</AppText>
          <AppText tone="muted">Try another title or filter.</AppText>
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

export function LoadingStrip({ label }: { label: string }) {
  return (
    <View style={styles.loadingStrip}>
      <ActivityIndicator color={ui.color.accent} size="small" />
      <AppText tone="muted" variant="caption">{label}</AppText>
    </View>
  );
}

export function SearchSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonRow}>
          <Skeleton height={112} width={76} />
          <View style={styles.skeletonBody}>
            <View style={styles.resultHeading}>
              <Skeleton height={20} width="74%" />
              <Skeleton height={24} radius={999} width={64} />
            </View>
            <Skeleton height={13} width={48} />
            <Skeleton height={15} width="92%" />
            <Skeleton height={15} width="78%" />
            <Skeleton height={14} width={108} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SearchInlineRecommendationRow({
  onOpen,
  recommendation,
}: {
  onOpen: (recommendation: SearchInlineRecommendation) => void;
  recommendation: SearchInlineRecommendation;
}) {
  return (
    <Pressable
      accessibilityLabel={`Open ${recommendation.title}`}
      accessibilityRole="button"
      onPress={() => onOpen(recommendation)}
      style={({ pressed }) => [
        styles.inlineRecommendationRow,
        pressed ? styles.pressedResultRow : null,
      ]}
    >
      <View style={styles.inlineRecommendationIcon}>
        <Ionicons color={ui.color.white} name={"sparkles-outline" satisfies IconName} size={18} />
      </View>

      <PosterImage
        label={getMediaLabel(recommendation.mediaType)}
        size="search"
        uri={recommendation.posterPath ? getTmdbPosterUrl(recommendation.posterPath) : null}
      />

      <View style={styles.resultBody}>
        <View style={styles.resultHeading}>
          <AppText tone="accent" variant="caption">{recommendation.label}</AppText>
          <AppText numberOfLines={2} style={styles.resultTitle} variant="title">{recommendation.title}</AppText>
          <Badge label={recommendation.mediaType === "show" ? "Show" : "Movie"} />
        </View>
        <AppText numberOfLines={2} style={styles.resultOverview} tone="muted">
          {recommendation.overview || "Recommended by TVLore."}
        </AppText>
      </View>
    </Pressable>
  );
}

export function SearchResultRow({
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
    <Pressable
      accessibilityRole="button"
      disabled={isResolving}
      onPress={() => onResolve(result)}
      style={({ pressed }) => [
        styles.resultRow,
        pressed ? styles.pressedResultRow : null,
        isResolving ? styles.disabledButton : null,
      ]}
    >
      <PosterImage
        label={result.mediaType === "show" ? "TV" : "M"}
        size="search"
        uri={result.posterPath ? getTmdbPosterUrl(result.posterPath) : null}
      />

      <View style={styles.resultBody}>
        <View style={styles.resultHeading}>
          <AppText numberOfLines={2} style={styles.resultTitle} variant="title">{result.title}</AppText>
          <Badge label={result.mediaType === "show" ? "Show" : "Movie"} />
        </View>
        <AppText style={styles.resultMeta} tone="subtle" variant="caption">{result.year ?? "Unknown year"}</AppText>
        <AppText numberOfLines={3} style={styles.resultOverview} tone="muted">
          {result.overview || "No overview available."}
        </AppText>

        {result.tvloreId ? <AppText tone="accent" variant="caption">Already in TVLore</AppText> : null}
        {resolved ? <AppText tone="accent" variant="caption">Ready</AppText> : null}
        {isResolving ? <ActivityIndicator color={ui.color.accent} size="small" /> : null}
        {resolveError ? <AppText tone="danger">{resolveError}</AppText> : null}
      </View>
    </Pressable>
  );
}

function getMediaLabel(mediaType: MediaType) {
  return mediaType === "show" ? "TV" : "M";
}
