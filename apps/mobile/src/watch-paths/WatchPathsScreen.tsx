import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import type { CreateWatchPathInput } from "../api/tvlore-api";
import { AppText, Badge, Button, EmptyState, IconButton, PageHeader, Screen, ScreenScroll, Skeleton, Surface } from "../ui";
import { styles } from "./watch-paths-styles";
import { parseWatchPathImport } from "./watch-paths-model";
import { useWatchPaths } from "./use-watch-paths";

const importPlaceholder = [
  "https://www.themoviedb.org/movie/155-the-dark-knight",
  "https://www.themoviedb.org/tv/70523-dark",
].join("\n");

const collectionPlaceholder = "https://www.themoviedb.org/collection/10-star-wars-collection";

export default function WatchPathsScreen() {
  const { createPath, createState, importTmdbCollectionPath, refresh, resetCreateState, state } = useWatchPaths();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [collectionUrl, setCollectionUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const isCreating = createState.kind === "loading";

  const closeCreate = () => {
    setCreateOpen(false);
    setFormError(null);
    resetCreateState();
  };

  const submitCreate = async () => {
    setFormError(null);
    resetCreateState();

    let input: CreateWatchPathInput;

    try {
      input = parseWatchPathImport(title, description, itemsText);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Invalid path import");
      return;
    }

    const path = await createPath(input);

    if (!path) {
      return;
    }

    setTitle("");
    setDescription("");
    setItemsText("");
    closeCreate();
    router.push({ pathname: "/paths/[id]", params: { id: path.id } });
  };

  const submitCollectionImport = async () => {
    const url = collectionUrl.trim();

    setFormError(null);
    resetCreateState();

    if (!url) {
      setFormError("TMDB collection URL is required");
      return;
    }

    const path = await importTmdbCollectionPath({ url });

    if (!path) {
      return;
    }

    setCollectionUrl("");
    setTitle("");
    setDescription("");
    setItemsText("");
    closeCreate();
    router.push({ pathname: "/paths/[id]", params: { id: path.id } });
  };

  return (
    <Screen>
      <ScreenScroll>
        <PageHeader
          action={(
            <IconButton
              icon={isCreateOpen ? "close" : "add"}
              label={isCreateOpen ? "Cancel path creation" : "New path"}
              onPress={() => {
                if (isCreateOpen) {
                  closeCreate();
                  return;
                }

                setCreateOpen(true);
              }}
              variant={isCreateOpen ? "plain" : "primary"}
            />
          )}
          subtitle="Follow curated watch orders without rebuilding the list yourself."
          title="Paths"
        />

        {isCreateOpen ? (
          <Surface style={styles.formPanel}>
            <View style={styles.formSection}>
              <AppText variant="section">Import TMDB Collection</AppText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setCollectionUrl}
                placeholder={collectionPlaceholder}
                style={styles.input}
                value={collectionUrl}
              />
              <Button
                disabled={isCreating}
                icon="download-outline"
                isLoading={isCreating}
                label="Import collection"
                loadingLabel="Importing"
                onPress={submitCollectionImport}
                size="small"
              />
            </View>

            <View style={styles.formDivider} />

            <View style={styles.formSection}>
              <AppText variant="section">Manual TMDB list</AppText>
              <TextInput
                autoCapitalize="words"
                onChangeText={setTitle}
                placeholder="Path title"
                style={styles.input}
                value={title}
              />
              <TextInput
                onChangeText={setDescription}
                placeholder="Description"
                style={styles.input}
                value={description}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                onChangeText={setItemsText}
                placeholder={importPlaceholder}
                style={[styles.input, styles.multilineInput]}
                value={itemsText}
              />
              {formError ? <AppText tone="danger">{formError}</AppText> : null}
              {createState.kind === "error" ? <AppText tone="danger">{createState.message}</AppText> : null}
              <View style={styles.formActionsRow}>
                <Button
                  disabled={isCreating}
                  icon="add"
                  isLoading={isCreating}
                  label="Create"
                  loadingLabel="Creating"
                  onPress={submitCreate}
                  size="small"
                />
              </View>
            </View>
          </Surface>
        ) : null}

        {state.kind === "loading" ? <WatchPathsSkeleton /> : null}

        {state.kind === "error" ? (
          <EmptyState
            action={<Button icon="refresh" label="Retry" onPress={refresh} />}
            detail={state.message}
            icon="map-outline"
            title="Could not load paths"
          />
        ) : null}

        {state.kind === "ready" ? (
          <View style={styles.list}>
            {state.paths.length === 0 ? (
              <EmptyState
                detail="Create a path or import a TMDB collection to keep a watch order handy."
                icon="map-outline"
                title="No paths yet"
              />
            ) : null}
            {state.paths.map((path) => (
              <Pressable
                accessibilityRole="button"
                key={path.id}
                onPress={() => router.push({ pathname: "/paths/[id]", params: { id: path.id } })}
                style={({ pressed }) => [styles.pathCard, pressed ? styles.pressed : null]}
              >
                <View style={styles.pathHeaderRow}>
                  <AppText style={styles.pathTitle} variant="section">{path.title}</AppText>
                  <Badge label={path.source === "user" ? "Yours" : "Curated"} tone={path.source === "user" ? "accent" : "neutral"} />
                </View>
                <AppText tone="muted">{path.description}</AppText>
                <AppText tone="accent" variant="caption">{path.itemCount} titles</AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

function WatchPathsSkeleton() {
  return (
    <View style={styles.list}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.pathCard}>
          <Skeleton height={22} width="62%" />
          <Skeleton height={14} width="88%" />
          <Skeleton height={14} width="28%" />
        </View>
      ))}
    </View>
  );
}
