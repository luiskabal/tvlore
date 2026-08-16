import { View } from "react-native";

import type { MediaType } from "../api/tvlore-api";
import { Skeleton } from "../ui";
import { styles } from "./catalog-detail-styles";

export function CatalogDetailSkeleton({ mediaType }: { mediaType: MediaType }) {
  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        <Skeleton height={168} width={114} />
        <View style={styles.skeletonHeroText}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTitleBlock}>
              <Skeleton height={26} width={62} />
              <Skeleton height={34} width="84%" />
              <Skeleton height={14} width="54%" />
            </View>

            <QuickActionSkeleton />
          </View>
        </View>
      </View>

      <View style={styles.skeletonOverview}>
        <Skeleton height={15} />
        <Skeleton height={15} />
        <Skeleton height={16} width="70%" />
      </View>

      <WhereToWatchSkeleton />
      <RatingPanelSkeleton />

      {mediaType === "show" ? (
        <>
          <ProgressPanelSkeleton />
          <ShowSeasonsSkeleton />
        </>
      ) : null}
    </View>
  );
}

function ShowSeasonsSkeleton() {
  return (
    <View style={styles.seasonsSection}>
      <Skeleton height={22} width="42%" />
      <Skeleton height={14} width="54%" />

      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonSeasonRow}>
          <View style={styles.skeletonSeasonBody}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={14} width="48%" />
          </View>
        </View>
      ))}
    </View>
  );
}

function WhereToWatchSkeleton() {
  return (
    <View style={styles.statusPanel}>
      <View style={styles.panelHeaderRow}>
        <Skeleton height={22} width="44%" />
        <Skeleton height={26} radius={999} width={42} />
      </View>
      <View style={styles.providerSection}>
        <Skeleton height={14} width={54} />
        <View style={styles.providerRow}>
          <Skeleton height={54} width={54} />
          <Skeleton height={54} width={54} />
        </View>
      </View>
      <Skeleton height={14} width="74%" />
    </View>
  );
}

function ProgressPanelSkeleton() {
  return (
    <View style={styles.statusPanel}>
      <Skeleton height={22} width="34%" />
      <Skeleton height={16} width="76%" />
      <Skeleton height={16} width="62%" />
    </View>
  );
}

function RatingPanelSkeleton() {
  return (
    <View style={styles.ratingCompareRow}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.ratingMetric}>
          <Skeleton height={12} width={44} />
          <Skeleton height={20} width={78} />
        </View>
      ))}
    </View>
  );
}

function QuickActionSkeleton() {
  return (
    <View style={styles.quickActionRow}>
      <Skeleton height={44} radius={999} width={44} />
      <Skeleton height={44} radius={999} width={44} />
    </View>
  );
}
