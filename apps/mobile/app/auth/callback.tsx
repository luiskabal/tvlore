import * as ExpoLinking from "expo-linking";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

import { completeOAuthCallback, getSupabaseAccessToken } from "../../src/auth/supabase-auth";

export default function AuthCallbackRoute() {
  const callbackUrl = ExpoLinking.useURL();
  const [message, setMessage] = useState("Signing you in...");
  const handledUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const openLibrary = useCallback(() => {
    if (!isMountedRef.current || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    setMessage("Opening your library...");
    setTimeout(() => {
      if (isMountedRef.current) {
        router.replace("/library");
      }
    }, 0);
  }, []);

  useEffect(() => {
    const url = callbackUrl;

    if (!url) {
      return;
    }

    if (handledUrlRef.current === url) {
      return;
    }

    handledUrlRef.current = url;

    async function completeCallback(urlToComplete: string) {
      try {
        const completed = await completeOAuthCallback(urlToComplete);

        if (completed || (await getSupabaseAccessToken())) {
          openLibrary();
          return;
        }

        if (isMountedRef.current) {
          throw new Error("Auth callback did not include a session");
        }
      } catch (error) {
        if (isMountedRef.current) {
          setMessage(error instanceof Error ? error.message : "Sign-in callback failed");
        }
      }
    }

    void completeCallback(url);
  }, [callbackUrl, openLibrary]);

  useEffect(() => {
    if (callbackUrl) {
      return undefined;
    }

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    function checkStoredSession() {
      attempts += 1;
      void getSupabaseAccessToken()
        .then((accessToken) => {
          if (accessToken) {
            openLibrary();
          } else if (attempts < 8 && isMountedRef.current) {
            retryTimer = setTimeout(checkStoredSession, 500);
          } else if (isMountedRef.current) {
            setMessage("Still finishing sign-in...");
          }
        })
        .catch((error) => {
          if (isMountedRef.current) {
            setMessage(error instanceof Error ? error.message : "Sign-in callback failed");
          }
        });
    }

    retryTimer = setTimeout(checkStoredSession, 250);

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [callbackUrl, openLibrary]);

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
