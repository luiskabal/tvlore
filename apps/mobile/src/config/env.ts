import Constants from "expo-constants";
import { Platform } from "react-native";

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabaseProjectUrl = supabaseUrl ?? "Not configured";
export const apiBaseUrl = getApiBaseUrl();

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
