import { router, useLocalSearchParams } from "expo-router";

import { BackButton, Button, EmptyState, Screen, ScreenScroll } from "../ui";
import { SeasonContent, SeasonDetailSkeleton } from "./SeasonContent";
import { styles } from "./season-detail-styles";
import { useSeasonDetail } from "./use-season-detail";

export default function SeasonDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; seasonNumber?: string | string[] }>();
  const showId = typeof params.id === "string" ? params.id : null;
  const seasonNumber = typeof params.seasonNumber === "string" ? parseSeasonNumber(params.seasonNumber) : null;
  const { loadMoreEpisodes, refresh, setEpisodeWatched, setSeasonWatched, state, watchAction } = useSeasonDetail(showId, seasonNumber);

  return (
    <Screen>
      <ScreenScroll
        onScroll={(event) => {
          if (isNearBottom(event.nativeEvent)) {
            void loadMoreEpisodes();
          }
        }}
        scrollEventThrottle={200}
      >
        <BackButton onPress={() => router.back()} />

        {state.kind === "loading" ? (
          <SeasonDetailSkeleton />
        ) : null}

        {state.kind === "error" ? (
          <EmptyState
            action={<Button label="Retry" onPress={refresh} />}
            detail={state.message}
            icon="albums-outline"
            title="Could not open season"
          />
        ) : null}

        {state.kind === "ready" ? (
          <SeasonContent
            episodeLoadError={state.episodeLoadError}
            isHydratingEpisodes={state.isHydratingEpisodes}
            isLoadingMoreEpisodes={state.isLoadingMoreEpisodes}
            onLoadMoreEpisodes={loadMoreEpisodes}
            onSetEpisodeWatched={setEpisodeWatched}
            onSetSeasonWatched={setSeasonWatched}
            onOpenEpisode={openEpisode}
            onOpenShow={openShow}
            season={state.detail}
            showProgress={state.showProgress}
            watchAction={watchAction}
          />
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

function openEpisode(episodeId: string) {
  router.push({
    pathname: "/episodes/[id]",
    params: { id: episodeId },
  });
}

function openShow(showId: string) {
  router.push({
    pathname: "/shows/[id]",
    params: { id: showId },
  });
}

function parseSeasonNumber(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function isNearBottom(event: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } }) {
  return event.contentOffset.y + event.layoutMeasurement.height >= event.contentSize.height - 360;
}
