import * as ExpoLinking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

import { completeOAuthCallback } from "../../src/auth/supabase-auth";

export default function AuthCallbackRoute() {
  const callbackUrl = ExpoLinking.useURL();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const url = callbackUrl;

    if (!url) {
      return;
    }

    let isMounted = true;

    async function completeCallback(urlToComplete: string) {
      try {
        const completed = await completeOAuthCallback(urlToComplete);

        if (!completed) {
          throw new Error("Auth callback did not include a session");
        }

        if (isMounted) {
          router.replace("/library");
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error instanceof Error ? error.message : "Sign-in callback failed");
        }
      }
    }

    void completeCallback(url);

    return () => {
      isMounted = false;
    };
  }, [callbackUrl]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TVLore</Text>
      <Text style={styles.message}>{message}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f4ee",
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  message: {
    color: "#554e48",
    fontSize: 18,
    marginTop: 12,
  },
  title: {
    color: "#17110f",
    fontSize: 44,
    fontWeight: "900",
  },
});
