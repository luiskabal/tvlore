import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, TextInput, View } from "react-native";

import type { PreferenceMediaType, WatchReflection, WatchReflectionInput } from "../api/tvlore-api";
import { AppText, Button } from "../ui";
import { styles } from "./catalog-detail-styles";
import { createCheckInDraft, normalizeCheckInDraft, type PostWatchCastState, reactionOptions } from "./post-watch-check-in-model";
import { getTmdbProfileUrl } from "./posters";

export type PostWatchCheckInTarget = {
  id: string;
  mediaType: PreferenceMediaType;
  rating: number | null;
  reflection: WatchReflection | null;
  title: string;
};

export type PostWatchCheckInActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export function PostWatchCheckIn({
  actionState,
  castState,
  onCancel,
  onLoadCast,
  onSave,
  target,
}: {
  actionState: PostWatchCheckInActionState;
  castState: PostWatchCastState;
  onCancel: () => void;
  onLoadCast: (mediaType: PreferenceMediaType, id: string) => void;
  onSave: (mediaType: PreferenceMediaType, id: string, input: WatchReflectionInput) => Promise<boolean>;
  target: PostWatchCheckInTarget;
}) {
  const [draft, setDraft] = useState(() => createCheckInDraft(target.rating, target.reflection));
  const [isManualCharacterOpen, setManualCharacterOpen] = useState(false);
  const isSaving = actionState.kind === "loading";
  const hasCastSelection = castState.kind === "ready" && castState.items.some((member) => member.characterName === draft.favoriteCharacter);
  const showManualCharacterInput = isManualCharacterOpen || (Boolean(draft.favoriteCharacter) && !hasCastSelection);

  useEffect(() => {
    setDraft(createCheckInDraft(target.rating, target.reflection));
    setManualCharacterOpen(false);
  }, [target.id, target.rating, target.reflection]);

  useEffect(() => {
    onLoadCast(target.mediaType, target.id);
  }, [onLoadCast, target.id, target.mediaType]);

  const submit = async () => {
    if (isSaving) {
      return;
    }

    const saved = await onSave(target.mediaType, target.id, normalizeCheckInDraft(draft));

    if (saved) {
      onCancel();
    }
  };

  return (
    <View style={styles.checkInPage}>
      <AppText tone="accent" variant="caption">Watched</AppText>
      <AppText variant="section">How was it?</AppText>
      <AppText numberOfLines={2} tone="muted">{target.title}</AppText>

      {actionState.kind === "error" ? <AppText tone="danger">{actionState.message}</AppText> : null}

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = draft.rating === rating;

          return (
            <Pressable
              accessibilityLabel={`Rate ${rating} out of 5`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving, selected: isSelected }}
              disabled={isSaving}
              key={rating}
              onPress={() => {
                setDraft((current) => ({ ...current, rating }));
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

      <View style={styles.reactionRow}>
        {reactionOptions.map((option) => {
          const isSelected = draft.reaction === option.value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving, selected: isSelected }}
              disabled={isSaving}
              key={option.value}
              onPress={() => {
                setDraft((current) => ({ ...current, reaction: option.value }));
              }}
              style={[
                styles.reactionPill,
                isSelected ? styles.reactionPillSelected : null,
                isSaving ? styles.iconActionButtonDisabled : null,
              ]}
            >
              <AppText style={isSelected ? styles.reactionPillTextSelected : styles.reactionPillText} variant="caption">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.castPickerSection}>
        <AppText variant="button">Favorite character</AppText>
        <CastPicker
          castState={castState}
          disabled={isSaving}
          onSelect={(favoriteCharacter) => {
            setManualCharacterOpen(false);
            setDraft((current) => ({ ...current, favoriteCharacter }));
          }}
          selectedCharacter={draft.favoriteCharacter}
        />

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => setManualCharacterOpen((current) => !current)}
          style={[styles.manualCharacterButton, isSaving ? styles.iconActionButtonDisabled : null]}
        >
          <AppText style={styles.manualCharacterButtonText} variant="caption">
            {showManualCharacterInput ? "Hide manual entry" : "Character not listed"}
          </AppText>
        </Pressable>

        {showManualCharacterInput ? (
          <TextInput
            editable={!isSaving}
            onChangeText={(favoriteCharacter) => setDraft((current) => ({ ...current, favoriteCharacter }))}
            placeholder="Type character name"
            style={styles.checkInInput}
            value={draft.favoriteCharacter ?? ""}
          />
        ) : null}
      </View>

      <TextInput
        editable={!isSaving}
        multiline
        onChangeText={(comment) => setDraft((current) => ({ ...current, comment }))}
        placeholder="Optional comment"
        style={[styles.checkInInput, styles.checkInCommentInput]}
        value={draft.comment ?? ""}
      />

      <Button
        disabled={isSaving}
        isLoading={isSaving}
        label="Save check-in"
        loadingLabel="Saving"
        onPress={submit}
        size="small"
      />

      <Button
        disabled={isSaving}
        label="Skip"
        onPress={onCancel}
        size="small"
        variant="secondary"
      />
    </View>
  );
}

function CastPicker({
  castState,
  disabled,
  onSelect,
  selectedCharacter,
}: {
  castState: PostWatchCastState;
  disabled: boolean;
  onSelect: (favoriteCharacter: string) => void;
  selectedCharacter: string | null;
}) {
  if (castState.kind === "loading" || castState.kind === "idle") {
    return (
      <View style={styles.castPickerRow}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.castSkeleton}>
            <View style={styles.castImagePlaceholder} />
            <View style={styles.castSkeletonText} />
          </View>
        ))}
      </View>
    );
  }

  if (castState.kind === "error") {
    return <AppText tone="danger">{castState.message}</AppText>;
  }

  if (castState.items.length === 0) {
    return <AppText tone="muted">No cast found.</AppText>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.castPickerScroll}
    >
      <View style={styles.castPickerRow}>
        {castState.items.map((member) => {
          const isSelected = selectedCharacter === member.characterName;

          return (
            <Pressable
              accessibilityLabel={`Choose ${member.characterName}`}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected: isSelected }}
              disabled={disabled}
              key={`${member.id}:${member.characterName}`}
              onPress={() => onSelect(member.characterName)}
              style={[
                styles.castChoice,
                isSelected ? styles.castChoiceSelected : null,
                disabled ? styles.iconActionButtonDisabled : null,
              ]}
            >
              {member.profilePath ? (
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="cover"
                  source={{ uri: getTmdbProfileUrl(member.profilePath) }}
                  style={styles.castImage}
                />
              ) : (
                <View style={styles.castImagePlaceholder}>
                  <AppText style={styles.castImagePlaceholderText}>{getInitials(member.actorName)}</AppText>
                </View>
              )}

              <AppText
                numberOfLines={2}
                style={isSelected ? styles.castChoiceSelectedText : styles.castChoiceText}
                variant="caption"
              >
                {member.characterName}
              </AppText>
              <AppText numberOfLines={1} style={styles.castChoiceActor} variant="caption">
                {member.actorName}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}
