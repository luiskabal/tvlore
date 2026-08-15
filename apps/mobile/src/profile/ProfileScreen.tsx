import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { updateCurrentUser } from "../api/tvlore-api";
import { getSupabaseAccessToken, isSupabaseConfigured } from "../auth/supabase-auth";
import { formatWatchCountry } from "../catalog/watch-country";
import { HoloProfileCard } from "../home/HoloProfileCard";
import { LibraryOverviewSkeleton } from "../home/LibraryOverview";
import { styles } from "../home/home-styles";
import { useHomeModel } from "../home/use-home-model";

const availabilityCountries = ["CL", "US", "MX", "AR", "BR", "ES"] as const;

type CountryActionState =
  | { kind: "idle" }
  | { country: string; kind: "loading" }
  | { kind: "error"; message: string };

export default function ProfileScreen() {
  const [countryAction, setCountryAction] = useState<CountryActionState>({ kind: "idle" });
  const {
    auth,
    authActionMessage,
    backendStatus,
    continueWithGoogle,
    home,
    homeData,
    isAuthActionRunning,
    refreshHome,
    signOut,
  } = useHomeModel({ includeRecommendations: false });

  async function updateAvailabilityCountry(availabilityCountry: string) {
    if (countryAction.kind === "loading" || homeData?.user?.availabilityCountry === availabilityCountry) {
      return;
    }

    setCountryAction({ country: availabilityCountry, kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      await updateCurrentUser(token, { availabilityCountry });
      await refreshHome();
      setCountryAction({ kind: "idle" });
    } catch (error) {
      setCountryAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not update country",
      });
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your watching identity.</Text>
        </View>

        {homeData?.user && homeData.library ? (
          <HoloProfileCard
            avatarUrl={auth.kind === "signedIn" ? auth.avatarUrl : null}
            library={homeData.library}
            userName={homeData.user.displayName}
          />
        ) : home.kind === "loading" ? (
          <LibraryOverviewSkeleton />
        ) : (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>Sign in with Google</Text>
            <Text style={styles.statusDetail}>Create your TVLore profile and keep it synced.</Text>
            {authActionMessage ? <Text style={styles.errorText}>{authActionMessage}</Text> : null}
            <Pressable
              disabled={!isSupabaseConfigured || isAuthActionRunning}
              style={[styles.googleButton, !isSupabaseConfigured || isAuthActionRunning ? styles.disabledButton : null]}
              onPress={continueWithGoogle}
            >
              <Text style={styles.googleButtonText}>
                {isAuthActionRunning ? "Opening Google" : "Continue with Google"}
              </Text>
            </Pressable>
          </View>
        )}

        {auth.kind === "signedIn" && homeData?.user ? (
          <AvailabilityCountryPanel
            action={countryAction}
            country={homeData.user.availabilityCountry}
            onSelect={updateAvailabilityCountry}
          />
        ) : null}

        {auth.kind === "signedIn" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>Account</Text>
            <Text style={styles.statusDetail}>{auth.displayName ?? auth.email}</Text>
            <Text style={styles.statusDetail}>{backendStatus.detail}</Text>
          </View>
        ) : null}

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
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function AvailabilityCountryPanel({
  action,
  country,
  onSelect,
}: {
  action: CountryActionState;
  country: string;
  onSelect: (country: string) => void;
}) {
  const normalizedCountry = country.toUpperCase();

  return (
    <View style={styles.statusPanel}>
      <Text style={styles.statusLabel}>Where to watch country</Text>
      <Text style={styles.statusDetail}>Streaming availability uses {formatWatchCountry(normalizedCountry)}.</Text>
      <View style={styles.countryOptionsRow}>
        {availabilityCountries.map((option) => {
          const isSelected = normalizedCountry === option;
          const isLoading = action.kind === "loading" && action.country === option;

          return (
            <Pressable
              key={option}
              disabled={action.kind === "loading" || isSelected}
              style={[
                styles.countryOptionButton,
                isSelected ? styles.countryOptionButtonSelected : null,
                action.kind === "loading" && !isLoading ? styles.disabledButton : null,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[styles.countryOptionText, isSelected ? styles.countryOptionTextSelected : null]}>
                {isLoading ? "Saving" : formatWatchCountry(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {action.kind === "error" ? <Text style={styles.errorText}>{action.message}</Text> : null}
    </View>
  );
}
