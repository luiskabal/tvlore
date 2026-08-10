import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { AppState, Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const authRedirectUrl = "tvlore://auth/callback";

WebBrowser.maybeCompleteAuthSession();

export const supabaseProjectUrl = supabaseUrl ?? "Not configured";

const secureStoreAdapter = {
  getItem(key: string) {
    return SecureStore.getItemAsync(key);
  },
  setItem(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: secureStoreAdapter } : { storage: AsyncStorage }),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;

export const isSupabaseConfigured = supabase !== null;

export function getAuthRedirectUrl() {
  return authRedirectUrl;
}

export async function getSupabaseAccessToken() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.access_token ?? null;
}

function extractSessionFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const hashParams = parsedUrl.hash.startsWith("#") ? parsedUrl.hash.slice(1) : "";
  const queryParams = parsedUrl.search.startsWith("?") ? parsedUrl.search.slice(1) : "";
  const params = new URLSearchParams(hashParams || queryParams);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const redirectTo = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("Google OAuth URL was not returned");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success") {
    return false;
  }

  const session = extractSessionFromUrl(result.url);

  if (!session) {
    throw new Error("Google OAuth did not return a session");
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });

  if (sessionError) {
    throw sessionError;
  }

  return true;
}

export async function signOut() {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

if (Platform.OS !== "web" && supabase) {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
