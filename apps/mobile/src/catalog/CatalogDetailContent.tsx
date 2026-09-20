import { ImageBackground, View } from "react-native";

import type { CatalogDetailResponse, MediaType } from "../api/tvlore-api";
import { AppText, Badge } from "../ui";
import { styles } from "./catalog-detail-styles";
import { TitleActionMessages, TitleSaveAction, TitleTrackingPanel } from "./CatalogDetailActions";
import { CheckInPanel, RatingMatchPanel, ShowProgressPanel, ShowSeasonsPanel, WhereToWatchPanel } from "./CatalogDetailPanels";
import { getMetadata } from "./catalog-detail-format";
import { getTmdbBackdropUrl } from "./posters";
import type { PreferenceActionState, WatchActionState, WatchlistActionState, WatchProvidersState } from "./use-catalog-detail";

export { CatalogDetailSkeleton } from "./CatalogDetailSkeleton";

export function CatalogDetailContent({
  detail,
  onOpenCheckIn,
  onOpenShowSeason,
  onSetInWatchlist,
  onSetMovieWatched,
  onSetRating,
  onSetShowWatched,
  preferenceAction,
  watchAction,
  watchlistAction,
  watchProvidersState,
}: {
  detail: CatalogDetailResponse;
  onOpenCheckIn: (mediaType: MediaType, id: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onSetInWatchlist: (mediaType: MediaType, id: string, inWatchlist: boolean) => void;
  onSetMovieWatched: (movieId: string, watched: boolean) => Promise<boolean>;
  onSetRating: (mediaType: MediaType, id: string, rating: number | null) => Promise<boolean>;
  onSetShowWatched: (showId: string, watched: boolean) => Promise<boolean>;
  preferenceAction: PreferenceActionState;
  watchAction: WatchActionState;
  watchlistAction: WatchlistActionState;
  watchProvidersState: WatchProvidersState;
}) {
  const backdropUri = detail.backdropPath ? getTmdbBackdropUrl(detail.backdropPath) : null;

  return (
    <View style={styles.detail}>
      {backdropUri ? (
        <ImageBackground
          accessibilityIgnoresInvertColors
          imageStyle={styles.heroBackdropImage}
          resizeMode="cover"
          source={{ uri: backdropUri }}
          style={styles.heroBackdrop}
        >
          <DetailHeroContent
            detail={detail}
            onSetInWatchlist={onSetInWatchlist}
            watchlistAction={watchlistAction}
          />
        </ImageBackground>
      ) : (
        <View style={[styles.heroBackdrop, styles.heroBackdropFallback]}>
          <DetailHeroContent
            detail={detail}
            onSetInWatchlist={onSetInWatchlist}
            watchlistAction={watchlistAction}
          />
        </View>
      )}

      <TitleActionMessages watchAction={watchAction} watchlistAction={watchlistAction} />
      <RatingMatchPanel detail={detail} onSetRating={onSetRating} preferenceAction={preferenceAction} />
      <TitleTrackingPanel
        detail={detail}
        onOpenCheckIn={onOpenCheckIn}
        onSetMovieWatched={onSetMovieWatched}
        onSetShowWatched={onSetShowWatched}
        watchAction={watchAction}
      />
      <CheckInPanel detail={detail} />

      <AppText style={styles.overview}>{detail.overview || "No overview available."}</AppText>

      <WhereToWatchPanel state={watchProvidersState} />

      {detail.mediaType === "show" ? (
        <>
          <ShowProgressPanel show={detail} />
          <ShowSeasonsPanel onOpenShowSeason={onOpenShowSeason} show={detail} />
        </>
      ) : null}

    </View>
  );
}

function DetailHeroContent({
  detail,
  onSetInWatchlist,
  watchlistAction,
}: {
  detail: CatalogDetailResponse;
  onSetInWatchlist: (mediaType: MediaType, id: string, inWatchlist: boolean) => void;
  watchlistAction: WatchlistActionState;
}) {
  return (
    <>
      <View pointerEvents="none" style={styles.heroBackdropOverlay} />
      <View style={styles.heroContent}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroTitleBlock}>
            <Badge label={detail.mediaType === "show" ? "Show" : "Movie"} />
            <AppText style={styles.title}>{detail.title}</AppText>
            <AppText tone="muted">{getMetadata(detail)}</AppText>
          </View>

          <TitleSaveAction
            detail={detail}
            onSetInWatchlist={onSetInWatchlist}
            watchlistAction={watchlistAction}
          />
        </View>
      </View>
    </>
  );
}
