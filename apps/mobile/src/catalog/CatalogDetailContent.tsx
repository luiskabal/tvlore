import { View } from "react-native";

import type { CatalogDetailResponse, MediaType } from "../api/tvlore-api";
import { AppText, Badge, PosterImage } from "../ui";
import { styles } from "./catalog-detail-styles";
import { TitleActionMessages, TitleActionRow } from "./CatalogDetailActions";
import { RatingMatchPanel, ShowProgressPanel, ShowSeasonsPanel, WhereToWatchPanel } from "./CatalogDetailPanels";
import { getMetadata } from "./catalog-detail-format";
import { getTmdbPosterUrl } from "./posters";
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
  const setMovieWatched = async (movieId: string, watched: boolean) => {
    const saved = await onSetMovieWatched(movieId, watched);

    if (saved && watched) {
      onOpenCheckIn("movie", movieId);
    }
  };
  const setShowWatched = async (showId: string, watched: boolean) => {
    const saved = await onSetShowWatched(showId, watched);

    if (saved && watched) {
      onOpenCheckIn("show", showId);
    }
  };

  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        <PosterImage
          label={detail.mediaType === "show" ? "TV" : "M"}
          size="detail"
          uri={detail.posterPath ? getTmdbPosterUrl(detail.posterPath) : null}
        />

        <View style={styles.heroText}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTitleBlock}>
              <Badge label={detail.mediaType === "show" ? "Show" : "Movie"} />
              <AppText style={styles.title}>{detail.title}</AppText>
              <AppText tone="muted">{getMetadata(detail)}</AppText>
            </View>

            <TitleActionRow
              detail={detail}
              onSetInWatchlist={onSetInWatchlist}
              onSetMovieWatched={setMovieWatched}
              onSetShowWatched={setShowWatched}
              watchAction={watchAction}
              watchlistAction={watchlistAction}
            />
          </View>
        </View>
      </View>

      <TitleActionMessages watchAction={watchAction} watchlistAction={watchlistAction} />
      <RatingMatchPanel detail={detail} onSetRating={onSetRating} preferenceAction={preferenceAction} />

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
