import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Linking, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { deleteCurrentUser, updateCurrentUser } from "../api/tvlore-api";
import { getSupabaseAccessToken, isSupabaseConfigured, signOut as signOutFromSupabase } from "../auth/supabase-auth";
import { formatWatchCountry } from "../catalog/watch-country";
import { apiBaseUrl } from "../config/env";
import { HoloProfileCard, HoloProfileCardSkeleton } from "../home/HoloProfileCard";
import { styles } from "../home/home-styles";
import { useHomeModel } from "../home/use-home-model";

const availabilityCountries = ["CL", "US", "MX", "AR", "BR", "ES"] as const;
const legalLinks = [
  { label: "Privacy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
  { label: "Support", path: "/support" },
  { label: "Deletion help", path: "/account-deletion" },
] as const;

type CountryActionState =
  | { kind: "idle" }
  | { country: string; kind: "loading" }
  | { kind: "error"; message: string };

type DeleteAccountActionState =
  | { kind: "idle" }
  | { kind: "confirming" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export default function ProfileScreen() {
  const [countryAction, setCountryAction] = useState<CountryActionState>({ kind: "idle" });
  const [deleteAction, setDeleteAction] = useState<DeleteAccountActionState>({ kind: "idle" });
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

  async function confirmDeleteAccount() {
    if (deleteAction.kind === "loading") {
      return;
    }

    setDeleteAction({ kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      await deleteCurrentUser(token);
      await signOutFromSupabase();
      setDeleteAction({ kind: "idle" });
    } catch (error) {
      setDeleteAction({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not delete account",
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
          <HoloProfileCardSkeleton />
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

        <LegalLinksPanel />

        {auth.kind === "signedIn" ? (
          <DeleteAccountPanel
            action={deleteAction}
            onCancel={() => setDeleteAction({ kind: "idle" })}
            onConfirm={confirmDeleteAccount}
            onRequestConfirm={() => setDeleteAction({ kind: "confirming" })}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function LegalLinksPanel() {
  return (
    <View style={styles.statusPanel}>
      <Text style={styles.statusLabel}>Legal and support</Text>
      <View style={styles.legalLinksRow}>
        {legalLinks.map((link) => (
          <Pressable key={link.path} style={styles.legalLinkButton} onPress={() => openLegalLink(link.path)}>
            <Text style={styles.legalLinkText}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function openLegalLink(path: string) {
  void Linking.openURL(`${apiBaseUrl}${path}`).catch(() => undefined);
}

function DeleteAccountPanel({
  action,
  onCancel,
  onConfirm,
  onRequestConfirm,
}: {
  action: DeleteAccountActionState;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  onRequestConfirm: () => void;
}) {
  const isLoading = action.kind === "loading";
  const isConfirming = action.kind === "confirming" || action.kind === "error" || isLoading;

  return (
    <View style={styles.statusPanel}>
      <Text style={styles.statusLabel}>Delete account</Text>
      <Text style={styles.statusDetail}>
        Permanently removes your TVLore library, watchlist, ratings, reflections, and login account.
      </Text>
      {action.kind === "error" ? <Text style={styles.errorText}>{action.message}</Text> : null}
      {isConfirming ? (
        <View style={styles.accountActionRow}>
          <Pressable
            disabled={isLoading}
            style={[styles.dangerOutlineButton, isLoading ? styles.disabledButton : null]}
            onPress={onCancel}
          >
            <Text style={styles.dangerOutlineButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            disabled={isLoading}
            style={[styles.dangerButton, isLoading ? styles.disabledButton : null]}
            onPress={onConfirm}
          >
            <Text style={styles.dangerButtonText}>{isLoading ? "Deleting" : "Delete forever"}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.dangerOutlineButton} onPress={onRequestConfirm}>
          <Text style={styles.dangerOutlineButtonText}>Delete account</Text>
        </Pressable>
      )}
    </View>
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
