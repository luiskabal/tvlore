import { useRef, useState } from "react";
import { Animated, Image, Text, type GestureResponderEvent, View } from "react-native";

import type { LibraryResponse } from "../api/tvlore-api";
import { styles } from "./home-styles";

type HoloProfileCardProps = {
  avatarUrl: string | null;
  library: LibraryResponse;
  userName: string;
};

const initialTilt = {
  x: 0,
  y: 0,
};

export function HoloProfileCard({ avatarUrl, library, userName }: HoloProfileCardProps) {
  const tilt = useRef(new Animated.ValueXY(initialTilt)).current;
  const shine = useRef(new Animated.ValueXY({ x: 0.5, y: 0.5 })).current;
  const [cardSize, setCardSize] = useState({ height: 1, width: 1 });

  const rotateX = tilt.y.interpolate({
    inputRange: [-1, 1],
    outputRange: ["7deg", "-7deg"],
  });
  const rotateY = tilt.x.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-7deg", "7deg"],
  });
  const shineTranslateX = shine.x.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });
  const shineTranslateY = shine.y.interpolate({
    inputRange: [0, 1],
    outputRange: [-70, 70],
  });

  function updateHolo(event: GestureResponderEvent) {
    const x = event.nativeEvent.locationX / cardSize.width;
    const y = event.nativeEvent.locationY / cardSize.height;
    const clampedX = clamp(x);
    const clampedY = clamp(y);

    tilt.setValue({
      x: (clampedX - 0.5) * 2,
      y: (clampedY - 0.5) * 2,
    });
    shine.setValue({ x: clampedX, y: clampedY });
  }

  function resetHolo() {
    Animated.parallel([
      Animated.spring(tilt, {
        friction: 8,
        tension: 80,
        toValue: initialTilt,
        useNativeDriver: true,
      }),
      Animated.spring(shine, {
        friction: 8,
        tension: 80,
        toValue: { x: 0.5, y: 0.5 },
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Animated.View
      onLayout={(event) => setCardSize(event.nativeEvent.layout)}
      onTouchCancel={resetHolo}
      onTouchEnd={resetHolo}
      onTouchMove={updateHolo}
      onTouchStart={updateHolo}
      style={[
        styles.holoCard,
        {
          transform: [
            { perspective: 900 },
            { rotateX },
            { rotateY },
          ],
        },
      ]}
    >
      <View style={styles.holoCardBorder} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.holoShine,
          {
            transform: [
              { translateX: shineTranslateX },
              { translateY: shineTranslateY },
              { rotate: "24deg" },
            ],
          },
        ]}
      />
      <View pointerEvents="none" style={styles.holoSpeckleLayer}>
        <View style={[styles.holoSpeckle, styles.holoSpecklePink]} />
        <View style={[styles.holoSpeckle, styles.holoSpeckleGreen]} />
        <View style={[styles.holoSpeckle, styles.holoSpeckleBlue]} />
      </View>

      <View style={styles.holoCardHeader}>
        <View>
          <Text style={styles.holoEyebrow}>TVLore Card</Text>
          <Text style={styles.holoName}>{userName}</Text>
        </View>
        <Text style={styles.holoBadge}>Holo</Text>
      </View>

      <View style={styles.holoPortraitFrame}>
        {avatarUrl ? (
          <Image resizeMode="cover" source={{ uri: avatarUrl }} style={styles.holoPortrait} />
        ) : (
          <View style={styles.holoInitials}>
            <Text style={styles.holoInitialsText}>{getInitials(userName)}</Text>
          </View>
        )}
      </View>

      <View style={styles.holoStatsRow}>
        <HoloStat label="Shows" value={library.summary.watchedShowCount} />
        <HoloStat label="Movies" value={library.summary.watchedMovieCount} />
        <HoloStat label="Episodes" value={library.summary.watchedEpisodeCount} />
      </View>
    </Animated.View>
  );
}

function HoloStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.holoStat}>
      <Text style={styles.holoStatValue}>{value}</Text>
      <Text style={styles.holoStatLabel}>{label}</Text>
    </View>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");

  return initials || "TV";
}
