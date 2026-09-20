import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { useAuthSession } from "./use-auth-session";
import { AppText, BrandMark, Button, Screen, ScreenScroll, Surface, ui } from "../ui";

const appVersion = Constants.expoConfig?.version ?? "1.0.0";

export default function LoginScreen() {
  const handleSessionChange = useCallback(() => undefined, []);
  const {
    auth,
    authActionMessage,
    continueWithApple,
    continueWithGoogle,
    isAppleSignInAvailable,
    isAuthActionRunning,
  } = useAuthSession(handleSessionChange);

  return (
    <Screen>
      <ScreenScroll contentContainerStyle={styles.content} options={{ bottom: ui.space.xxxl, top: ui.space.xxxl }}>
        <View style={styles.brand}>
          <BrandMark size={88} />
          <AppText style={styles.brandName}>TVLore</AppText>
          <AppText tone="muted">Sign in to continue.</AppText>
        </View>

        <Surface style={styles.panel}>
          <AppText variant="section">Welcome back</AppText>
          <AppText tone="muted">Keep your library, progress, and ratings synced.</AppText>

          {authActionMessage ? <AppText tone="danger">{authActionMessage}</AppText> : null}
          {auth.kind === "error" ? <AppText tone="danger">{auth.message}</AppText> : null}
          {auth.kind === "unconfigured" ? (
            <AppText tone="danger">Authentication is not configured for this build.</AppText>
          ) : null}

          <View style={styles.buttons}>
            {isAppleSignInAvailable ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                cornerRadius={ui.radius.sm}
                style={[styles.appleButton, isAuthActionRunning ? styles.disabledButton : null]}
                onPress={continueWithApple}
              />
            ) : null}
            <Button
              disabled={auth.kind === "unconfigured" || isAuthActionRunning}
              icon="logo-google"
              isLoading={isAuthActionRunning}
              label="Continue with Google"
              loadingLabel="Opening sign-in"
              onPress={continueWithGoogle}
              style={styles.googleButton}
              variant="outline"
            />
          </View>
        </Surface>

        <AppText style={styles.version} tone="muted">v{appVersion}</AppText>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  appleButton: {
    alignSelf: "stretch",
    height: 48,
    width: "100%",
  },
  brand: {
    alignItems: "center",
    gap: ui.space.sm,
    paddingBottom: ui.space.md,
  },
  brandName: {
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
  },
  buttons: {
    alignItems: "stretch",
    gap: ui.space.md,
    paddingTop: ui.space.sm,
  },
  content: {
    alignItems: "stretch",
    justifyContent: "center",
    minHeight: "100%",
  },
  disabledButton: {
    opacity: 0.6,
  },
  googleButton: {
    alignSelf: "stretch",
    width: "100%",
  },
  panel: {
    alignSelf: "center",
    maxWidth: 420,
    width: "100%",
  },
  version: {
    alignSelf: "center",
    fontSize: 12,
    paddingTop: ui.space.md,
  },
});
