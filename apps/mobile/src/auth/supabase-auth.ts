import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { AppState, Platform } from "react-native";

import { clearApiReadCache } from "../api/client";
import { supabaseProjectUrl, supabasePublishableKey, supabaseUrl } from "../config/env";

const authRedirectUrl = "tvlore://auth/callback";

WebBrowser.maybeCompleteAuthSession();

const secureStoreAdapter = {
  getItem(key: string) {
    return SecureStore.getItemAsync(key);
  },
  removeItem(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
  setItem(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: secureStoreAdapter } : { storage: AsyncStorage }),
        autoRefreshToken: true,
        detectSessionInUrl: false,
        lock: processLock,
        persistSession: true,
      },
    })
  : null;

export { supabaseProjectUrl };

export const isSupabaseConfigured = supabase !== null;

export function getAuthRedirectUrl() {
  return authRedirectUrl;
}

export async function getIsAppleSignInAvailable() {
  return Platform.OS === "ios" && await AppleAuthentication.isAvailableAsync();
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

  clearApiReadCache();

  return true;
}

export async function signInWithApple() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  if (Platform.OS !== "ios") {
    throw new Error("Apple sign-in is only available on iOS");
  }

  let credential: AppleAuthentication.AppleAuthenticationCredential;

  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error) {
    if (isAppleSignInCancelled(error)) {
      return false;
    }

    throw error;
  }

  if (!credential.identityToken) {
    throw new Error("Apple sign-in did not return an identity token");
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    ...(credential.authorizationCode ? { access_token: credential.authorizationCode } : {}),
  });

  if (error) {
    throw error;
  }

  await updateAppleProfileMetadata(credential);
  clearApiReadCache();

  return true;
}

export async function signOut() {
  if (!supabase) {
    clearApiReadCache();
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  clearApiReadCache();
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

async function updateAppleProfileMetadata(credential: AppleAuthentication.AppleAuthenticationCredential) {
  if (!supabase || !credential.fullName) {
    return;
  }

  const fullName = AppleAuthentication.formatFullName(credential.fullName).trim();

  if (!fullName) {
    return;
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      family_name: credential.fullName.familyName,
      full_name: fullName,
      given_name: credential.fullName.givenName,
      name: fullName,
    },
  });

  if (error) {
    throw error;
  }
}

function isAppleSignInCancelled(error: unknown) {
  return isRecord(error) && error.code === "ERR_REQUEST_CANCELED";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
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
