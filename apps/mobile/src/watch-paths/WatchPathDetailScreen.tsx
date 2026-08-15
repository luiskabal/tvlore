import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, View } from "react-native";

import { resolveCatalogItem, saveWatchPathToWatchlist, type WatchPathItem } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { getTmdbPosterUrl } from "../catalog/posters";
import { notifyLibraryChanged } from "../library/library-refresh";
import { AppText, Badge, Button, PosterImage, Skeleton, ui } from "../ui";
import { styles } from "./watch-paths-styles";
import { toCatalogSearchResult, getWatchPathItemKey } from "./watch-paths-model";
import { useWatchPath } from "./use-watch-paths";

export default function WatchPathDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const { refresh, state } = useWatchPath(id);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SavePathState>({ kind: "idle" });
  const readyPath = state.kind === "ready" ? state.path : null;
  const savedItemCount = readyPath ? getSavedItemCount(readyPath, saveState) : 0;
  const isFullySaved = Boolean(readyPath && savedItemCount >= readyPath.itemCount);

  const openItem = async (item: WatchPathItem) => {
    const itemKey = getWatchPathItemKey(item);
    setOpeningKey(itemKey);
    setOpenError(null);

    try {
      if (item.tvloreId) {
        openDetail(item.mediaType, item.tvloreId);
        return;
      }

      const token = await getSupabaseAccessToken();
      const resolved = await resolveCatalogItem(token, toCatalogSearchResult(item));
      openDetail(resolved.mediaType, resolved.id);
    } catch (error) {
      setOpenError(error instanceof Error ? error.message : "Could not open title");
    } finally {
      setOpeningKey(null);
    }
  };

  const savePath = async () => {
    if (state.kind !== "ready" || isFullySaved) {
      return;
    }

    setSaveState({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();
      const response = await saveWatchPathToWatchlist(token, state.path.id);
      notifyLibraryChanged();
      setSaveState({ kind: "success", savedItemCount: response.savedItemCount });
      void refresh();
    } catch (error) {
      setSaveState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not save path",
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <AppText tone="accent" variant="caption">Back</AppText>
        </Pressable>

        {state.kind === "loading" ? <WatchPathDetailSkeleton /> : null}

        {state.kind === "error" ? (
          <View style={styles.emptyPanel}>
            <AppText variant="section">Could not load path</AppText>
            <AppText tone="muted">{state.message}</AppText>
            <Button label="Retry" onPress={refresh} />
          </View>
        ) : null}

        {readyPath ? (
          <>
            <View style={styles.header}>
              <AppText style={styles.title}>{readyPath.title}</AppText>
              <AppText tone="muted">{readyPath.description}</AppText>
              <View style={styles.headerActionsRow}>
                <Badge label={`${readyPath.itemCount} titles`} />
                <Badge label={`${savedItemCount} saved`} tone="neutral" />
                <Button
                  disabled={isFullySaved}
                  isLoading={saveState.kind === "loading"}
                  label={isFullySaved ? "Saved" : savedItemCount > 0 ? "Save remaining" : "Save all"}
                  loadingLabel="Saving"
                  onPress={savePath}
                  size="small"
                />
              </View>
              {saveState.kind === "success" ? (
                <AppText tone="accent">{savedItemCount} titles are in your watchlist.</AppText>
              ) : null}
              {saveState.kind === "error" ? <AppText tone="danger">{saveState.message}</AppText> : null}
            </View>

            {openError ? <AppText tone="danger">{openError}</AppText> : null}

            <View style={styles.list}>
              {readyPath.items.map((item) => (
                <PathItemRow
                  isOpening={openingKey === getWatchPathItemKey(item)}
                  isSaved={saveState.kind === "success" || item.inWatchlist}
                  item={item}
                  key={item.id}
                  onOpen={openItem}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type SavePathState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; savedItemCount: number }
  | { kind: "error"; message: string };

function getSavedItemCount(path: { savedItemCount: number }, saveState: SavePathState) {
  return saveState.kind === "success"
    ? Math.max(path.savedItemCount, saveState.savedItemCount)
    : path.savedItemCount;
}

function PathItemRow({
  isOpening,
  isSaved,
  item,
  onOpen,
}: {
  isOpening: boolean;
  isSaved: boolean;
  item: WatchPathItem;
  onOpen: (item: WatchPathItem) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isOpening}
      onPress={() => onOpen(item)}
      style={({ pressed }) => [styles.itemRow, pressed ? styles.pressed : null]}
    >
      <View style={styles.itemPosterFrame}>
        <PosterImage
          label={`${item.position}`}
          uri={item.posterPath ? getTmdbPosterUrl(item.posterPath) : null}
        />
        <View style={styles.itemBadge}>
          <AppText tone="accent" variant="caption">{item.position}</AppText>
        </View>
      </View>
      <View style={styles.detailText}>
        <AppText numberOfLines={2} variant="title">{item.title}</AppText>
        <AppText tone="muted">
          {item.year ?? "Unknown year"}{item.note ? ` - ${item.note}` : ""}
        </AppText>
      </View>
      {isOpening ? <ActivityIndicator color={ui.color.accent} size="small" /> : (
        <AppText tone={isSaved || item.tvloreId ? "accent" : "subtle"} variant="caption">
          {isSaved ? "Saved" : item.tvloreId ? "Ready" : "Open"}
        </AppText>
      )}
    </Pressable>
  );
}

function WatchPathDetailSkeleton() {
  return (
    <>
      <View style={styles.header}>
        <Skeleton height={38} width="82%" />
        <Skeleton height={16} width="90%" />
        <Skeleton height={26} width={82} />
      </View>
      <View style={styles.list}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.itemRow}>
            <Skeleton height={64} width={44} />
            <View style={styles.detailText}>
              <Skeleton height={18} width="72%" />
              <Skeleton height={14} width="46%" />
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function openDetail(mediaType: WatchPathItem["mediaType"], id: string) {
  if (mediaType === "show") {
    router.push({ pathname: "/shows/[id]", params: { id } });
    return;
  }

  router.push({ pathname: "/movies/[id]", params: { id } });
}
