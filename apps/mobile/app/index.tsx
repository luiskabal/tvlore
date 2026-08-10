import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

type HealthResponse = {
  status: string;
  service: string;
  time: string;
};

type UserResponse = {
  id: string;
  displayName: string;
  createdAt: string;
};

type HomeState =
  | { kind: "loading" }
  | { kind: "ready"; health: HealthResponse; user: UserResponse }
  | { kind: "offline"; message: string };

function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_TVLORE_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (expoHost) {
    return `http://${expoHost}:3000`;
  }

  return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
}

const apiBaseUrl = getApiBaseUrl();

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.status === "string" &&
    typeof candidate.service === "string" &&
    typeof candidate.time === "string"
  );
}

function isUserResponse(value: unknown): value is UserResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.displayName === "string" &&
    typeof candidate.createdAt === "string"
  );
}

export default function HomeScreen() {
  const [home, setHome] = useState<HomeState>({ kind: "loading" });

  const refreshHome = useCallback(async () => {
    setHome({ kind: "loading" });

    try {
      const [healthResponse, userResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/health`),
        fetch(`${apiBaseUrl}/users/me`),
      ]);
      const [healthBody, userBody]: unknown[] = await Promise.all([
        healthResponse.json(),
        userResponse.json(),
      ]);

      if (
        !healthResponse.ok ||
        !isHealthResponse(healthBody) ||
        !userResponse.ok ||
        !isUserResponse(userBody)
      ) {
        throw new Error("Unexpected API response");
      }

      setHome({ kind: "ready", health: healthBody, user: userBody });
    } catch (error) {
      setHome({
        kind: "offline",
        message: error instanceof Error ? error.message : "Unknown API error",
      });
    }
  }, []);

  useEffect(() => {
    void refreshHome();
  }, [refreshHome]);

  const statusLabel =
    home.kind === "ready" ? "API online" : home.kind === "offline" ? "API offline" : "Checking API";

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>TVLore</Text>
        <Text style={styles.subtitle}>Track what you watch. Discover what you share.</Text>

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>
          <Text style={styles.statusDetail}>
            {home.kind === "ready"
              ? `${home.health.service} responded at ${new Date(home.health.time).toLocaleTimeString()}`
              : home.kind === "offline"
                ? home.message
                : "Waiting for the backend"}
          </Text>
        </View>

        {home.kind === "ready" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>{home.user.displayName}</Text>
            <Text style={styles.statusDetail}>User ID: {home.user.id}</Text>
          </View>
        ) : null}

        <Pressable style={styles.button} onPress={refreshHome}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f4ee",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  title: {
    color: "#171412",
    fontSize: 42,
    fontWeight: "800",
  },
  subtitle: {
    color: "#4f4740",
    fontSize: 17,
    lineHeight: 24,
  },
  statusPanel: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statusLabel: {
    color: "#171412",
    fontSize: 18,
    fontWeight: "700",
  },
  statusDetail: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 20,
  },
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
});
