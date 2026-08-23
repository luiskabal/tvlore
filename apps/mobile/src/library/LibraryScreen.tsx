import { router } from "expo-router";

import { isSupabaseConfigured } from "../auth/supabase-auth";
import { LibraryOverview, LibraryOverviewSkeleton } from "../home/LibraryOverview";
import { useHomeModel } from "../home/use-home-model";
import { AppText, Button, IconButton, PageHeader, Screen, ScreenContent, ScreenScroll, Surface } from "../ui";
import { useLibraryChronology } from "./use-library-chronology";
import { useLibraryActions } from "./use-library-actions";
import { useLibraryLookahead } from "./use-library-lookahead";

export default function LibraryScreen() {
  const { libraryAction, removeRecentlyWatchedItem, removeWatchlistItem } = useLibraryActions();
  const { chronology, loadInitialChronology, loadMoreChronology } = useLibraryChronology();
  const {
    auth,
    authActionMessage,
    continueWithGoogle,
    home,
    homeData,
    isAuthActionRunning,
  } = useHomeModel({ includeRecommendations: false });
  const isSignedIn = auth.kind === "signedIn";

  useLibraryLookahead(homeData?.library ?? null, isSignedIn);

  return (
    <Screen>
      {homeData?.user ? (
        <ScreenContent fill options={{ bottom: 16 }}>
          <LibraryHeader showSearchButton={isSignedIn} />
          <LibraryOverview
            chronology={chronology}
            library={homeData.library}
            libraryAction={libraryAction}
            onChronologyVisible={loadInitialChronology}
            onLoadMoreChronology={loadMoreChronology}
            onOpenMovie={openMovie}
            onOpenEpisode={openEpisode}
            onOpenShow={openShow}
            onOpenShowSeason={openShowSeason}
            onRemoveRecentlyWatchedItem={removeRecentlyWatchedItem}
            onRemoveWatchlistItem={removeWatchlistItem}
          />
        </ScreenContent>
      ) : (
        <ScreenScroll>
          <LibraryHeader showSearchButton={isSignedIn} />

          {home.kind === "loading" ? (
            <LibraryOverviewSkeleton />
          ) : (
            <Surface>
              <AppText variant="section">Build your TVLore</AppText>
              <AppText tone="muted">Sign in to track movies, shows, and episodes.</AppText>
              {authActionMessage ? <AppText tone="danger">{authActionMessage}</AppText> : null}
              <Button
                disabled={!isSupabaseConfigured || isAuthActionRunning}
                icon="logo-google"
                isLoading={isAuthActionRunning}
                label="Continue with Google"
                loadingLabel="Opening Google"
                onPress={continueWithGoogle}
                variant="outline"
              />
            </Surface>
          )}
        </ScreenScroll>
      )}
    </Screen>
  );
}

function LibraryHeader({ showSearchButton }: { showSearchButton: boolean }) {
  return (
    <PageHeader
      action={showSearchButton ? (
        <IconButton icon="add" label="Search catalog" onPress={() => router.push("/search")} />
      ) : null}
      subtitle="Pick up where you left off."
      title="TVLore"
    />
  );
}

function openMovie(id: string) {
  router.push({ pathname: "/movies/[id]", params: { id } });
}

function openEpisode(id: string) {
  router.push({ pathname: "/episodes/[id]", params: { id } });
}

function openShow(id: string) {
  router.push({ pathname: "/shows/[id]", params: { id } });
}

function openShowSeason(showId: string, seasonNumber: number) {
  router.push({
    pathname: "/shows/[id]/seasons/[seasonNumber]",
    params: { id: showId, seasonNumber: String(seasonNumber) },
  });
}
