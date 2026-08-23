import { useEffect, useState } from "react";
import Constants from "expo-constants";
import * as AppleAuthentication from "expo-apple-authentication";
import { Linking, Platform, Pressable, Text, View } from "react-native";

import { deleteCurrentUser, getAccountDeletionStatus, updateCurrentUser } from "../api/tvlore-api";
import { getSupabaseAccessToken, isSupabaseConfigured, signOut as signOutFromSupabase } from "../auth/supabase-auth";
import { formatWatchCountry } from "../catalog/watch-country";
import { apiBaseUrl } from "../config/env";
import { HoloProfileCard, HoloProfileCardSkeleton } from "../home/HoloProfileCard";
import { styles } from "../home/home-styles";
import { useHomeModel } from "../home/use-home-model";
import { notifyLibraryChanged } from "../library/library-refresh";
import { AppText, Button, PageHeader, Screen, ScreenScroll, Surface } from "../ui";

const availabilityCountries = ["CL", "US", "MX", "AR", "BR", "ES"] as const;
const legalLinks = [
  { label: "Privacy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
  { label: "Support", path: "/support" },
  { label: "Deletion help", path: "/account-deletion" },
] as const;

const appVersion = Constants.expoConfig?.version ?? "1.0.0";
const appIdentifier = Platform.select({
  android: Constants.expoConfig?.android?.package,
  ios: Constants.expoConfig?.ios?.bundleIdentifier,
  default: Constants.expoConfig?.slug,
}) ?? "tvlore";
const platformLabel = Platform.select({
  android: "Android",
  ios: "iOS",
  default: Platform.OS,
});

type CountryActionState =
  | { kind: "idle" }
  | { country: string; kind: "loading" }
  | { kind: "error"; message: string };

type DeleteAccountActionState =
  | { kind: "idle" }
  | { kind: "confirming" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

type AccountDeletionStatusState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { configured: boolean; kind: "ready" }
  | { kind: "error"; message: string };

export default function ProfileScreen() {
  const [countryAction, setCountryAction] = useState<CountryActionState>({ kind: "idle" });
  const [deleteAction, setDeleteAction] = useState<DeleteAccountActionState>({ kind: "idle" });
  const [deleteStatus, setDeleteStatus] = useState<AccountDeletionStatusState>({ kind: "idle" });
  const {
    auth,
    authActionMessage,
    continueWithApple,
    continueWithGoogle,
    home,
    homeData,
    isAppleSignInAvailable,
    isAuthActionRunning,
    refreshHome,
    signOut,
  } = useHomeModel({ includeRecommendations: false });

  useEffect(() => {
    if (auth.kind !== "signedIn") {
      setDeleteStatus({ kind: "idle" });
      return;
    }

    let isMounted = true;

    setDeleteStatus({ kind: "loading" });

    void getSupabaseAccessToken()
      .then((token) => getAccountDeletionStatus(token))
      .then((status) => {
        if (isMounted) {
          setDeleteStatus({ configured: status.configured, kind: "ready" });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setDeleteStatus({
            kind: "error",
            message: error instanceof Error ? error.message : "Could not check account deletion",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [auth.kind]);

  async function updateAvailabilityCountry(availabilityCountry: string) {
    if (countryAction.kind === "loading" || homeData?.user?.availabilityCountry === availabilityCountry) {
      return;
    }

    setCountryAction({ country: availabilityCountry, kind: "loading" });

    try {
      const token = await getSupabaseAccessToken();

      await updateCurrentUser(token, { availabilityCountry });
      notifyLibraryChanged();
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
    <Screen>
      <ScreenScroll>
        <PageHeader subtitle="Your watching identity." title="Profile" />

        {homeData?.user && homeData.library ? (
          <HoloProfileCard
            avatarUrl={auth.kind === "signedIn" ? auth.avatarUrl : null}
            library={homeData.library}
            userName={homeData.user.displayName}
          />
        ) : home.kind === "loading" ? (
          <HoloProfileCardSkeleton />
        ) : (
          <Surface>
            <AppText variant="section">Sign in</AppText>
            <AppText tone="muted">Create your TVLore profile and keep it synced.</AppText>
            {authActionMessage ? <AppText tone="danger">{authActionMessage}</AppText> : null}
            <View style={styles.authButtons}>
              {isAppleSignInAvailable ? (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  cornerRadius={8}
                  style={[styles.appleSignInButton, isAuthActionRunning ? styles.disabledButton : null]}
                  onPress={continueWithApple}
                />
              ) : null}
              <Button
                disabled={!isSupabaseConfigured || isAuthActionRunning}
                icon="logo-google"
                isLoading={isAuthActionRunning}
                label="Continue with Google"
                loadingLabel="Opening sign-in"
                onPress={continueWithGoogle}
                variant="outline"
              />
            </View>
          </Surface>
        )}

        {auth.kind === "signedIn" && homeData?.user ? (
          <AvailabilityCountryPanel
            action={countryAction}
            country={homeData.user.availabilityCountry}
            onSelect={updateAvailabilityCountry}
          />
        ) : null}

        {auth.kind === "signedIn" ? (
          <Surface>
            <Text style={styles.statusLabel}>Account</Text>
            <Text style={styles.statusDetail}>{auth.displayName ?? auth.email}</Text>
          </Surface>
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

        <AboutTvlorePanel />

        <LegalLinksPanel />

        {auth.kind === "signedIn" ? (
          <DeleteAccountPanel
            action={deleteAction}
            onCancel={() => setDeleteAction({ kind: "idle" })}
            onConfirm={confirmDeleteAccount}
            onRequestConfirm={() => setDeleteAction({ kind: "confirming" })}
            status={deleteStatus}
          />
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

function AboutTvlorePanel() {
  return (
    <Surface>
      <Text style={styles.statusLabel}>About TVLore</Text>
      <View style={styles.aboutMetaGrid}>
        <View style={styles.aboutMetaItem}>
          <Text style={styles.sectionEyebrow}>Version</Text>
          <Text style={styles.statusDetail}>{appVersion}</Text>
        </View>
        <View style={styles.aboutMetaItem}>
          <Text style={styles.sectionEyebrow}>Platform</Text>
          <Text style={styles.statusDetail}>{platformLabel}</Text>
        </View>
        <View style={styles.aboutMetaItem}>
          <Text style={styles.sectionEyebrow}>App ID</Text>
          <Text style={styles.statusDetail}>{appIdentifier}</Text>
        </View>
      </View>
      <Pressable style={styles.legalLinkButton} onPress={() => openLegalLink("/support")}>
        <Text style={styles.legalLinkText}>Contact support</Text>
      </Pressable>
    </Surface>
  );
}

function LegalLinksPanel() {
  return (
    <Surface>
      <Text style={styles.statusLabel}>Legal and support</Text>
      <View style={styles.legalLinksRow}>
        {legalLinks.map((link) => (
          <Pressable key={link.path} style={styles.legalLinkButton} onPress={() => openLegalLink(link.path)}>
            <Text style={styles.legalLinkText}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
    </Surface>
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
  status,
}: {
  action: DeleteAccountActionState;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  onRequestConfirm: () => void;
  status: AccountDeletionStatusState;
}) {
  const isLoading = action.kind === "loading";
  const isConfirming = action.kind === "confirming" || action.kind === "error" || isLoading;
  const isChecking = status.kind === "loading";
  const isNotConfigured = status.kind === "ready" && !status.configured;
  const canRequestDeletion = !isChecking && !isNotConfigured;

  return (
    <Surface>
      <Text style={styles.statusLabel}>Delete account</Text>
      <Text style={styles.statusDetail}>
        Permanently removes your TVLore library, watchlist, ratings, reflections, and login account.
      </Text>
      {isChecking ? <Text style={styles.statusDetail}>Checking account deletion availability.</Text> : null}
      {isNotConfigured ? (
        <Text style={styles.errorText}>Account deletion is not configured for this environment yet.</Text>
      ) : null}
      {status.kind === "error" ? <Text style={styles.errorText}>{status.message}</Text> : null}
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
            disabled={isLoading || !canRequestDeletion}
            style={[styles.dangerButton, isLoading || !canRequestDeletion ? styles.disabledButton : null]}
            onPress={onConfirm}
          >
            <Text style={styles.dangerButtonText}>{isLoading ? "Deleting" : "Delete forever"}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          disabled={!canRequestDeletion}
          style={[styles.dangerOutlineButton, !canRequestDeletion ? styles.disabledButton : null]}
          onPress={onRequestConfirm}
        >
          <Text style={styles.dangerOutlineButtonText}>Delete account</Text>
        </Pressable>
      )}
    </Surface>
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
    <Surface>
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
    </Surface>
  );
}
