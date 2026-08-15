import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

import { AppText, Button, Skeleton } from "../ui";
import { styles } from "./watch-paths-styles";
import { useWatchPaths } from "./use-watch-paths";

export default function WatchPathsScreen() {
  const { refresh, state } = useWatchPaths();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText style={styles.title}>Paths</AppText>
          <AppText tone="muted">Follow curated watch orders without rebuilding the list yourself.</AppText>
        </View>

        {state.kind === "loading" ? <WatchPathsSkeleton /> : null}

        {state.kind === "error" ? (
          <View style={styles.emptyPanel}>
            <AppText variant="section">Could not load paths</AppText>
            <AppText tone="muted">{state.message}</AppText>
            <Button label="Retry" onPress={refresh} />
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <View style={styles.list}>
            {state.paths.map((path) => (
              <Pressable
                accessibilityRole="button"
                key={path.id}
                onPress={() => router.push({ pathname: "/paths/[id]", params: { id: path.id } })}
                style={({ pressed }) => [styles.pathCard, pressed ? styles.pressed : null]}
              >
                <AppText variant="section">{path.title}</AppText>
                <AppText tone="muted">{path.description}</AppText>
                <AppText tone="accent" variant="caption">{path.itemCount} titles</AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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
