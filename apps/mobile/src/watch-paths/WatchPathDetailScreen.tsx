import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, View } from "react-native";

import { resolveCatalogItem, type WatchPathItem } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import { AppText, Badge, Button, Skeleton, ui } from "../ui";
import { styles } from "./watch-paths-styles";
import { toCatalogSearchResult, getWatchPathItemKey } from "./watch-paths-model";
import { useWatchPath } from "./use-watch-paths";

export default function WatchPathDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const { refresh, state } = useWatchPath(id);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

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

        {state.kind === "ready" ? (
          <>
            <View style={styles.header}>
              <AppText style={styles.title}>{state.path.title}</AppText>
              <AppText tone="muted">{state.path.description}</AppText>
              <Badge label={`${state.path.itemCount} titles`} />
            </View>

            {openError ? <AppText tone="danger">{openError}</AppText> : null}

            <View style={styles.list}>
              {state.path.items.map((item) => (
                <PathItemRow
                  isOpening={openingKey === getWatchPathItemKey(item)}
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

function PathItemRow({
  isOpening,
  item,
  onOpen,
}: {
  isOpening: boolean;
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
      <View style={styles.itemBadge}>
        <AppText tone="accent" variant="caption">{item.position}</AppText>
      </View>
      <View style={styles.detailText}>
        <AppText numberOfLines={2} variant="title">{item.title}</AppText>
        <AppText tone="muted">
          {item.year ?? "Unknown year"}{item.note ? ` - ${item.note}` : ""}
        </AppText>
      </View>
      {isOpening ? <ActivityIndicator color={ui.color.accent} size="small" /> : (
        <AppText tone={item.tvloreId ? "accent" : "subtle"} variant="caption">
          {item.tvloreId ? "Ready" : "Open"}
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
            <Skeleton height={34} width={34} />
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
