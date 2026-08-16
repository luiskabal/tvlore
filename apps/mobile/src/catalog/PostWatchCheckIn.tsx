import { Modal, Pressable, View } from "react-native";

import type { MediaType } from "../api/tvlore-api";
import { AppText, Button } from "../ui";
import { styles } from "./catalog-detail-styles";
import type { PreferenceActionState } from "./use-catalog-detail";

export type PostWatchCheckInTarget = {
  id: string;
  mediaType: MediaType;
  rating: number | null;
  title: string;
};

export function PostWatchCheckIn({
  onClose,
  onSetRating,
  preferenceAction,
  target,
}: {
  onClose: () => void;
  onSetRating: (mediaType: MediaType, id: string, rating: number) => Promise<boolean>;
  preferenceAction: PreferenceActionState;
  target: PostWatchCheckInTarget | null;
}) {
  const isSaving = preferenceAction.kind === "loading";

  if (!target) {
    return null;
  }

  const submitRating = async (rating: number) => {
    if (isSaving) {
      return;
    }

    const saved = await onSetRating(target.mediaType, target.id, rating);

    if (saved) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={Boolean(target)}
    >
      <View style={styles.checkInOverlay}>
        <Pressable
          accessibilityLabel="Close check-in"
          accessibilityRole="button"
          disabled={isSaving}
          onPress={onClose}
          style={styles.checkInBackdrop}
        />

        <View style={styles.checkInSheet}>
          <View style={styles.checkInHandle} />
          <AppText tone="accent" variant="caption">Watched</AppText>
          <AppText variant="section">How was it?</AppText>
          <AppText numberOfLines={2} tone="muted">{target.title}</AppText>

          {preferenceAction.kind === "error" ? <AppText tone="danger">{preferenceAction.message}</AppText> : null}

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected = target.rating === rating;

              return (
                <Pressable
                  accessibilityLabel={`Rate ${rating} out of 5`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSaving, selected: isSelected }}
                  disabled={isSaving}
                  key={rating}
                  onPress={() => {
                    void submitRating(rating);
                  }}
                  style={[
                    styles.ratingButton,
                    isSelected ? styles.ratingButtonSelected : null,
                    isSaving ? styles.iconActionButtonDisabled : null,
                  ]}
                >
                  <AppText style={isSelected ? styles.ratingButtonTextSelected : styles.ratingButtonText} variant="button">
                    {rating}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <Button
            disabled={isSaving}
            label="Skip"
            onPress={onClose}
            size="small"
            variant="secondary"
          />
        </View>
      </View>
    </Modal>
  );
}
