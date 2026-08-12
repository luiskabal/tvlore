import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import type { ContinueWatchingShow, LibraryResponse, RecentlyWatchedItem } from "../api/tvlore-api";
import {
  getAuthRedirectUrl,
  isSupabaseConfigured,
  supabaseProjectUrl,
} from "../auth/supabase-auth";
import { useAuthSession, type AuthState } from "../auth/use-auth-session";
import { useHomeData } from "./use-home-data";

export default function HomeScreen() {
  const { home, refreshHome } = useHomeData();
  const {
    auth,
    authActionMessage,
    continueWithGoogle,
    isAuthActionRunning,
    signOut,
  } = useAuthSession(refreshHome);

  const statusLabel =
    home.kind === "ready" ? "API online" : home.kind === "offline" ? "API offline" : "Checking API";

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>TVLore</Text>
        <Text style={styles.subtitle}>Track what you watch. Discover what you share.</Text>

        {home.kind === "ready" && home.user ? <LibraryOverview library={home.library} userName={home.user.displayName} /> : null}

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Google auth</Text>
          <Text style={styles.statusDetail}>{getAuthStatus(auth)}</Text>
          <Text style={styles.statusDetail}>Redirect: {getAuthRedirectUrl()}</Text>
          {auth.kind === "signedIn" ? (
            <Text style={styles.statusDetail}>Supabase user ID: {auth.userId}</Text>
          ) : null}
          {authActionMessage ? <Text style={styles.errorText}>{authActionMessage}</Text> : null}
        </View>

        {auth.kind === "signedIn" ? (
          <Pressable
            disabled={isAuthActionRunning}
            style={[styles.secondaryButton, isAuthActionRunning ? styles.disabledButton : null]}
            onPress={signOut}
          >
            <Text style={styles.secondaryButtonText}>
              {isAuthActionRunning ? "Signing out" : "Sign out"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={!isSupabaseConfigured || isAuthActionRunning}
            style={[styles.googleButton, !isSupabaseConfigured || isAuthActionRunning ? styles.disabledButton : null]}
            onPress={continueWithGoogle}
          >
            <Text style={styles.googleButtonText}>
              {isAuthActionRunning ? "Opening Google" : "Continue with Google"}
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.button} onPress={refreshHome}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>
          <Text style={styles.statusDetail}>
            {home.kind === "ready"
              ? `${home.health.service} responded at ${new Date(home.health.time).toLocaleTimeString()}`
              : home.kind === "offline"
                ? home.message
                : "Waiting for the backend"}
          </Text>
          <Text style={styles.statusDetail}>
            {isSupabaseConfigured ? `Supabase: ${supabaseProjectUrl}` : "Supabase missing config"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LibraryOverview({ library, userName }: { library: LibraryResponse | null; userName: string }) {
  if (!library) {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>{userName}</Text>
        <Text style={styles.statusDetail}>Sign in is active. Library data is not loaded yet.</Text>
      </View>
    );
  }

  const isEmpty =
    library.summary.watchedEpisodeCount === 0 &&
    library.summary.watchedMovieCount === 0 &&
    library.summary.watchedShowCount === 0;

  return (
    <View style={styles.librarySection}>
      <View>
        <Text style={styles.sectionEyebrow}>Library</Text>
        <Text style={styles.sectionTitle}>{userName}</Text>
      </View>

      <View style={styles.metricRow}>
        <Metric label="Shows" value={library.summary.watchedShowCount} />
        <Metric label="Movies" value={library.summary.watchedMovieCount} />
        <Metric label="Episodes" value={library.summary.watchedEpisodeCount} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.statusLabel}>Your library is empty</Text>
          <Text style={styles.statusDetail}>Watched titles will appear here after you mark them.</Text>
        </View>
      ) : null}

      {library.continueWatching.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Continue Watching</Text>
          {library.continueWatching.map((show) => (
            <ContinueWatchingItem key={show.id} show={show} />
          ))}
        </View>
      ) : null}

      {library.recentlyWatched.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Recently Watched</Text>
          {library.recentlyWatched.map((item) => (
            <RecentlyWatchedRow key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ContinueWatchingItem({ show }: { show: ContinueWatchingShow }) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{show.title}</Text>
        <Text style={styles.statusDetail}>
          S{show.nextEpisode.seasonNumber} E{show.nextEpisode.episodeNumber} - {show.nextEpisode.title}
        </Text>
      </View>
      <Text style={styles.progressText}>{show.percentComplete}%</Text>
    </View>
  );
}

function RecentlyWatchedRow({ item }: { item: RecentlyWatchedItem }) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{getRecentlyWatchedTitle(item)}</Text>
        <Text style={styles.statusDetail}>{getRecentlyWatchedDetail(item)}</Text>
      </View>
      <Text style={styles.dateText}>{formatWatchedAt(item.watchedAt)}</Text>
    </View>
  );
}

function getRecentlyWatchedTitle(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? item.title : item.showTitle;
}

function getRecentlyWatchedDetail(item: RecentlyWatchedItem) {
  return item.mediaType === "movie"
    ? "Movie"
    : `S${item.seasonNumber} E${item.episodeNumber} - ${item.title}`;
}

function formatWatchedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getAuthStatus(auth: AuthState) {
  if (auth.kind === "signedIn") {
    return `${auth.displayName ?? auth.email} is signed in`;
  }

  if (auth.kind === "signedOut") {
    return "No active Google session";
  }

  if (auth.kind === "loading") {
    return "Checking Supabase session";
  }

  return auth.kind === "unconfigured" ? "Missing Supabase config" : auth.message;
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#1f7a5c",
    borderRadius: 8,
    minWidth: 120,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flexGrow: 1,
    gap: 20,
    padding: 24,
    paddingTop: 72,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: "#9c2f23",
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    color: "#7a7067",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyPanel: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  googleButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 190,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  googleButtonText: {
    color: "#171412",
    fontSize: 16,
    fontWeight: "700",
  },
  itemTitle: {
    color: "#171412",
    fontSize: 16,
    fontWeight: "700",
  },
  librarySection: {
    gap: 16,
  },
  listItem: {
    alignItems: "center",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14,
  },
  listSection: {
    gap: 10,
  },
  listText: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    color: "#171412",
    fontSize: 18,
    fontWeight: "800",
  },
  metricBox: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  metricLabel: {
    color: "#5f564d",
    fontSize: 12,
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricValue: {
    color: "#171412",
    fontSize: 24,
    fontWeight: "800",
  },
  progressText: {
    color: "#1f7a5c",
    fontSize: 14,
    fontWeight: "800",
  },
  screen: {
    backgroundColor: "#f7f4ee",
    flex: 1,
  },
  sectionEyebrow: {
    color: "#1f7a5c",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#171412",
    fontSize: 26,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#171412",
    borderRadius: 8,
    minWidth: 120,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  statusDetail: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 20,
  },
  statusLabel: {
    color: "#171412",
    fontSize: 18,
    fontWeight: "700",
  },
  statusPanel: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
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
});
