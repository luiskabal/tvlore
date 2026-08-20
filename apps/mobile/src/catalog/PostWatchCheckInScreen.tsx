import { router, useLocalSearchParams } from "expo-router";
import { useCallback, type ReactNode } from "react";
import { View } from "react-native";

import type { MediaType, PreferenceMediaType, WatchReflectionInput } from "../api/tvlore-api";
import { BackButton, Button, EmptyState, Screen, ScreenScroll, Skeleton } from "../ui";
import { styles } from "./catalog-detail-styles";
import { PostWatchCheckIn, type PostWatchCheckInTarget } from "./PostWatchCheckIn";
import { useCatalogDetail } from "./use-catalog-detail";
import { useEpisodeDetail } from "./use-episode-detail";

export default function PostWatchCheckInScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; mediaType?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const mediaType = typeof params.mediaType === "string" ? parseMediaType(params.mediaType) : null;

  if (!id || !mediaType) {
    return (
      <CheckInShell>
        <EmptyState
          action={<Button label="Back" onPress={() => router.back()} />}
          detail="Missing or invalid check-in route params."
          icon="chatbubble-ellipses-outline"
          title="Could not open check-in"
        />
      </CheckInShell>
    );
  }

  return mediaType === "episode"
    ? <EpisodeCheckIn id={id} />
    : <CatalogCheckIn id={id} mediaType={mediaType} />;
}

function CatalogCheckIn({ id, mediaType }: { id: string; mediaType: MediaType }) {
  const { castState, loadCast, refresh, reflectionAction, setReflection, state } = useCatalogDetail(mediaType, id);

  if (state.kind === "loading") {
    return <CheckInLoading />;
  }

  if (state.kind === "error") {
    return (
      <CheckInShell>
        <EmptyState
          action={<Button label="Retry" onPress={refresh} />}
          detail={state.message}
          icon="chatbubble-ellipses-outline"
          title="Could not open check-in"
        />
      </CheckInShell>
    );
  }

  const target: PostWatchCheckInTarget = {
    id: state.detail.id,
    mediaType: state.detail.mediaType,
    rating: state.detail.rating,
    reflection: state.detail.reflection,
    title: state.detail.title,
  };

  return (
    <CheckInShell>
      <PostWatchCheckIn
        actionState={reflectionAction}
        castState={castState}
        onCancel={() => router.back()}
        onLoadCast={loadCast}
        onSave={setReflection}
        target={target}
      />
    </CheckInShell>
  );
}

function EpisodeCheckIn({ id }: { id: string }) {
  const { castState, loadCast, refresh, reflectionAction, setReflection, state } = useEpisodeDetail(id);
  const loadEpisodeCast = useCallback(() => loadCast(), [loadCast]);
  const saveReflection = useCallback((_mediaType: PreferenceMediaType, _id: string, input: WatchReflectionInput) => {
    return setReflection(input);
  }, [setReflection]);

  if (state.kind === "loading") {
    return <CheckInLoading />;
  }

  if (state.kind === "error") {
    return (
      <CheckInShell>
        <EmptyState
          action={<Button label="Retry" onPress={refresh} />}
          detail={state.message}
          icon="chatbubble-ellipses-outline"
          title="Could not open check-in"
        />
      </CheckInShell>
    );
  }

  const target: PostWatchCheckInTarget = {
    id: state.detail.id,
    mediaType: "episode",
    rating: state.detail.rating,
    reflection: state.detail.reflection,
    title: `${state.detail.showTitle} - ${state.detail.title}`,
  };

  return (
    <CheckInShell>
      <PostWatchCheckIn
        actionState={reflectionAction}
        castState={castState}
        onCancel={() => router.back()}
        onLoadCast={loadEpisodeCast}
        onSave={saveReflection}
        target={target}
      />
    </CheckInShell>
  );
}

function CheckInLoading() {
  return (
    <CheckInShell>
      <View style={styles.checkInPage}>
        <Skeleton height={13} width={70} />
        <Skeleton height={32} width="60%" />
        <Skeleton height={18} width="84%" />
        <View style={styles.ratingRow}>
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton height={42} key={item} width={42} />
          ))}
        </View>
        <View style={styles.castPickerRow}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.castSkeleton}>
              <View style={styles.castImagePlaceholder} />
              <View style={styles.castSkeletonText} />
            </View>
          ))}
        </View>
        <Skeleton height={84} />
      </View>
    </CheckInShell>
  );
}

function CheckInShell({ children }: { children: ReactNode }) {
  return (
    <Screen>
      <ScreenScroll>
        <BackButton onPress={() => router.back()} />
        {children}
      </ScreenScroll>
    </Screen>
  );
}

function parseMediaType(value: string): PreferenceMediaType | null {
  return value === "show" || value === "movie" || value === "episode" ? value : null;
}
